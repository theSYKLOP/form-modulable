import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaClient } from '@prisma/client'
import { verifyToken, isValidUsername, sanitizeUserData } from '~/utils/auth'

const prisma = new PrismaClient().$extends(withAccelerate())

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'PATCH') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const { firstName, lastName, username, avatar } = await readBody(event)
    const { jwtSecret } = useRuntimeConfig()

    // Récupération du token depuis l'en-tête Authorization
    const authorization = getHeader(event, 'authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token manquant'
      })
    }

    const token = authorization.substring(7)

    // Vérification du token JWT
    const decoded = verifyToken(token, jwtSecret)
    if (!decoded) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide'
      })
    }

    // Validation du nom d'utilisateur si fourni
    if (username && !isValidUsername(username)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères (lettres, chiffres, tirets et underscores uniquement)'
      })
    }

    // Vérification de l'unicité du nom d'utilisateur
    if (username) {
      const existingUsername = await prisma.user.findFirst({
        where: { 
          username: username.toLowerCase(),
          NOT: { id: decoded.userId }
        }
      })

      if (existingUsername) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Ce nom d\'utilisateur est déjà pris'
        })
      }
    }

    // Préparation des données à mettre à jour
    const updateData: any = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (username !== undefined) updateData.username = username?.toLowerCase()
    if (avatar !== undefined) updateData.avatar = avatar

    // Mise à jour de l'utilisateur
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
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

    return {
      success: true,
      data: {
        user: sanitizeUserData(user)
      },
      message: 'Profil mis à jour avec succès'
    }

  } catch (error: any) {
    console.error('Erreur de mise à jour du profil:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
