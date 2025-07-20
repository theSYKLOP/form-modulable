// API endpoint pour nettoyer les doublons de formulaires
// GET /api/admin/cleanup-duplicates

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 Recherche des formulaires dupliqués...')
    
    // Trouver les formulaires avec le même titre et le même utilisateur
    const duplicateGroups = await prisma.$queryRaw`
      SELECT title, "userId", COUNT(*) as count, 
             STRING_AGG(id::text, ',') as ids,
             MIN("createdAt") as oldest_created
      FROM "forms" 
      GROUP BY title, "userId"
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    console.log('🔍 Groupes de doublons trouvés:', duplicateGroups)
    
    const cleanupActions = []
    
    for (const group of duplicateGroups) {
      const ids = group.ids.split(',')
      const formsInGroup = await prisma.form.findMany({
        where: { id: { in: ids } },
        orderBy: { createdAt: 'asc' }
      })
      
      // Garder le plus ancien, marquer les autres pour suppression
      const [keepForm, ...duplicates] = formsInGroup
      
      cleanupActions.push({
        title: group.title,
        userId: group.userId,
        totalCount: parseInt(group.count),
        keepFormId: keepForm.id,
        keepCreatedAt: keepForm.createdAt,
        duplicatesToDelete: duplicates.map(form => ({
          id: form.id,
          createdAt: form.createdAt
        }))
      })
    }
    
    return {
      success: true,
      data: {
        duplicateGroups: cleanupActions,
        totalDuplicates: cleanupActions.reduce((sum, group) => sum + group.duplicatesToDelete.length, 0),
        message: `${cleanupActions.length} groupe(s) de doublons trouvé(s)`
      }
    }
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la recherche des doublons:', error)
    
    return {
      success: false,
      message: 'Erreur lors de la recherche des doublons',
      error: error.message
    }
  }
})
