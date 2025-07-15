import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaClient } from '@prisma/client'
import { generateToken, sanitizeUserData } from '~/utils/auth'

const prisma = new PrismaClient().$extends(withAccelerate())

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const { token } = await readBody(event)
    const { jwtSecret } = useRuntimeConfig()

    // Validation des données
    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token de vérification requis'
      })
    }

    // Recherche du token de vérification
    const emailVerification = await prisma.emailVerification.findFirst({
      where: {
        token,
        verified: false,
        expires: { gt: new Date() }
      },
      include: {
        user: {
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
        }
      }
    })

    if (!emailVerification) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token de vérification invalide ou expiré'
      })
    }

    // Vérifier si l'email n'est pas déjà vérifié
    if (emailVerification.user.emailVerified) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email déjà vérifié'
      })
    }

    // Mettre à jour l'utilisateur pour marquer l'email comme vérifié
    const updatedUser = await prisma.user.update({
      where: { id: emailVerification.userId },
      data: { emailVerified: new Date() },
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

    // Marquer le token comme vérifié
    await prisma.emailVerification.update({
      where: { id: emailVerification.id },
      data: { verified: true }
    })

    // Désactiver tous les autres tokens de vérification pour cet utilisateur
    await prisma.emailVerification.updateMany({
      where: {
        userId: emailVerification.userId,
        verified: false,
        id: { not: emailVerification.id }
      },
      data: { verified: true }
    })

    // Générer un nouveau token JWT
    const jwtToken = generateToken(updatedUser.id, jwtSecret)

    return {
      success: true,
      data: {
        user: sanitizeUserData(updatedUser),
        token: jwtToken
      },
      message: 'Email vérifié avec succès'
    }

  } catch (error: any) {
    console.error('Erreur de vérification d\'email:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})