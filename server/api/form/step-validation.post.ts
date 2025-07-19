export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { stepId, data, endpoint, method, headers } = body

  // Validation des paramètres requis
  if (!stepId || !data || !endpoint) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Paramètres manquants: stepId, data et endpoint sont requis'
    })
  }

  try {
    // Effectuer l'appel vers l'API externe
    const response = await $fetch(endpoint, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: data
    })

    // Retourner la réponse de l'API externe
    return {
      success: true,
      data: response,
      message: 'Validation réussie'
    }
  } catch (error: any) {
    console.error('Erreur lors de la validation API étape:', error)
    
    // Gérer les différents types d'erreurs
    let statusCode = 500
    let message = 'Erreur lors de la validation'
    
    if (error.statusCode) {
      statusCode = error.statusCode
    }
    
    if (error.data?.message) {
      message = error.data.message
    } else if (error.message) {
      message = error.message
    }

    throw createError({
      statusCode,
      statusMessage: message,
      data: error.data
    })
  }
})
