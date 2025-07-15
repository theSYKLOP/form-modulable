import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaClient } from '@prisma/client'
import { hashPassword, isValidPassword } from '~/utils/auth'

const prisma = new PrismaClient().$extends(withAccelerate())

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const { token, password, confirmPassword } = await readBody(event)

    // Validation des données
    if (!token || !password || !confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token, mot de passe et confirmation requis'
      })
    }

    if (password !== confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Les mots de passe ne correspondent pas'
      })
    }

    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordValidation.errors.join(', ')
      })
    }

    // Recherche du token de réinitialisation
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expires: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!passwordReset) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token de réinitialisation invalide ou expiré'
      })
    }

    // Hachage du nouveau mot de passe
    const hashedPassword = await hashPassword(password)

    // Mise à jour du mot de passe utilisateur
    await prisma.user.update({
      where: { id: passwordReset.userId },
      data: { password: hashedPassword }
    })

    // Marquer le token comme utilisé
    await prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true }
    })

    // Désactiver tous les autres tokens de réinitialisation pour cet utilisateur
    await prisma.passwordReset.updateMany({
      where: {
        userId: passwordReset.userId,
        used: false,
        id: { not: passwordReset.id }
      },
      data: { used: true }
    })

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    }

  } catch (error: any) {
    console.error('Erreur de réinitialisation de mot de passe:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})