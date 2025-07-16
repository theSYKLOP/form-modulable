import { ref, computed } from 'vue'
import type { FormConfig, FormStep, FormField } from '../types/form'
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

  // Fonctions pour gérer le modal - SUPPRIMÉES car maintenant dans le composant

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

  const updateStepTitle = (stepId: string, title: string) => {
    const step = formConfig.value.steps.find(s => s.id === stepId)
    if (step) step.title = title
  }

  // Gestion des champs
  const addField = (field: Omit<FormField, 'id' | 'stepId' | 'order'>) => {
    if (!activeStep.value) return
    
    const newField: FormField = {
      ...field,
      id: generateFieldId(),
      stepId: activeStep.value.id,
      order: activeStep.value.fields.length
    }
    
    activeStep.value.fields.push(newField)
    selectedFieldId.value = newField.id
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    const field = findFieldById(fieldId)
    if (field) {
      Object.assign(field, updates)
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
        formConfig.value.steps[stepIndex].fields.forEach((f, index) => {
          f.order = index
        })
      }
    }
  }

  const duplicateField = (fieldId: string) => {
    const field = findFieldById(fieldId)
    if (field) {
      const duplicated = {
        ...field,
        id: generateFieldId(),
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
        
        step.fields.push(duplicated)
        
        // Réordonner
        step.fields.sort((a, b) => a.order - b.order)
        step.fields.forEach((f, index) => {
          f.order = index
        })
      }
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

  // Sauvegarde
  const saveForm = async () => {
    try {
      const response = await $fetch('/api/forms', {
        method: 'POST',
        body: formConfig.value
      })
      return response
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      throw error
    }
  }

  return {
    formConfig,
    activeStepIndex,
    selectedFieldId,
    activeStep,
    canAddStep,
    canDeleteStep,
    addStep,
    deleteStep,
    updateStepTitle,
    addField,
    updateField,
    deleteField,
    duplicateField,
    findFieldById,
    saveForm
  }
}