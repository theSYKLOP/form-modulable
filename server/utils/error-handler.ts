import { H3Event } from 'h3'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  timestamp: string
}

/**
 * Gestionnaire d'erreurs centralisé
 */
export function handleApiError(error: any, context: string = 'API'): never {
  console.error(`[${context}] Erreur:`, error)

  // Erreur Prisma
  if (error.code && error.code.startsWith('P')) {
    switch (error.code) {
      case 'P2002':
        throw createError({
          statusCode: 409,
          statusMessage: 'Une ressource avec ces données existe déjà'
        })
      case 'P2025':
        throw createError({
          statusCode: 404,
          statusMessage: 'Ressource non trouvée'
        })
      default:
        throw createError({
          statusCode: 500,
          statusMessage: 'Erreur de base de données'
        })
    }
  }

  // Erreur HTTP déjà formatée
  if (error.statusCode) {
    throw error
  }

  // Erreur générique
  throw createError({
    statusCode: 500,
    statusMessage: error.message || 'Erreur interne du serveur'
  })
}

/**
 * Formatte une réponse de succès
 */
export function formatSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }
}

/**
 * Formatte une réponse d'erreur
 */
export function formatErrorResponse(message: string, errors?: string[]): ApiResponse {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  }
}