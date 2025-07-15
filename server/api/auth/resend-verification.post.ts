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
        lastName: true,
        emailVerified: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur non trouvé'
      })
    }

    // Vérifier si l'email n'est pas déjà vérifié
    if (user.emailVerified) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email déjà vérifié'
      })
    }

    // Vérifier la limite de renvoi (pas plus d'un email par minute)
    const recentVerification = await prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) } // 1 minute
      }
    })

    if (recentVerification) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Veuillez attendre avant de renvoyer un email de vérification'
      })
    }

    // Désactiver les anciens tokens de vérification
    await prisma.emailVerification.updateMany({
      where: {
        userId: user.id,
        verified: false,
        expires: { gt: new Date() }
      },
      data: { verified: true }
    })

    // Génération du nouveau token de vérification
    const verificationToken = generateVerificationToken()
    const expirationDate = generateExpirationDate(60 * 24) // 24 heures

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expires: expirationDate
      }
    })

    // TODO: Envoyer l'email de vérification
    // await sendVerificationEmail(user.email, verificationToken, user.firstName)

    console.log(`Token de vérification généré pour ${user.email}: ${verificationToken}`)

    return {
      success: true,
      message: 'Email de vérification renvoyé avec succès'
    }

  } catch (error: any) {
    console.error('Erreur de renvoi d\'email de vérification:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})