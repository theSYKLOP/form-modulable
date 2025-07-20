// Script de suppression définitive des doublons
// node scripts/delete-duplicates.mjs

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️ SUPPRESSION DÉFINITIVE DES DOUBLONS')
  console.log('⚠️ Cette opération est IRRÉVERSIBLE !')
  
  try {
    // IDs spécifiques à supprimer (les plus récents, gardons le plus ancien)
    const duplicateIdsToDelete = [
      'cmdbbar0v0003660ve7h1ropj', // MODIFICATION TEST - 2ème
      'cmdbbauaz0005660v1tw1x7vl', // MODIFICATION TEST - 3ème
      // Ajoutez ici d'autres IDs si nécessaire
    ]
    
    console.log(`📋 IDs à supprimer: ${duplicateIdsToDelete.join(', ')}`)
    
    // Vérifier d'abord que ces formulaires existent
    const formsToDelete = await prisma.form.findMany({
      where: { id: { in: duplicateIdsToDelete } },
      select: { id: true, title: true, createdAt: true, userId: true }
    })
    
    console.log('\n📊 Formulaires qui seront supprimés :')
    for (const form of formsToDelete) {
      console.log(`   🗑️ ${form.id} - "${form.title}" - ${form.createdAt.toLocaleString()}`)
    }
    
    if (formsToDelete.length !== duplicateIdsToDelete.length) {
      console.log('\n⚠️ ATTENTION: Certains IDs n\'ont pas été trouvés dans la base de données')
      console.log(`   Demandés: ${duplicateIdsToDelete.length}`)
      console.log(`   Trouvés: ${formsToDelete.length}`)
    }
    
    // Suppression dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // D'abord supprimer les soumissions liées (si il y en a)
      const deletedSubmissions = await tx.formSubmission.deleteMany({
        where: { formId: { in: duplicateIdsToDelete } }
      })
      
      console.log(`📝 Soumissions supprimées: ${deletedSubmissions.count}`)
      
      // Ensuite supprimer les formulaires
      const deletedForms = await tx.form.deleteMany({
        where: { id: { in: duplicateIdsToDelete } }
      })
      
      return {
        deletedForms: deletedForms.count,
        deletedSubmissions: deletedSubmissions.count
      }
    })
    
    console.log(`\n✅ SUPPRESSION TERMINÉE:`)
    console.log(`   📝 Formulaires supprimés: ${result.deletedForms}`)
    console.log(`   📋 Soumissions supprimées: ${result.deletedSubmissions}`)
    
    // Vérifier qu'il ne reste plus de doublons
    console.log('\n🔍 Vérification post-suppression...')
    const remainingDuplicates = await prisma.$queryRaw`
      SELECT title, "userId", COUNT(*) as count
      FROM "forms" 
      GROUP BY title, "userId"
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ Plus aucun doublon détecté !')
    } else {
      console.log(`⚠️ ${remainingDuplicates.length} groupe(s) de doublons restant(s) :`)
      for (const group of remainingDuplicates) {
        console.log(`   📝 "${group.title}" - ${group.count} copies`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur fatale:', e)
    process.exit(1)
  })
