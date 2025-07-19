import { ref, computed, watch } from 'vue'
import { loadFormFromLocalStorage, saveFormToLocalStorage, clearFormDraft } from '../utils/formHelpers'
import { generateFormId, generateFieldId, generateStepId } from '../utils/formHelpers'
import type { FormConfig, FormStep, FormField, FormFieldData } from '~/types/form'

// Types pour les réponses API
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface FormApiResponse extends ApiResponse {
  data?: FormConfig
}

export const useFormBuilder = () => {
  // États
  const formConfig = ref<FormConfig | null>(null)
  const activeStepIndex = ref(0)
  const selectedFieldId = ref<string | null>(null)
  const isSaving = ref(false)
  const hasUnsavedChanges = ref(false)
  const lastSavedAt = ref<Date | null>(null)

  // Computed
  const activeStep = computed(() => 
    formConfig.value?.steps[activeStepIndex.value]
  )
  
  const canAddStep = computed(() => 
    (formConfig.value?.steps.length || 0) < 10
  )
  
  const canDeleteStep = computed(() => 
    (formConfig.value?.steps.length || 0) > 1
  )

  // 🆕 Fonction pour initialiser un nouveau formulaire ou charger depuis localStorage
  const initializeFormBuilder = async (): Promise<string> => {
    // Vérifier s'il y a un brouillon dans localStorage
    const draftData = localStorage.getItem('form-builder-draft')
    
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData)
        const config = parsed.config
        
        if (config && typeof config === 'object') {
          formConfig.value = config
          activeStepIndex.value = 0
          selectedFieldId.value = null
          hasUnsavedChanges.value = parsed.isNew || false
          
          console.log('📄 Formulaire chargé depuis localStorage')
          return config.id || 'new'
        }
      } catch (error) {
        console.error('Erreur parsing localStorage:', error)
      }
    }

    // Si pas de brouillon, créer un nouveau formulaire
    return createNewFormFromScratch()
  }

  // 🆕 Fonction pour créer un formulaire complètement nouveau
  const createNewFormFromScratch = (): string => {
    console.log('🆕 Creating new form from scratch...')
    
    const newConfig: FormConfig = {
      id: '',
      title: `Nouveau formulaire ${new Date().toLocaleDateString('fr-FR')}`,
      description: '',
      layout: 'VERTICAL',
      spacing: 'NORMAL',
      steps: [
        {
          id: generateStepId(),
          title: 'Étape 1',
          description: '',
          order: 0,
          fields: []
        }
      ]
    }
    
    console.log('📝 New form config created:', newConfig)
    
    formConfig.value = newConfig
    activeStepIndex.value = 0
    selectedFieldId.value = null
    hasUnsavedChanges.value = true
    
    // Sauvegarder immédiatement dans localStorage
    const draftData = {
      config: newConfig,
      timestamp: Date.now(),
      isNew: true
    }
    localStorage.setItem('form-builder-draft', JSON.stringify(draftData))
    
    console.log('🆕 Nouveau formulaire créé et sauvegardé en localStorage')
    return 'new'
  }

  // 🆕 Fonction pour charger un formulaire existant depuis l'API
  const loadForm = async (formId: string) => {
    if (!formId || formId === 'new') {
      // Pour les nouveaux formulaires, utiliser le localStorage
      return initializeFormBuilder()
    }

    try {
      isSaving.value = true
      
      const response = await $fetch<FormApiResponse>(`/api/form/${formId}`)
      
      if (response.success && response.data) {
        formConfig.value = response.data
        activeStepIndex.value = 0
        selectedFieldId.value = null
        hasUnsavedChanges.value = false
        lastSavedAt.value = new Date()
        
        // Sauvegarder aussi dans localStorage comme backup
        const draftData = {
          config: response.data,
          timestamp: Date.now(),
          isNew: false
        }
        localStorage.setItem('form-builder-draft', JSON.stringify(draftData))
        
        console.log('📥 Formulaire chargé depuis l\'API')
        return formId
      } else {
        throw new Error(response.message || 'Formulaire non trouvé')
      }
    } catch (error: any) {
      console.error('Erreur chargement formulaire:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  // 🆕 Fonction pour sauvegarder en base de données
  const saveToDatabase = async (): Promise<string> => {
    if (!formConfig.value) {
      throw new Error('Aucun formulaire à sauvegarder')
    }

    try {
      isSaving.value = true
      
      const configToSave = { ...formConfig.value }
      
      // Déterminer si c'est une création ou une mise à jour
      const isNew = !configToSave.id
      const url = isNew ? '/api/form' : `/api/form/${configToSave.id}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await $fetch<FormApiResponse>(url, {
        method,
        body: configToSave
      })

      if (response.success && response.data) {
        // Mettre à jour la configuration avec les données retournées
        formConfig.value = response.data
        hasUnsavedChanges.value = false
        lastSavedAt.value = new Date()
        
        // Effacer le brouillon localStorage après sauvegarde réussie
        localStorage.removeItem('form-builder-draft')
        
        console.log('💾 Formulaire sauvegardé en base de données')
        return response.data.id
      } else {
        throw new Error(response.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  // 🆕 Fonction pour vérifier les modifications non sauvegardées
  const checkUnsavedChanges = (): boolean => {
    return hasUnsavedChanges.value
  }

  // 🆕 Fonction pour effacer le localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem('form-builder-draft')
    hasUnsavedChanges.value = false
  }

  // Watcher pour détecter les changements
  watch(
    () => formConfig.value,
    (newConfig) => {
      if (newConfig) {
        hasUnsavedChanges.value = true
        
        // Auto-sauvegarde dans localStorage
        const draftData = {
          config: newConfig,
          timestamp: Date.now(),
          isNew: !newConfig.id
        }
        localStorage.setItem('form-builder-draft', JSON.stringify(draftData))
      }
    },
    { deep: true }
  )

  // Gestion des étapes
  const addStep = () => {
    if (!formConfig.value) return
    
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
    if (!formConfig.value) return
    
    const index = formConfig.value.steps.findIndex(s => s.id === stepId)
    if (index > -1 && canDeleteStep.value) {
      formConfig.value.steps.splice(index, 1)
      
      // Ajuster l'index actif si nécessaire
      if (activeStepIndex.value >= formConfig.value.steps.length) {
        activeStepIndex.value = formConfig.value.steps.length - 1
      }
    }
  }

  const updateStepTitle = (stepId: string, title: string) => {
    if (!formConfig.value) return
    
    const step = formConfig.value.steps.find(s => s.id === stepId)
    if (step) {
      step.title = title
    }
  }

  const updateStep = (stepId: string, updates: Partial<FormStep>) => {
    if (!formConfig.value) return
    
    const step = formConfig.value.steps.find(s => s.id === stepId)
    if (step) {
      Object.assign(step, updates)
    }
  }

  // Gestion des champs
  const addField = (fieldData: Partial<FormFieldData>) => {
    if (!activeStep.value) return
    
    const newField: FormField = {
      id: generateFieldId(),
      stepId: activeStep.value.id,
      order: activeStep.value.fields.length,
      width: 'full',
      ...fieldData
    } as FormField
    
    activeStep.value.fields.push(newField)
    selectedFieldId.value = newField.id
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!formConfig.value) return
    
    for (const step of formConfig.value.steps) {
      const field = step.fields.find(f => f.id === fieldId)
      if (field) {
        Object.assign(field, updates)
        break
      }
    }
  }

  const deleteField = (fieldId: string) => {
    if (!formConfig.value) return
    
    for (const step of formConfig.value.steps) {
      const fieldIndex = step.fields.findIndex(f => f.id === fieldId)
      if (fieldIndex > -1) {
        step.fields.splice(fieldIndex, 1)
        
        // Réordonner les champs
        step.fields.forEach((field, index) => {
          field.order = index
        })
        
        // Désélectionner si c'était le champ sélectionné
        if (selectedFieldId.value === fieldId) {
          selectedFieldId.value = null
        }
        break
      }
    }
  }

  const duplicateField = (fieldId: string) => {
    if (!formConfig.value) return
    
    for (const step of formConfig.value.steps) {
      const field = step.fields.find(f => f.id === fieldId)
      if (field) {
        const duplicated: FormField = {
          ...field,
          id: generateFieldId(),
          name: `${field.name}_copy_${Date.now()}`,
          label: `${field.label} (copie)`,
          order: field.order + 1
        }
        
        // Décaler les champs suivants
        step.fields.forEach(f => {
          if (f.order > field.order) {
            f.order += 1
          }
        })
        
        step.fields.push(duplicated)
        selectedFieldId.value = duplicated.id
        break
      }
    }
  }

  // 🆕 Fonction pour créer un formulaire complètement nouveau (alias)
  const createNewForm = (): Promise<string> => {
    return Promise.resolve(createNewFormFromScratch())
  }

  // 🔧 Fonction pour s'assurer que la structure est correcte pour le preview
  const getPreviewFormConfig = computed(() => {
    console.log('🔧 getPreviewFormConfig computed - formConfig:', formConfig.value)
    
    if (!formConfig.value) {
      console.log('🔧 getPreviewFormConfig - No formConfig')
      return null
    }

    // S'assurer que les steps sont un array
    const steps = Array.isArray(formConfig.value.steps) 
      ? formConfig.value.steps 
      : []

    console.log('🔧 getPreviewFormConfig - Steps:', steps)

    // S'assurer que chaque step a les propriétés nécessaires
    const normalizedSteps = steps.map(step => ({
      ...step,
      fields: Array.isArray(step.fields) ? step.fields : [],
      apiConfig: step.apiConfig || null
    }))

    const result = {
      ...formConfig.value,
      steps: normalizedSteps
    }
    
    console.log('🔧 getPreviewFormConfig - Result:', result)
    return result
  })

  return {
    // État
    formConfig,
    activeStepIndex,
    selectedFieldId,
    activeStep,
    canAddStep,
    canDeleteStep,
    isSaving,
    hasUnsavedChanges,
    lastSavedAt,
    
    // Fonctions principales
    initializeFormBuilder,
    loadForm,
    saveToDatabase,
    createNewForm,
    checkUnsavedChanges,
    clearLocalStorage,
    
    // Gestion des étapes
    addStep,
    deleteStep,
    updateStepTitle,
    updateStep,
    
    // Gestion des champs
    addField,
    updateField,
    deleteField,
    duplicateField,

    // 🆕 Ajout de cette computed pour le preview
    getPreviewFormConfig,
  }
}