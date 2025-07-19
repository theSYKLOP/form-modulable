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
    let response
    
    // Gérer différentes méthodes HTTP
    if (method === 'GET') {
      // Pour GET, ajouter les paramètres dans l'URL
      const url = new URL(endpoint)
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.append(key, String(value))
        }
      })
      
      response = await $fetch(url.toString(), {
        method: 'GET',
        headers: {
          ...headers
        }
      })
    } else {
      // Pour POST/PUT/PATCH, envoyer les données dans le body
      response = await $fetch(endpoint, {
        method: method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: data
      })
    }

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
    
    // Erreur spécifique pour une mauvaise méthode HTTP
    if (error.statusCode === 404) {
      message = `Endpoint non trouvé. Vérifiez l'URL et la méthode HTTP (${method || 'POST'}). Pour les APIs comme agify.io, utilisez la méthode GET.`
    } else if (error.statusCode === 405) {
      message = `Méthode HTTP non autorisée. Essayez de changer la méthode HTTP (actuellement: ${method || 'POST'}).`
    } else if (error.statusCode) {
      statusCode = error.statusCode
    }
    
    if (error.data?.message) {
      message = error.data.message
    } else if (error.message && !message.includes('Endpoint non trouvé')) {
      message = error.message
    }

    throw createError({
      statusCode,
      statusMessage: message,
      data: error.data
    })
  }
})
