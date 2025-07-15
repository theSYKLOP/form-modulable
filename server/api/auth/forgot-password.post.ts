import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaClient } from '@prisma/client'
import { generateVerificationToken, generateExpirationDate, isValidEmail } from '~/utils/auth'

const prisma = new PrismaClient().$extends(withAccelerate())

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const { email } = await readBody(event)

    // Validation des données
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email requis'
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
        firstName: true,
        lastName: true
      }
    })

    // Pour des raisons de sécurité, on renvoie toujours un succès
    // même si l'utilisateur n'existe pas
    if (!user) {
      return {
        success: true,
        message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.'
      }
    }

    // Désactiver les anciens tokens de réinitialisation
    await prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        used: false,
        expires: { gt: new Date() }
      },
      data: { used: true }
    })

    // Génération du token de réinitialisation
    const resetToken = generateVerificationToken()
    const expirationDate = generateExpirationDate(60) // 1 heure

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expires: expirationDate
      }
    })

    // TODO: Envoyer l'email de réinitialisation
    // await sendPasswordResetEmail(user.email, resetToken, user.firstName)

    console.log(`Token de réinitialisation généré pour ${user.email}: ${resetToken}`)

    return {
      success: true,
      message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.'
    }

  } catch (error: any) {
    console.error('Erreur de demande de réinitialisation:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})