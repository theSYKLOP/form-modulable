// API endpoint pour supprimer les doublons de formulaires
// DELETE /api/admin/cleanup-duplicates

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { duplicateIds, confirm } = body
    
    if (!confirm) {
      return {
        success: false,
        message: 'Confirmation requise pour supprimer les doublons'
      }
    }
    
    if (!duplicateIds || !Array.isArray(duplicateIds) || duplicateIds.length === 0) {
      return {
        success: false,
        message: 'Aucun ID de formulaire fourni'
      }
    }
    
    console.log('🗑️ Suppression des doublons:', duplicateIds)
    
    // Supprimer les formulaires dupliqués dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // D'abord supprimer les soumissions liées (si il y en a)
      await tx.formSubmission.deleteMany({
        where: {
          formId: { in: duplicateIds }
        }
      })
      
      // Ensuite supprimer les formulaires
      const deletedForms = await tx.form.deleteMany({
        where: {
          id: { in: duplicateIds }
        }
      })
      
      return deletedForms
    })
    
    console.log('✅ Doublons supprimés:', result.count)
    
    return {
      success: true,
      data: {
        deletedCount: result.count,
        deletedIds: duplicateIds
      },
      message: `${result.count} formulaire(s) dupliqué(s) supprimé(s) avec succès`
    }
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression des doublons:', error)
    
    return {
      success: false,
      message: 'Erreur lors de la suppression des doublons',
      error: error.message
    }
  }
})
