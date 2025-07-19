import { ref } from 'vue'
import type { StepApiConfig, FormField } from '~/types/form'

interface StepApiResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
}

export function useStepApi() {
  const isValidating = ref(false)
  const validationError = ref<string | null>(null)
  const validationSuccess = ref<string | null>(null)

  const validateStepWithApi = async (
    apiConfig: StepApiConfig, 
    formData: Record<string, any>,
    allFields: FormField[]
  ): Promise<boolean> => {
    if (!apiConfig.enabled || !apiConfig.endpoint) {
      return true
    }

    isValidating.value = true
    validationError.value = null
    validationSuccess.value = null

    try {
      // Préparer les données à envoyer selon les mappings
      const dataToSend: Record<string, any> = {}
      
      // Ajouter les paramètres statiques
      if (apiConfig.staticParams) {
        Object.assign(dataToSend, apiConfig.staticParams)
      }
      
      // Ajouter les champs mappés
      for (const mapping of apiConfig.fieldMappings) {
        if (mapping.fieldId && mapping.parameterName) {
          const field = allFields.find(f => f.id === mapping.fieldId)
          if (field && formData[field.name] !== undefined) {
            dataToSend[mapping.parameterName] = formData[field.name]
          }
        }
      }

      // Préparer les headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...apiConfig.headers
      }

      // Effectuer l'appel API via notre endpoint interne
      const response = await $fetch<StepApiResponse>('/api/form/step-validation', {
        method: 'POST',
        body: {
          stepId: 'step-validation',
          data: dataToSend,
          endpoint: apiConfig.endpoint,
          method: apiConfig.method,
          headers
        }
      })

      if (response.success) {
        validationSuccess.value = apiConfig.successMessage || 'Vérification réussie !'
        return true
      } else {
        validationError.value = response.message || apiConfig.errorMessage || 'Erreur lors de la vérification'
        return !apiConfig.validationRequired
      }
    } catch (error: any) {
      console.error('Erreur API étape:', error)
      
      let errorMessage = apiConfig.errorMessage || 'Erreur lors de la vérification'
      
      // Traiter les différents types d'erreurs
      if (error.statusCode === 422) {
        errorMessage = error.data?.message || 'Données invalides'
      } else if (error.statusCode === 400) {
        errorMessage = error.data?.message || 'Requête invalide'
      } else if (error.statusCode >= 500) {
        errorMessage = 'Erreur serveur, veuillez réessayer'
      }
      
      validationError.value = errorMessage
      
      // Si la validation est obligatoire, l'échec bloque la progression
      return !apiConfig.validationRequired
    } finally {
      isValidating.value = false
    }
  }

  const clearValidationState = () => {
    validationError.value = null
    validationSuccess.value = null
  }

  return {
    isValidating,
    validationError,
    validationSuccess,
    validateStepWithApi,
    clearValidationState
  }
}
