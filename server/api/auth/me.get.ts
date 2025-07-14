import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaClient } from '@prisma/client'
import { verifyToken, sanitizeUserData } from '~/utils/auth'

const prisma = new PrismaClient().$extends(withAccelerate())

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const { jwtSecret } = useRuntimeConfig()
    
    // Récupération du token depuis l'en-tête Authorization
    const authorization = getHeader(event, 'authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token manquant'
      })
    }

    const token = authorization.substring(7) // Supprime "Bearer "

    // Vérification du token JWT
    const decoded = verifyToken(token, jwtSecret)
    if (!decoded) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide'
      })
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur non trouvé'
      })
    }

    return {
      success: true,
      data: {
        user: sanitizeUserData(user)
      }
    }

  } catch (error: any) {
    console.error('Erreur de vérification du statut:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
