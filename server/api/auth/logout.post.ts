export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    // Récupération du token depuis l'en-tête Authorization
    const authorization = getHeader(event, 'authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token manquant'
      })
    }

    // TODO: Implémenter une blacklist des tokens si nécessaire
    // pour invalider les tokens côté serveur

    return {
      success: true,
      message: 'Déconnexion réussie'
    }

  } catch (error: any) {
    console.error('Erreur de déconnexion:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
