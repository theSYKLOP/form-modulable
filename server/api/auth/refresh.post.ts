import { verifyToken, generateToken } from '~/utils/auth'

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
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

    const token = authorization.substring(7)

    // Vérification du token JWT
    const decoded = verifyToken(token, jwtSecret)
    if (!decoded) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide'
      })
    }

    // Génération d'un nouveau token
    const newToken = generateToken(decoded.userId, jwtSecret)

    return {
      success: true,
      data: {
        token: newToken
      },
      message: 'Token rafraîchi avec succès'
    }

  } catch (error: any) {
    console.error('Erreur de rafraîchissement du token:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
