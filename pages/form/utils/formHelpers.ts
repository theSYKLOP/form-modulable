import type { FormField, FormStep, FormConfig, FieldValidation } from '../../../types/form'

/**
 * Génère un ID unique pour les formulaires, étapes et champs
 */
export const generateId = (prefix: string = 'item'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Génère un ID unique pour les formulaires
 */
export const generateFormId = (): string => generateId('form')

/**
 * Génère un ID unique pour les étapes
 */
export const generateStepId = (): string => generateId('step')

/**
 * Génère un ID unique pour les champs
 */
export const generateFieldId = (): string => generateId('field')

/**
 * Valide les données d'un champ
 */
export const validateField = (field: FormField, value: any): string[] => {
  const errors: string[] = []
  
  if (!field.validation) return errors
  
  const validation = field.validation
  
  // Champ obligatoire
  if (validation.required && (!value || value === '')) {
    errors.push('Ce champ est obligatoire')
  }
  
  // Si pas de valeur et pas obligatoire, pas d'autres validations
  if (!value && !validation.required) return errors
  
  // Validation des longueurs pour les chaînes
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      errors.push(`Minimum ${validation.minLength} caractères requis`)
    }
    
    if (validation.maxLength && value.length > validation.maxLength) {
      errors.push(`Maximum ${validation.maxLength} caractères autorisés`)
    }
    
    // Validation email
    if (validation.email && !isValidEmail(value)) {
      errors.push('Format email invalide')
    }
    
    // Validation pattern
    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      errors.push('Format invalide')
    }
  }
  
  // Validation des nombres
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = Number(value)
    
    if (validation.min !== undefined && numValue < validation.min) {
      errors.push(`Valeur minimum : ${validation.min}`)
    }
    
    if (validation.max !== undefined && numValue > validation.max) {
      errors.push(`Valeur maximum : ${validation.max}`)
    }
  }
  
  return errors
}

/**
 * Valide une adresse email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide toutes les données d'un formulaire
 */
export const validateForm = (config: FormConfig, formData: Record<string, any>): Record<string, string[]> => {
  const errors: Record<string, string[]> = {}
  
  config.steps.forEach(step => {
    step.fields.forEach(field => {
      const value = formData[field.id]
      const fieldErrors = validateField(field, value)
      
      if (fieldErrors.length > 0) {
        errors[field.id] = fieldErrors
      }
    })
  })
  
  return errors
}

/**
 * Calcule le pourcentage de complétion d'un formulaire
 */
export const calculateFormCompletion = (config: FormConfig, formData: Record<string, any>): number => {
  const allFields = config.steps.flatMap(step => step.fields)
  const requiredFields = allFields.filter(field => field.validation?.required)
  
  if (requiredFields.length === 0) return 100
  
  const completedFields = requiredFields.filter(field => {
    const value = formData[field.id]
    return value !== undefined && value !== null && value !== ''
  })
  
  return Math.round((completedFields.length / requiredFields.length) * 100)
}

/**
 * Calcule le pourcentage de complétion d'une étape
 */
export const calculateStepCompletion = (step: FormStep, formData: Record<string, any>): number => {
  const requiredFields = step.fields.filter(field => field.validation?.required)
  
  if (requiredFields.length === 0) return 100
  
  const completedFields = requiredFields.filter(field => {
    const value = formData[field.id]
    return value !== undefined && value !== null && value !== ''
  })
  
  return Math.round((completedFields.length / requiredFields.length) * 100)
}

/**
 * Trouve un champ par son ID dans toute la configuration
 */
export const findFieldById = (config: FormConfig, fieldId: string): FormField | null => {
  for (const step of config.steps) {
    const field = step.fields.find(f => f.id === fieldId)
    if (field) return field
  }
  return null
}

/**
 * Trouve une étape par son ID
 */
export const findStepById = (config: FormConfig, stepId: string): FormStep | null => {
  return config.steps.find(step => step.id === stepId) || null
}

/**
 * Réordonne les champs d'une étape
 */
export const reorderStepFields = (step: FormStep): FormStep => {
  const reorderedFields = step.fields
    .sort((a, b) => a.order - b.order)
    .map((field, index) => ({ ...field, order: index }))
  
  return { ...step, fields: reorderedFields }
}

/**
 * Réordonne toutes les étapes du formulaire
 */
export const reorderFormSteps = (config: FormConfig): FormConfig => {
  const reorderedSteps = config.steps
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({ ...step, order: index }))
  
  return { ...config, steps: reorderedSteps }
}

/**
 * Clone un champ avec un nouvel ID
 */
export const cloneField = (field: FormField): FormField => {
  return {
    ...field,
    id: generateFieldId(),
    label: `${field.label} (copie)`,
    order: field.order + 1
  }
}

/**
 * Clone une étape avec un nouvel ID
 */
export const cloneStep = (step: FormStep): FormStep => {
  return {
    ...step,
    id: generateStepId(),
    title: `${step.title} (copie)`,
    order: step.order + 1,
    fields: step.fields.map(field => ({
      ...field,
      id: generateFieldId(),
      stepId: step.id
    }))
  }
}

/**
 * Nettoie la configuration du formulaire en supprimant les propriétés inutiles
 */
export const cleanFormConfig = (config: FormConfig): FormConfig => {
  return {
    ...config,
    steps: config.steps.map(step => ({
      ...step,
      fields: step.fields.map(field => {
        const cleanField: FormField = {
          id: field.id,
          name: field.name,
          type: field.type,
          label: field.label,
          stepId: field.stepId,
          order: field.order,
          width: field.width || 'full'
        }
        
        // Ajouter les propriétés conditionnelles
        if (field.placeholder) cleanField.placeholder = field.placeholder
        if (field.helpText) cleanField.helpText = field.helpText
        if (field.defaultValue !== undefined) cleanField.defaultValue = field.defaultValue
        if (field.validation) cleanField.validation = field.validation
        if (field.options && field.options.length > 0) cleanField.options = field.options
        if (field.apiConfig) cleanField.apiConfig = field.apiConfig
        if (field.required) cleanField.required = field.required
        
        return cleanField
      })
    }))
  }
}

