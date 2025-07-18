import { ref, computed } from 'vue'
import type { FormConfig, FormStep, FormField, FormFieldData, FieldWidth } from '../../../types/form'
import { generateStepId, generateFieldId } from '../utils/formHelpers'

export function useFormBuilder() {
  const formConfig = ref<FormConfig>({
    id: '',
    title: 'Nouveau formulaire',
    description: '',
    steps: [
      {
        id: generateStepId(),
        title: 'Étape 1',
        description: '',
        order: 0,
        fields: []
      }
    ],
    layout: 'VERTICAL',
    spacing: 'NORMAL'
  })

  const activeStepIndex = ref(0)
  const selectedFieldId = ref<string | null>(null)

  const activeStep = computed(() => formConfig.value.steps[activeStepIndex.value])
  
  const canAddStep = computed(() => formConfig.value.steps.length < 10)
  const canDeleteStep = computed(() => formConfig.value.steps.length > 1)

  // Gestion des étapes
  const addStep = () => {
    const newStep: FormStep = {
      id: generateStepId(),
      title: `Étape ${formConfig.value.steps.length + 1}`,
      description: '',
      order: formConfig.value.steps.length,
      fields: []
    }
    formConfig.value.steps.push(newStep)
    activeStepIndex.value = formConfig.value.steps.length - 1
  }

  const deleteStep = (stepId: string) => {
    const index = formConfig.value.steps.findIndex(s => s.id === stepId)
    if (index > -1 && canDeleteStep.value) {
      formConfig.value.steps.splice(index, 1)
      if (activeStepIndex.value >= formConfig.value.steps.length) {
        activeStepIndex.value = formConfig.value.steps.length - 1
      }
    }
  }

  const updateStepTitle = (stepId: string, title: string, description?: string) => {
    const step = formConfig.value.steps.find(s => s.id === stepId)
    if (step) {
      step.title = title
      if (description !== undefined) {
        step.description = description
      }
    }
  }

  // Gestion des champs - Support FormFieldData et FormField
  const addField = (fieldData: Partial<FormFieldData> | FormField) => {
    if (!activeStep.value) return
    
    // Convertir FormFieldData en FormField si nécessaire
    const newField: FormField = {
      id: fieldData.id || generateFieldId(),
      stepId: activeStep.value.id,
      order: fieldData.order ?? activeStep.value.fields.length,
      name: fieldData.name || `field_${Date.now()}`,
      type: fieldData.type!,
      label: fieldData.label || 'Nouveau champ',
      placeholder: fieldData.placeholder,
      helpText: fieldData.helpText,
      defaultValue: fieldData.defaultValue,
      width: fieldData.width || 'full',
      position: fieldData.position || 'default',
      disabled: fieldData.disabled || false,
      readonly: fieldData.readonly || false,
      class: fieldData.class || '',
      icon: fieldData.icon,
      prefix: fieldData.prefix,
      suffix: fieldData.suffix,
      rows: fieldData.rows,
      accept: fieldData.accept,
      multiple: fieldData.multiple || false,
      min: fieldData.min,
      max: fieldData.max,
      step: fieldData.step,
      validation: fieldData.validation || { required: false },
      conditionalLogic: fieldData.conditionalLogic,
      apiConfig: fieldData.apiConfig,
      options: fieldData.options || []
    }
    
    activeStep.value.fields.push(newField)
    selectedFieldId.value = newField.id
    
    // Réordonner si nécessaire
    reorderFields(activeStep.value)
  }

  // Nouvelle fonction pour ajouter un champ à une position spécifique
  const addFieldAtPosition = (fieldData: Partial<FormFieldData>, position: number) => {
    if (!activeStep.value) return
    
    // Décaler les champs suivants
    activeStep.value.fields.forEach(f => {
      if (f.order >= position) {
        f.order += 1
      }
    })
    
    // Ajouter le nouveau champ avec la position spécifiée
    const fieldWithPosition = { ...fieldData, order: position }
    addField(fieldWithPosition)
  }

  const updateField = (fieldId: string, updates: Partial<FormField | FormFieldData>) => {
    const field = findFieldById(fieldId)
    if (field) {
      // Mise à jour intelligente en préservant la structure FormField
      Object.assign(field, updates)
      
      // Réordonner si l'ordre a changé
      if (updates.order !== undefined) {
        const step = formConfig.value.steps.find(s => s.id === field.stepId)
        if (step) reorderFields(step)
      }
    }
  }

  const deleteField = (fieldId: string) => {
    const stepIndex = formConfig.value.steps.findIndex(step => 
      step.fields.some(f => f.id === fieldId)
    )
    if (stepIndex > -1) {
      const fieldIndex = formConfig.value.steps[stepIndex].fields.findIndex(f => f.id === fieldId)
      if (fieldIndex > -1) {
        formConfig.value.steps[stepIndex].fields.splice(fieldIndex, 1)
        // Réordonner les champs
        reorderFields(formConfig.value.steps[stepIndex])
        
        // Désélectionner si c'était le champ sélectionné
        if (selectedFieldId.value === fieldId) {
          selectedFieldId.value = null
        }
      }
    }
  }

  const duplicateField = (fieldId: string) => {
    const field = findFieldById(fieldId)
    if (field) {
      const duplicated: Partial<FormFieldData> = {
        ...field,
        id: generateFieldId(),
        name: `${field.name}_copy_${Date.now()}`,
        label: `${field.label} (copie)`,
        order: field.order + 1
      }
      
      const step = formConfig.value.steps.find(s => s.id === field.stepId)
      if (step) {
        // Décaler les champs suivants
        step.fields.forEach(f => {
          if (f.order > field.order) {
            f.order += 1
          }
        })
        
        addField(duplicated)
        selectedFieldId.value = duplicated.id!
      }
    }
  }

  // Nouvelle fonction pour réorganiser les champs par largeur
  const organizeFieldsByWidth = (step: FormStep) => {
    const organized = []
    const fields = [...step.fields].sort((a, b) => a.order - b.order)
    
    let currentRow: FormField[] = []
    let currentRowWidth = 0
    
    for (const field of fields) {
      const fieldWidth = getFieldWidthValue(field.width)
      
      if (currentRowWidth + fieldWidth > 1 || currentRow.length === 0) {
        if (currentRow.length > 0) {
          organized.push([...currentRow])
        }
        currentRow = [field]
        currentRowWidth = fieldWidth
      } else {
        currentRow.push(field)
        currentRowWidth += fieldWidth
      }
    }
    
    if (currentRow.length > 0) {
      organized.push(currentRow)
    }
    
    return organized
  }

  // Fonction pour calculer la valeur numérique de la largeur
  const getFieldWidthValue = (width?: FieldWidth): number => {
    switch (width) {
      case 'quarter': return 0.25
      case 'third': return 0.33
      case 'half': return 0.5
      case 'full':
      default: return 1
    }
  }

  // Fonction pour réordonner les champs d'une étape
  const reorderFields = (step: FormStep) => {
    step.fields.sort((a, b) => a.order - b.order)
    step.fields.forEach((field, index) => {
      field.order = index
    })
  }

  // Fonction pour évaluer les conditions d'affichage
  const evaluateFieldVisibility = (field: FormField, formValues: Record<string, any>): boolean => {
    if (!field.conditionalLogic?.enabled || !field.conditionalLogic.rules.length) {
      return true
    }
    
    const { rules, action, logicalOperator } = field.conditionalLogic
    
    const results = rules.map(rule => {
      const targetValue = formValues[rule.targetFieldId]
      
      switch (rule.operator) {
        case 'equals':
          return targetValue === rule.value
        case 'not_equals':
          return targetValue !== rule.value
        case 'contains':
          return String(targetValue || '').includes(String(rule.value || ''))
        case 'not_contains':
          return !String(targetValue || '').includes(String(rule.value || ''))
        case 'empty':
          return !targetValue || (Array.isArray(targetValue) && targetValue.length === 0)
        case 'not_empty':
          return !!targetValue && (!Array.isArray(targetValue) || targetValue.length > 0)
        case 'greater_than':
          return Number(targetValue) > Number(rule.value)
        case 'less_than':
          return Number(targetValue) < Number(rule.value)
        default:
          return true
      }
    })
    
    const conditionMet = logicalOperator === 'AND' 
      ? results.every(Boolean) 
      : results.some(Boolean)
    
    return action === 'show' ? conditionMet : !conditionMet
  }

  // Fonction pour obtenir les champs visibles selon les conditions
  const getVisibleFields = (step: FormStep, formValues: Record<string, any> = {}): FormField[] => {
    return step.fields.filter(field => evaluateFieldVisibility(field, formValues))
  }

  // Fonction pour obtenir tous les champs disponibles pour les conditions
  const getAvailableFieldsForConditions = (excludeFieldId?: string) => {
    const fields: { id: string; label: string; type: string }[] = []
    
    formConfig.value.steps.forEach(step => {
      step.fields.forEach(field => {
        if (field.id !== excludeFieldId) {
          fields.push({
            id: field.id,
            label: field.label,
            type: field.type
          })
        }
      })
    })
    
    return fields
  }

  // Fonction pour valider un formulaire
  const validateForm = (formValues: Record<string, any>) => {
    const errors: Record<string, string[]> = {}
    
    formConfig.value.steps.forEach(step => {
      const visibleFields = getVisibleFields(step, formValues)
      
      visibleFields.forEach(field => {
        const fieldErrors: string[] = []
        const value = formValues[field.id]
        
        // Validation required
        if (field.validation?.required && (!value || (Array.isArray(value) && value.length === 0))) {
          fieldErrors.push('Ce champ est obligatoire')
        }
        
        // Validation min/max pour les nombres
        if (field.type === 'number' && value !== undefined && value !== '') {
          const numValue = Number(value)
          if (field.min !== undefined && numValue < field.min) {
            fieldErrors.push(`La valeur doit être supérieure ou égale à ${field.min}`)
          }
          if (field.max !== undefined && numValue > field.max) {
            fieldErrors.push(`La valeur doit être inférieure ou égale à ${field.max}`)
          }
        }
        
        // Validation email
        if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          fieldErrors.push('Format d\'email invalide')
        }
        
        if (fieldErrors.length > 0) {
          errors[field.id] = fieldErrors
        }
      })
    })
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // Utilitaires
  const findFieldById = (fieldId: string): FormField | undefined => {
    for (const step of formConfig.value.steps) {
      const field = step.fields.find(f => f.id === fieldId)
      if (field) return field
    }
    return undefined
  }

  const getStepByFieldId = (fieldId: string): FormStep | undefined => {
    return formConfig.value.steps.find(step => 
      step.fields.some(f => f.id === fieldId)
    )
  }

  // Fonction pour cloner une configuration de formulaire
  const cloneFormConfig = (): FormConfig => {
    return JSON.parse(JSON.stringify(formConfig.value))
  }

  // Sauvegarde avec validation
  const saveForm = async () => {
    try {
      // Valider la configuration avant la sauvegarde
      const configToSave = cloneFormConfig()
      
      // S'assurer que tous les champs ont des IDs uniques
      configToSave.steps.forEach(step => {
        step.fields.forEach(field => {
          if (!field.id) {
            field.id = generateFieldId()
          }
        })
      })
      
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configToSave)
      }).then(res => res.json())
      return response
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      throw error
    }
  }

  // Fonction pour exporter la configuration
  const exportFormConfig = () => {
    const config = cloneFormConfig()
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `form-config-${config.title.replace(/\s+/g, '-').toLowerCase()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Fonction pour importer une configuration
  const importFormConfig = (configData: FormConfig) => {
    // Valider la structure
    if (!configData.steps || !Array.isArray(configData.steps)) {
      throw new Error('Configuration invalide')
    }
    
    formConfig.value = { ...configData }
    activeStepIndex.value = 0
    selectedFieldId.value = null
  }

  return {
    // État
    formConfig,
    activeStepIndex,
    selectedFieldId,
    activeStep,
    canAddStep,
    canDeleteStep,
    
    // Gestion des étapes
    addStep,
    deleteStep,
    updateStepTitle,
    
    // Gestion des champs
    addField,
    addFieldAtPosition,
    updateField,
    deleteField,
    duplicateField,
    
    // Organisation et layout
    organizeFieldsByWidth,
    reorderFields,
    
    // Logique conditionnelle
    evaluateFieldVisibility,
    getVisibleFields,
    getAvailableFieldsForConditions,
    
    // Validation
    validateForm,
    
    // Utilitaires
    findFieldById,
    getStepByFieldId,
    cloneFormConfig,
    
    // Import/Export
    exportFormConfig,
    importFormConfig,
    
    // Sauvegarde
    saveForm
  }
}