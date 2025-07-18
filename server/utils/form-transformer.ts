import type { FormConfig } from '~/types/form'

/**
 * Transforme les données Prisma en FormConfig
 */
export function transformPrismaToFormConfig(prismaForm: any): FormConfig {
  if (!prismaForm) {
    throw new Error('Données de formulaire invalides')
  }

  return {
    id: prismaForm.id,
    title: prismaForm.title,
    description: prismaForm.description || '',
    layout: prismaForm.layout as 'VERTICAL' | 'HORIZONTAL',
    spacing: prismaForm.spacing as 'COMPACT' | 'NORMAL' | 'RELAXED',
    steps: (prismaForm.steps || [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((step: any) => ({
        id: step.id,
        title: step.title,
        description: step.description || '',
        order: step.order,
        fields: (step.fields || [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((field: any) => ({
            id: field.id,
            name: field.name,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder || undefined,
            helpText: field.helpText || undefined,
            defaultValue: field.defaultValue || undefined,
            validation: safeJSONParse(field.validation),
            options: safeJSONParse(field.options) || [],
            width: field.width || 'full',
            order: field.order,
            stepId: field.stepId,
            required: Boolean(field.required),
            disabled: Boolean(field.disabled),
            readonly: Boolean(field.readonly),
            class: field.class || undefined,
            icon: field.icon || undefined,
            prefix: field.prefix || undefined,
            suffix: field.suffix || undefined,
            conditionalLogic: safeJSONParse(field.conditionalLogic),
            hasApi: Boolean(field.hasApi),
            apiConfig: safeJSONParse(field.apiConfig),
            min: field.min || undefined,
            max: field.max || undefined,
            accept: field.accept || undefined,
            step: field.step || undefined,
            multiple: Boolean(field.multiple),
            rows: field.rows || undefined,
            position: field.position || 'default'
          }))
      }))
  }
}

/**
 * Parse JSON de manière sécurisée
 */
export function safeJSONParse(jsonString: string | null): any {
  if (!jsonString) return undefined
  
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('Erreur parsing JSON:', error, 'String:', jsonString)
    return undefined
  }
}

/**
 * Stringify JSON de manière sécurisée
 */
export function safeJSONStringify(obj: any): string | null {
  if (!obj || obj === undefined) return null
  
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.warn('Erreur stringify JSON:', error)
    return null
  }
}