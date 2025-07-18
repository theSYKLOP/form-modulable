import type { FormConfig } from '~/types/form'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Valide les données d'un formulaire
 */
export function validateFormConfig(data: any): ValidationResult {
  const errors: string[] = []

  // Validation du titre
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Le titre du formulaire est requis')
  }

  if (data.title && data.title.length > 255) {
    errors.push('Le titre ne peut pas dépasser 255 caractères')
  }

  // Validation de la description
  if (data.description && data.description.length > 1000) {
    errors.push('La description ne peut pas dépasser 1000 caractères')
  }

  // Validation du layout
  if (data.layout && !['VERTICAL', 'HORIZONTAL'].includes(data.layout)) {
    errors.push('Layout invalide (doit être VERTICAL ou HORIZONTAL)')
  }

  // Validation du spacing
  if (data.spacing && !['COMPACT', 'NORMAL', 'RELAXED'].includes(data.spacing)) {
    errors.push('Spacing invalide (doit être COMPACT, NORMAL ou RELAXED)')
  }

  // Validation des étapes
  if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
    errors.push('Au moins une étape est requise')
  } else {
    data.steps.forEach((step: any, index: number) => {
      if (!step.title || typeof step.title !== 'string' || step.title.trim().length === 0) {
        errors.push(`L'étape ${index + 1} doit avoir un titre`)
      }

      if (step.title && step.title.length > 255) {
        errors.push(`Le titre de l'étape ${index + 1} ne peut pas dépasser 255 caractères`)
      }

      // Validation des champs
      if (step.fields && Array.isArray(step.fields)) {
        step.fields.forEach((field: any, fieldIndex: number) => {
          const fieldErrors = validateField(field, `Étape ${index + 1}, Champ ${fieldIndex + 1}`)
          errors.push(...fieldErrors)
        })
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valide un champ individuel
 */
function validateField(field: any, context: string): string[] {
  const errors: string[] = []

  if (!field.name || typeof field.name !== 'string') {
    errors.push(`${context}: Le nom du champ est requis`)
  }

  if (!field.type || typeof field.type !== 'string') {
    errors.push(`${context}: Le type du champ est requis`)
  }

  if (!field.label || typeof field.label !== 'string' || field.label.trim().length === 0) {
    errors.push(`${context}: Le label du champ est requis`)
  }

  if (field.label && field.label.length > 255) {
    errors.push(`${context}: Le label ne peut pas dépasser 255 caractères`)
  }

  if (field.width && !['full', 'half', 'third', 'quarter'].includes(field.width)) {
    errors.push(`${context}: Largeur invalide`)
  }

  if (field.position && !['default', 'left', 'right', 'center'].includes(field.position)) {
    errors.push(`${context}: Position invalide`)
  }

  return errors
}

/**
 * Valide un ID
 */
export function validateId(id: string | undefined): ValidationResult {
  const errors: string[] = []

  if (!id) {
    errors.push('ID requis')
  } else if (typeof id !== 'string' || id.trim().length === 0) {
    errors.push('ID invalide')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}