// Script de nettoyage des doublons
// node scripts/cleanup-duplicates.mjs

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Recherche des formulaires dupliqués...')
  
  try {
    // Trouver les formulaires avec le même titre et le même utilisateur
    const duplicateGroups = await prisma.$queryRaw`
      SELECT title, "userId", COUNT(*) as count, 
             array_agg(id ORDER BY "createdAt" ASC) as ids,
             array_agg("createdAt" ORDER BY "createdAt" ASC) as created_dates
      FROM "forms" 
      GROUP BY title, "userId"
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    console.log(`📊 ${duplicateGroups.length} groupe(s) de doublons trouvé(s)`)
    
    if (duplicateGroups.length === 0) {
      console.log('✅ Aucun doublon trouvé !')
      return
    }
    
    for (const group of duplicateGroups) {
      console.log(`\n📝 Formulaire: "${group.title}"`)
      console.log(`   👤 Utilisateur ID: ${group.userId}`)
      console.log(`   📊 Nombre de doublons: ${group.count}`)
      console.log(`   🆔 IDs: ${group.ids.join(', ')}`)
      console.log(`   📅 Dates: ${group.created_dates.map(d => new Date(d).toLocaleString()).join(', ')}`)
      
      // Garder le premier (plus ancien), supprimer les autres
      const [keepId, ...duplicateIds] = group.ids
      
      if (duplicateIds.length > 0) {
        console.log(`   ✅ Garder: ${keepId}`)
        console.log(`   🗑️ Supprimer: ${duplicateIds.join(', ')}`)
        
        // Décommenter les lignes suivantes pour effectuer la suppression réelle
        /*
        const deletedCount = await prisma.form.deleteMany({
          where: {
            id: { in: duplicateIds }
          }
        })
        console.log(`   ✅ ${deletedCount.count} formulaire(s) supprimé(s)`)
        */
      }
    }
    
    console.log('\n🚨 ATTENTION: Ce script n\'a fait qu\'identifier les doublons.')
    console.log('💡 Pour supprimer réellement les doublons, décommentez les lignes de suppression dans le script.')
    console.log('🔧 Ou utilisez l\'API /api/admin/cleanup-duplicates depuis l\'interface admin.')
    
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
