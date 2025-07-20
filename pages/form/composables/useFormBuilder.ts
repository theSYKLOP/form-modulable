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
  const activeStep = computed<FormStep | undefined>(() => 
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
    // ✅ Protection contre les initialisations multiples
    if (isCreatingForm.value) {
      console.log('⚠️ Initialisation déjà en cours')
      return formConfig.value?.id || 'new'
    }

    // Vérifier s'il y a un brouillon dans localStorage
    const draftData = localStorage.getItem('form-builder-draft')
    
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData)
        const config = parsed.config
        
        // ✅ Validation plus stricte des données
        if (config && 
            typeof config === 'object' && 
            config.id && 
            config.title &&
            Array.isArray(config.steps)) {
          
          // ✅ Vérifier que ce n'est pas trop ancien (>24h)
          const ageInHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60)
          if (ageInHours > 24) {
            console.log('🗑️ Brouillon trop ancien, suppression')
            localStorage.removeItem('form-builder-draft')
            return await createNewFormFromScratch()
          }
          
          formConfig.value = config
          activeStepIndex.value = 0
          selectedFieldId.value = null
          hasUnsavedChanges.value = parsed.isNew || false
          
          console.log('📄 Formulaire chargé depuis localStorage:', config.id)
          return config.id
        }
      } catch (error) {
        console.error('❌ Erreur parsing localStorage:', error)
        // ✅ Nettoyer les données corrompues
        localStorage.removeItem('form-builder-draft')
      }
    }
    
    // Si pas de brouillon valide, créer un nouveau formulaire
    return await createNewFormFromScratch()
  }

  // ✅ Protection renforcée contre les doublons
  const sessionFormIds = ref(new Set<string>())
  const lastCreatedFormId = ref<string | null>(null)
  
  // Ajouter un mutex pour éviter les créations multiples
  const isCreatingForm = ref(false)
  
  // ✅ Vérifier si un formulaire a déjà été créé dans cette session
  const hasCreatedFormInSession = (): boolean => {
    const sessionStorage = window.sessionStorage
    const createdInSession = sessionStorage.getItem('created-forms-session')
    return !!createdInSession
  }
  
  // ✅ Marquer qu'un formulaire a été créé dans cette session
  const markFormCreatedInSession = (formId: string) => {
    window.sessionStorage.setItem('created-forms-session', formId)
    window.sessionStorage.setItem('last-created-form', formId)
    lastCreatedFormId.value = formId
  }

  // Fonction pour générer un ID unique
  const generateUniqueFormId = (): string => {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Fonction améliorée pour créer un nouveau formulaire
  const createNewFormFromScratch = async (): Promise<string> => {
    // ✅ Protection contre les créations multiples
    if (isCreatingForm.value) {
      console.log('⚠️ Création déjà en cours, ignorée')
      return formConfig.value?.id || 'new'
    }
    
    // ✅ Vérifier si on a déjà créé un formulaire dans cette session
    const lastCreated = window.sessionStorage.getItem('last-created-form')
    if (lastCreated && !window.location.search.includes('force-new')) {
      console.log('⚠️ Formulaire déjà créé dans cette session:', lastCreated)
      
      // Essayer de charger le dernier formulaire créé
      try {
        const response = await $fetch<FormApiResponse>(`/api/form/${lastCreated}`)
        if (response.success && response.data) {
          formConfig.value = response.data
          activeStepIndex.value = 0
          selectedFieldId.value = null
          hasUnsavedChanges.value = false
          lastSavedAt.value = new Date()
          
          console.log('📥 Formulaire existant rechargé:', lastCreated)
          return lastCreated
        }
      } catch (error) {
        console.log('⚠️ Impossible de recharger le formulaire, création d\'un nouveau')
      }
    }

    try {
      isCreatingForm.value = true
      console.log('🆕 Creating new form from scratch...')
      
      // ✅ Générer un ID unique immédiatement
      const uniqueId = generateUniqueFormId()
      const now = new Date()
      const timestamp = now.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      const newConfig: FormConfig = {
        id: uniqueId, // ✅ ID unique généré
        title: `Nouveau formulaire ${timestamp}`, // ✅ Titre avec heure pour unicité
        description: '',
        layout: 'VERTICAL',
        spacing: 'NORMAL',
        steps: [
          {
            id: generateStepId(),
            title: 'Étape 1',
            description: '',
            order: 0,
            fields: [],
            apiConfig: null
          }
        ]
      }
      
      console.log('📝 New form config created:', newConfig)
      
      // ✅ Mettre à jour l'état avant la sauvegarde
      formConfig.value = newConfig
      activeStepIndex.value = 0
      selectedFieldId.value = null
      hasUnsavedChanges.value = true
      
      // ✅ Sauvegarder avec l'ID unique
      const draftData = {
        config: newConfig,
        timestamp: Date.now(),
        isNew: true,
        formId: uniqueId // ✅ Référence explicite
      }
      localStorage.setItem('form-builder-draft', JSON.stringify(draftData))
      
      // ✅ Marquer dans la session
      markFormCreatedInSession(uniqueId)
      
      console.log('🆕 Nouveau formulaire créé et sauvegardé en localStorage')
      return uniqueId // ✅ Retourner l'ID unique
      
    } finally {
      // ✅ Libérer le mutex dans tous les cas
      setTimeout(() => {
        isCreatingForm.value = false
      }, 1000) // Délai pour éviter les clics rapides
    }
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

  // Ajouter un débouncer pour la sauvegarde
  const savingTimeout = ref<NodeJS.Timeout | null>(null)

  const saveToDatabase = async (): Promise<string> => {
    if (!formConfig.value) {
      throw new Error('Aucun formulaire à sauvegarder')
    }

    // ✅ Protection contre les sauvegardes multiples
    if (isSaving.value) {
      console.log('⚠️ Sauvegarde déjà en cours')
      return formConfig.value.id || ''
    }

    // ✅ Débounce pour éviter les sauvegardes trop fréquentes
    if (savingTimeout.value) {
      clearTimeout(savingTimeout.value)
    }

    return new Promise((resolve, reject) => {
      savingTimeout.value = setTimeout(async () => {
        try {
          isSaving.value = true
          
          // Récupérer l'utilisateur connecté
          const authStore = useAuthStore()
          const currentUser = authStore.user
          
          if (!currentUser?.id) {
            throw new Error('Vous devez être connecté pour sauvegarder un formulaire')
          }
          
          const configToSave = { ...formConfig.value }
          
          // ✅ Générer un ID si ce n'est pas fait
          if (!configToSave.id) {
            configToSave.id = generateUniqueFormId()
          }
          
          // Déterminer si c'est une création ou une mise à jour
          // Un formulaire est NOUVEAU si :
          // - Il n'a pas d'ID du tout
          // - L'ID est 'new' (nouveau formulaire)
          // - L'ID commence par 'form_' (ID temporaire généré localement)
          // Un formulaire EXISTANT a un ID de la base de données (UUID ou nombre)
          const isNew = !configToSave.id || 
                       configToSave.id === 'new' || 
                       configToSave.id.startsWith('form_')
          
          const url = isNew ? '/api/form' : `/api/form/${configToSave.id}`
          const method = isNew ? 'POST' : 'PUT'

          console.log(`🔍 Sauvegarde: ID=${configToSave.id}, isNew=${isNew}, method=${method}, url=${url}`)

          // Ajouter le userId pour les nouvelles créations
          const bodyData = isNew ? {
            ...configToSave,
            userId: currentUser.id
          } : configToSave

          const response = await $fetch<FormApiResponse>(url, {
            method,
            body: bodyData
          })

          if (response.success && response.data) {
            // ✅ S'assurer que l'ID est bien conservé
            const previousId = formConfig.value?.id
            formConfig.value = response.data
            
            console.log(`✅ Sauvegarde réussie: ${previousId} → ${response.data.id}`)
            
            // ✅ Si c'était un nouveau formulaire, marquer comme sauvegardé définitivement
            if (isNew) {
              markFormCreatedInSession(response.data.id.toString())
              // Mettre à jour l'URL avec l'ID définitif
              if (process.client && window.location.search.includes('id=form_')) {
                window.history.replaceState(null, '', `/form?id=${response.data.id}`)
              }
            }
            
            hasUnsavedChanges.value = false
            lastSavedAt.value = new Date()
            
            // ✅ Nettoyer le localStorage après sauvegarde réussie
            localStorage.removeItem('form-builder-draft')
            
            console.log('💾 Formulaire sauvegardé en base de données')
            resolve(response.data.id)
          } else {
            throw new Error(response.message || 'Erreur lors de la sauvegarde')
          }
        } catch (error: any) {
          console.error('❌ Erreur sauvegarde:', error)
          reject(error)
        } finally {
          isSaving.value = false
          savingTimeout.value = null
        }
      }, 500) // Débounce de 500ms
    })
  }

  // 🆕 Fonction pour nettoyer la session et permettre un nouveau formulaire
  const clearSession = () => {
    window.sessionStorage.removeItem('created-forms-session')
    window.sessionStorage.removeItem('last-created-form')
    lastCreatedFormId.value = null
    sessionFormIds.value.clear()
  }

  // 🆕 Fonction pour créer un nouveau formulaire (action explicite de l'utilisateur)
  const createNewForm = async (): Promise<string> => {
    // ✅ Cette fonction est appelée quand l'utilisateur clique explicitement sur "Nouveau"
    // Dans ce cas, on autorise la création même s'il y en a déjà un dans la session
    
    if (isCreatingForm.value) {
      console.log('⚠️ Création déjà en cours')
      return formConfig.value?.id || 'new'
    }
    
    // Nettoyer la session pour permettre la création
    clearSession()
    
    return await createNewFormFromScratch()
  }
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
      fields: [],
      apiConfig: null // ✅ Explicitement null
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

  // 🆕 Fonction pour créer un formulaire complètement nouveau (action utilisateur explicite)
  // Cette version est appelée depuis l'interface utilisateur
  // Supprimé: l'ancienne version qui était un alias de createNewFormFromScratch

  // 🔧 Fonction pour s'assurer que la structure est correcte pour le preview
  const getPreviewFormConfig = computed<FormConfig | null>(() => {
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
    const normalizedSteps: FormStep[] = steps.map(step => ({
      ...step,
      fields: Array.isArray(step.fields) ? step.fields : [],
      apiConfig: step.apiConfig || null // ✅ Explicitement null si pas défini
    }))

    const result: FormConfig = {
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