import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaClient } from '@prisma/client'
import { hashPassword, generateToken, generateVerificationToken, generateExpirationDate, isValidEmail, isValidPassword, isValidUsername, sanitizeUserData } from '~/utils/auth'

const prisma = new PrismaClient().$extends(withAccelerate())

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const { email, password, confirmPassword, firstName, lastName, username } = await readBody(event)
    const { jwtSecret } = useRuntimeConfig()

    // Validation des données
    if (!email || !password || !confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, mot de passe et confirmation requis'
      })
    }

    if (!isValidEmail(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Format d\'email invalide'
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

    if (username && !isValidUsername(username)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères (lettres, chiffres, tirets et underscores uniquement)'
      })
    }

    // Vérification de l'unicité de l'email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Un compte avec cet email existe déjà'
      })
    }

    // Vérification de l'unicité du nom d'utilisateur
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: username.toLowerCase() }
      })

      if (existingUsername) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Ce nom d\'utilisateur est déjà pris'
        })
      }
    }

    // Hachage du mot de passe
    const hashedPassword = await hashPassword(password)

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username?.toLowerCase(),
        firstName,
        lastName,
        password: hashedPassword,
        lastLoginAt: new Date()
      },
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

    // Génération du token de vérification d'email
    const verificationToken = generateVerificationToken()
    const expirationDate = generateExpirationDate(60 * 24) // 24 heures

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expires: expirationDate
      }
    })

    // Génération du token JWT
    const token = generateToken(user.id, jwtSecret)

    // TODO: Envoyer l'email de vérification
    // await sendVerificationEmail(user.email, verificationToken)

    return {
      success: true,
      data: {
        user: sanitizeUserData(user),
        token
      },
      message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.'
    }

  } catch (error: any) {
    console.error('Erreur d\'inscription:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
