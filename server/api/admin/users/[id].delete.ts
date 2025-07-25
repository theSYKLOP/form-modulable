import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification et les permissions admin
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token d\'authentification manquant'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (!decoded.userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide'
      })
    }

    // Vérifier que l'utilisateur est admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, id: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Permissions administrateur requises'
      })
    }

    const userId = getRouterParam(event, 'id')

    // Empêcher l'admin de se supprimer lui-même
    if (userId === adminUser.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Vous ne pouvez pas supprimer votre propre compte'
      })
    }

    // Vérifier que l'utilisateur existe
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true,
        role: true,
        _count: {
          select: {
            forms: true,
            formSubmissions: true
          }
        }
      }
    })

    if (!userToDelete) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur introuvable'
      })
    }

    // Supprimer l'utilisateur et toutes ses données associées
    await prisma.user.delete({
      where: { id: userId }
    })

    return {
      success: true,
      message: `Utilisateur ${userToDelete.email} supprimé avec succès`,
      data: {
        deletedUser: userToDelete
      }
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la suppression de l\'utilisateur'
    })
  } finally {
    await prisma.$disconnect()
  }
})
