import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaClient } from '@prisma/client'
import { verifyToken, verifyPassword, hashPassword, isValidPassword, sanitizeUserData } from '~/utils/auth'

const prisma = new PrismaClient().$extends(withAccelerate())

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const { currentPassword, newPassword, confirmPassword } = await readBody(event)
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

    // Validation des données
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Mot de passe actuel, nouveau mot de passe et confirmation requis'
      })
    }

    if (newPassword !== confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Les nouveaux mots de passe ne correspondent pas'
      })
    }

    const passwordValidation = isValidPassword(newPassword)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordValidation.errors.join(', ')
      })
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        password: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur non trouvé'
      })
    }

    // Vérification du mot de passe actuel
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Mot de passe actuel incorrect'
      })
    }

    // Hachage du nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword)

    // Mise à jour du mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })

    return {
      success: true,
      message: 'Mot de passe modifié avec succès'
    }

  } catch (error: any) {
    console.error('Erreur de changement de mot de passe:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