/**
 * Convertit la configuration en format pour l'API
 */
export const configToApiFormat = (config: FormConfig) => {
  return {
    title: config.title,
    description: config.description,
    layout: config.layout,
    spacing: config.spacing,
    steps: config.steps.map(step => ({
      title: step.title,
      description: step.description,
      order: step.order,
      fields: step.fields.map(field => ({
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        helpText: field.helpText,
        defaultValue: field.defaultValue,
        validation: field.validation,
        options: field.options,
        width: field.width,
        order: field.order,
        required: field.required,
        apiConfig: field.apiConfig
      }))
    }))
  }
}

/**
 * Convertit les données de l'API en configuration utilisable
 */
export const apiFormatToConfig = (apiData: any): FormConfig => {
  return {
    id: apiData.id || generateFormId(),
    title: apiData.title || 'Nouveau formulaire',
    description: apiData.description || '',
    layout: apiData.layout || 'VERTICAL',
    spacing: apiData.spacing || 'NORMAL',
    steps: apiData.steps?.map((step: any, stepIndex: number) => ({
      id: generateStepId(),
      title: step.title || `Étape ${stepIndex + 1}`,
      description: step.description || '',
      order: step.order ?? stepIndex,
      fields: step.fields?.map((field: any, fieldIndex: number) => ({
        id: generateFieldId(),
        stepId: step.id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        helpText: field.helpText,
        defaultValue: field.defaultValue,
        validation: field.validation,
        options: field.options,
        width: field.width || 'full',
        order: field.order ?? fieldIndex,
        required: field.required,
        apiConfig: field.apiConfig
      })) || []
    })) || []
  }
}

/**
 * Sauvegarde locale du formulaire en cours
 */
export const saveFormToLocalStorage = (config: FormConfig, key: string = 'form-builder-draft'): void => {
  try {
    const data = {
      config,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Impossible de sauvegarder dans localStorage:', error)
  }
}

/**
 * Récupération du formulaire depuis le localStorage
 */
export const loadFormFromLocalStorage = (key: string = 'form-builder-draft'): FormConfig | null => {
  try {
    const data = localStorage.getItem(key)
    if (!data) return null
    
    const parsed = JSON.parse(data)
    return parsed.config
  } catch (error) {
    console.warn('Impossible de charger depuis localStorage:', error)
    return null
  }
}

/**
 * Supprime le brouillon du localStorage
 */
export const clearFormDraft = (key: string = 'form-builder-draft'): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Impossible de supprimer le brouillon:', error)
  }
}

/**
 * Formate une valeur selon le type de champ
 */
export const formatFieldValue = (field: FormField, value: any): string => {
  if (value === null || value === undefined) return ''
  
  switch (field.type) {
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'datetime-local':
      return new Date(value).toLocaleString()
    case 'number':
    case 'range':
      return value.toString()
    case 'checkbox':
      return Array.isArray(value) ? value.join(', ') : value
    case 'switch':
      return value ? 'Activé' : 'Désactivé'
    default:
      return value.toString()
  }
}

/**
 * Exporte la configuration du formulaire en JSON
 */
export const exportFormConfig = (config: FormConfig): string => {
  return JSON.stringify(cleanFormConfig(config), null, 2)
}

/**
 * Importe une configuration depuis un JSON
 */
export const importFormConfig = (jsonString: string): FormConfig => {
  try {
    const parsed = JSON.parse(jsonString)
    return apiFormatToConfig(parsed)
  } catch (error) {
    throw new Error('Format JSON invalide')
  }
}

/**
 * Vérifie si une configuration est valide
 */
export const isValidFormConfig = (config: any): boolean => {
  return (
    config &&
    typeof config === 'object' &&
    typeof config.title === 'string' &&
    Array.isArray(config.steps) &&
    config.steps.every((step: any) => 
      step &&
      typeof step.title === 'string' &&
      Array.isArray(step.fields) &&
      step.fields.every((field: any) => 
        field &&
        typeof field.label === 'string' &&
        typeof field.type === 'string'
      )
    )
  )
}

/**
 * Crée une configuration de formulaire vide
 */
export const createEmptyFormConfig = (): FormConfig => {
  const firstStep: FormStep = {
    id: generateStepId(),
    title: 'Étape 1',
    description: '',
    order: 0,
    fields: []
  }
  
  return {
    id: generateFormId(),
    title: 'Nouveau formulaire',
    description: '',
    layout: 'VERTICAL',
    spacing: 'NORMAL',
    steps: [firstStep]
  }
}

/**
 * Obtient les statistiques d'un formulaire
 */
export const getFormStats = (config: FormConfig) => {
  const totalFields = config.steps.reduce((sum, step) => sum + step.fields.length, 0)
  const requiredFields = config.steps.reduce((sum, step) => 
    sum + step.fields.filter(f => f.validation?.required).length, 0
  )
  const fieldTypes = config.steps.reduce((acc, step) => {
    step.fields.forEach(field => {
      acc[field.type] = (acc[field.type] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalSteps: config.steps.length,
    totalFields,
    requiredFields,
    optionalFields: totalFields - requiredFields,
    fieldTypes,
    avgFieldsPerStep: totalFields > 0 ? Math.round(totalFields / config.steps.length) : 0
  }
}