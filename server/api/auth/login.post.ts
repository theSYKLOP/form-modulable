import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaClient } from '@prisma/client'
import { hashPassword, verifyPassword, generateToken, isValidEmail, sanitizeUserData } from '~/utils/auth'

const prisma = new PrismaClient().$extends(withAccelerate())

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const { email, password } = await readBody(event)
    const { jwtSecret } = useRuntimeConfig()

    // Validation des données
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email et mot de passe requis'
      })
    }

    if (!isValidEmail(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Format d\'email invalide'
      })
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        password: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email ou mot de passe incorrect'
      })
    }

    // Vérification du mot de passe
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email ou mot de passe incorrect'
      })
    }

    // Génération du token JWT
    const token = generateToken(user.id, jwtSecret)

    // Mise à jour de la date de dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Nettoyage des données utilisateur
    const sanitizedUser = sanitizeUserData(user)

    return {
      success: true,
      data: {
        user: sanitizedUser,
        token
      }
    }

  } catch (error: any) {
    console.error('Erreur de connexion:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
