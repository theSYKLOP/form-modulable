<!--
  DynamicForm.vue - Main parent component for the dynamic form builder system
  
  @description Parent component that manages form configuration, mode switching, and orchestrates child components.
  Uses Vuex for state management and supports multiple modes: edit, preview, create, view.
  
  @example
  <DynamicForm :config="formConfig" />
-->
<template>
  <div class="dynamic-form bg-white min-h-screen">
    <!-- Header with mode controls and model selector -->
    <div class="bg-gray-50 border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ config?.title || 'Formulaire dynamique' }}
          </h1>
          
          <!-- Mode selector -->
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Mode:</label>
            <select
              v-model="mode"
              class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              @change="onModeChange"
            >
              <option value="edit">Édition</option>
              <option value="preview">Aperçu</option>
              <!-- <option value="create">Création</option>
              <option value="view">Visualisation</option> -->
            </select>
          </div>
        </div>

        <!-- Model selector (only in edit mode) -->
        <div v-if="mode === 'edit'" class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700">Modèle:</label>
          <select
            v-model="selectedModelId"
            class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm min-w-48"
            @change="onModelChange"
          >
            <option value="">Sélectionner un modèle...</option>
            <option
              v-for="model in models"
              :key="model.id"
              :value="model.id"
            >
              {{ model.title }}
            </option>
          </select>
          
          <button
            @click="loadModel"
            :disabled="!selectedModelId || loading"
            class="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="loading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <span v-else>Charger</span>
          </button>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center space-x-2">
          <button
            v-if="mode === 'preview'"
            @click="submitForm"
            :disabled="formState.submitting || !formState.valid"
            class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="formState.submitting" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin mr-2" />
            {{ config?.submitButtonText || 'Soumettre' }}
          </button>
          
          <!-- Sauvegarde rapide (localStorage) -->
          <button
            v-if="mode === 'edit' && hasActiveSession"
            @click="quickSave"
            :disabled="loading"
            class="px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sauvegarde rapide en mémoire"
          >
            <Icon name="i-heroicons-bookmark" class="w-4 h-4" />
          </button>
          
          <!-- Sauvegarde complète (base de données) -->
          <button
            v-if="mode !== 'view'"
            @click="saveConfig"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="loading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin mr-2" />
            <Icon v-else name="i-heroicons-cloud-arrow-up" class="w-4 h-4 mr-2" />
            Sauvegarder
          </button>
          
          <button
            @click="reset"
            class="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Réinitialiser
          </button>
          
          <button
            @click="cancel"
            class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {{ config?.cancelButtonText || 'Annuler' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main content area -->
    <div class="flex flex-1">
      <!-- Left sidebar - Field List (only in edit mode) -->
      <div
        v-if="mode === 'edit'"
        class="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto"
      >        <div class="p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Champs disponibles</h3>
          <FieldList 
            @add-field="onAddField" 
            @open-function-modal="onOpenFunctionModal"
          />
        </div>
      </div>

      <!-- Center - Form Builder -->
      <div class="flex-1 overflow-y-auto">        <div class="p-6">          <FormBuilder
            :fields="formFields"
            :steps="formSteps"
            :mode="mode"
            @submit="onSubmit"
            @field-update="onFieldUpdate"
            @field-add="onAddField"
            @step-update="onStepUpdate"
            @open-function-modal="onOpenFunctionModal"
          />
        </div>
      </div>

      <!-- Right sidebar - Step Manager (only in edit mode) -->
      <div
        v-if="mode === 'edit'"
        class="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto"
      >
        <div class="p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Gestion des étapes</h3>
          <StepManager @step-added="onStepAdded" />
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <Icon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-blue-600" />
        <span class="text-gray-900">Chargement...</span>
      </div>
    </div>

    <!-- Error notification -->
    <div
      v-if="error"
      class="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-md z-50"
    >
      <div class="flex">
        <Icon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Erreur</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
        <button
          @click="clearError"
          class="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-600 p-1.5 hover:bg-red-100"
        >
          <Icon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { FormConfig, FormMode, StepFormField, FormStep, FieldTemplate, FormState, FormSection, FormSectionField } from '~/types/form'
import FieldList from './FieldList.vue'
import FormBuilder from './FormBuilder.vue'
import StepManager from './StepManager.vue'
// Import des utilitaires localStorage - CORRECTION: ajouter saveToStorage
import {
  createWorkingSession,
  loadWorkingSession,
  initializeWorkingForm,
  saveWorkingFormData,
  loadWorkingFormData,
  updateWorkingStep,
  addWorkingStep,
  addWorkingField,
  updateWorkingField,
  updateWorkingFieldsOrder,
  updateWorkingFormState,
  clearWorkingSession,
  generateId
} from '~/utils/utilsForm'

/**
 * DynamicForm - Parent component for dynamic form builder system
 * 
 * @component
 * @example
 * <DynamicForm :config="formConfig" />
 */
export default {
  name: 'DynamicForm',
  
  components: {
    FieldList,
    FormBuilder,
    StepManager
  },

  props: {
    /**
     * Form configuration object
     */
    config: {
      type: Object as PropType<FormConfig>,
      required: true
    }
  },

  data() {
    return {
      /** Current form mode */
      mode: 'edit' as FormMode,
      /** Currently selected model ID */
      selectedModelId: '' as string,
      /** Loading state */
      loading: false as boolean,
      /** Error message */
      error: null as string | null,
      /** Working session data */
      workingSession: null as any,
      /** Fields from localStorage */
      localFields: [] as StepFormField[],
      /** Steps from localStorage */
      localSteps: [] as FormStep[],
      /** Form state from localStorage */
      localFormState: null as FormState | null,
      /** Auto-save enabled */
      autoSaveEnabled: true
    }
  },

  computed: {
    /**
     * Available form models from Vuex store
     */
    models(): FormConfig[] {
      return this.$store.state.models.models || []
    },

    /**
     * Current form state - prioritize local storage version if available
     */
    formState(): FormState {
      return this.localFormState || this.$store.state.form.state
    },

    /**
     * Form fields - prioritize local storage version if available
     */
    formFields(): StepFormField[] {
      return this.localFields.length > 0 
        ? this.localFields 
        : this.$store.state.form.fields || []
    },

    /**
     * Form steps - prioritize local storage version if available
     */
    formSteps(): FormStep[] {
      return this.localSteps.length > 0
        ? this.localSteps
        : this.$store.state.form.steps || []
    },

    /**
     * Check if there's a session in progress
     */
    hasActiveSession(): boolean {
      return !!this.workingSession
    },

    /**
     * Get current working form ID
     */
    workingFormId(): string {
      return this.workingSession?.formId || 'new'
    }
  },

  watch: {
    // Observe les changements de mode pour auto-sauvegarder
    mode(newMode) {
      if (this.hasActiveSession) {
        this.autoSaveSession({ mode: newMode })
      }
    },
    
    // Synchoniser les changements du store avec localStorage
    '$store.state.form.fields': {
      handler(newFields) {
        if (this.hasActiveSession && newFields && newFields.length > 0) {
          this.syncFieldsToLocalStorage(newFields)
        }
      },
      deep: true
    },
    
    '$store.state.form.steps': {
      handler(newSteps) {
        if (this.hasActiveSession && newSteps && newSteps.length > 0) {
          this.syncStepsToLocalStorage(newSteps)
        }
      },
      deep: true
    }
  },

  mounted() {
    this.checkForExistingSession()
  },

  beforeUnmount() {
    // Sauvegarder l'état actuel avant de quitter le composant
    if (this.hasActiveSession && this.autoSaveEnabled) {
      this.performAutoSave()
    }
  },

  methods: {
    // === GESTION DES FORMULAIRES (API) ===
    
    /**
     * Charger un formulaire depuis l'API
     */
    async loadFormFromAPI(formId: string): Promise<void> {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 Chargement du formulaire depuis l\'API:', formId)
        
        const response = await $fetch(`/api/forms/${formId}`)
        if (response.success && response.data) {
          const form = response.data
          
          console.log('📥 Formulaire reçu de l\'API:', form)
          console.log('📋 Steps JSON:', form.steps)
          console.log('📝 Fields JSON:', form.fields)
          
          // Mettre à jour la configuration
          this.$store.commit('form/SET_CONFIG', {
            id: form.id,
            title: form.title,
            description: form.description,
            mode: this.mode
          })
          
          // ✨ NOUVEAU: Adapter la structure JSON vers les types attendus par le frontend
          this.convertApiDataToLocalFormat(form)
          
          // Auto-sauvegarder
          this.autoSaveAllData()
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement du formulaire:', error)
        this.error = 'Impossible de charger le formulaire'
      } finally {
        this.loading = false
      }
    },

    /**
     * ✨ NOUVEAU: Convertir les données JSON de l'API vers le format attendu par le frontend
     */
         convertApiDataToLocalFormat(form: unknown): void {
      console.log('🔄 Conversion des données API vers format local')
      
      // Convertir les steps JSON en objets FormStep
      if (form.steps && Array.isArray(form.steps)) {
        this.localSteps = form.steps.map((step: any) => ({
          id: step.id,
          formId: form.id,
          title: step.title,
          description: step.description,
          order: step.order,
          icon: step.icon
        }))
        console.log('📋 Steps converties:', this.localSteps)
      } else {
        this.localSteps = []
      }
      
      // Convertir les fields JSON en objets StepFormField
      if (form.fields && Array.isArray(form.fields)) {
        this.localFields = form.fields.map((field: any) => ({
          id: field.id,
          formId: form.id,
          stepId: field.stepId,
          type: field.type.toLowerCase(), // Convertir TEXT -> text
          name: field.name,
          label: field.label,
          placeholder: field.placeholder,
          helpText: field.helpText,
          defaultValue: field.defaultValue,
          order: field.order || 0,
          width: field.width?.toLowerCase() || 'full', // Convertir FULL -> full
          position: field.position?.toLowerCase() || 'left',
          disabled: field.disabled || false,
          readonly: field.readonly || false,
          class: field.class,
          icon: field.icon,
          prefix: field.prefix,
          suffix: field.suffix,
          rows: field.rows,
          accept: field.accept,
          multiple: field.multiple || false,
          min: field.min,
          max: field.max,
          step: field.step,
          validation: field.validation,
          conditionalLogic: field.conditionalLogic,
          apiConfig: field.apiConfig,
          options: field.options || []
        }))
        console.log('📝 Fields converties:', this.localFields)
      } else {
        this.localFields = []
      }
      
      // Synchroniser avec le store Vuex
      this.$store.commit('form/SET_STEPS', this.localSteps)
      this.$store.commit('form/SET_FIELDS', this.localFields)
      
      console.log('✅ Conversion terminée')
    },

    /**
     * Soumettre le formulaire via API
     */
    async submitFormToAPI(formId: string, formData: Record<string, unknown>): Promise<void> {
      try {
        this.formState.submitting = true
        
        const response = await $fetch(`/api/forms/${formId}/submissions`, {
          method: 'POST',
          body: {
            data: formData,
            metadata: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
              sessionId: this.workingSession?.id
            }
          }
        })
        
        if (response.success) {
          // Notification de succès
          this.$toast.add({
            severity: 'success',
            summary: 'Formulaire soumis',
            detail: 'Votre formulaire a été soumis avec succès',
            life: 5000
          })
          
          // Émettre l'événement de soumission
          this.$emit('form-submitted', response.data.submission)
          
          // Réinitialiser l'état du formulaire
          this.formState.submitting = false
          this.formState.valid = true
        }
      } catch (error) {
        console.error('Erreur lors de la soumission:', error)
        this.error = 'Impossible de soumettre le formulaire'
        this.formState.submitting = false
      }
    },

    /**
     * Charger l'historique des soumissions
     */
    async loadSubmissions(formId: string): Promise<void> {
      try {
        const response = await $fetch(`/api/forms/${formId}/submissions`)
        if (response.success && response.data.submissions) {
          this.$emit('submissions-loaded', response.data.submissions)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des soumissions:', error)
      }
    },

    // === FONCTION UTILITAIRE LOCALE ===
    /**
     * Fonction utilitaire locale pour sauvegarder dans localStorage
     */
    saveToStorage(key: string, data: unknown): void {
      try {
        localStorage.setItem(key, JSON.stringify(data))
      } catch (error) {
        console.error(`Erreur lors de la sauvegarde dans ${key}:`, error)
      }
    },

    /**
     * Vérifier s'il existe une session en cours
     */
    checkForExistingSession(): void {
      // Vérifier s'il y a une session active dans localStorage
      const session = loadWorkingSession()
      if (session) {
        // Demander à l'utilisateur s'il souhaite restaurer la session
        if (confirm(`Une session de travail précédente a été trouvée (${new Date(session.lastModified).toLocaleString()}). Voulez-vous la restaurer?`)) {
          this.restoreWorkingSession(session)
        } else {
          // L'utilisateur ne veut pas restaurer, supprimer la session
          clearWorkingSession()
          this.initializeForm()
        }
      } else {
        // Pas de session précédente, initialiser normalement
        this.initializeForm()
      }
    },

    /**
     * Restaurer une session de travail
     */
    restoreWorkingSession(session: Record<string, unknown>): void {
      try {
        this.loading = true
        this.workingSession = session
        
        // Charger les données de la session
        const formData = loadWorkingFormData(session.formId as string)
        if (formData) {
          // Mettre à jour le mode
          this.mode = formData.session.mode
          
          // Charger les champs, étapes et état depuis localStorage
          this.localFields = formData.fields || []
          this.localSteps = formData.steps || []
          this.localFormState = formData.state || null
          
          // Synchroniser avec le store Vuex
          this.$store.commit('form/SET_FIELDS', this.localFields)
          this.$store.commit('form/SET_STEPS', this.localSteps)
          if (this.localFormState) {
            this.$store.commit('form/SET_STATE', this.localFormState)
          }
          
          console.log('🔄 Session restaurée avec succès:', session.id)
        } else {
          // Session invalide ou corrompue
          this.error = 'Impossible de restaurer la session, données manquantes'
          clearWorkingSession()
          this.initializeForm()
        }
      } catch (error) {
        console.error('Erreur lors de la restauration de la session:', error)
        this.error = 'Erreur lors de la restauration de la session'
        this.initializeForm()
      } finally {
        this.loading = false
      }
    },

    /**
     * Initialize the form with provided config
     */
    async initializeForm(): Promise<void> {
      try {
        this.loading = true
        this.error = null

        // Load models and field templates
        await Promise.all([
          this.$store.dispatch('models/loadModels'),
          this.$store.dispatch('fields/loadTemplates')
        ])

        // Créer une nouvelle session de travail
        const newSession = createWorkingSession(this.config?.title || 'Nouveau formulaire')
        this.workingSession = newSession
        
        // Initialiser le formulaire de travail
        const workingForm = initializeWorkingForm(newSession)
        
        // Charger la configuration depuis les props si nécessaire
        if (this.config) {
          // Adapter la config aux données de la session de travail
          const initialConfig = {
            ...this.config,
            id: newSession.formId
          }
          
          this.$store.commit('form/SET_CONFIG', initialConfig)
            // Convertir les sections en étapes si nécessaire
          if (initialConfig.sections && initialConfig.sections.length > 0) {
            const fields: StepFormField[] = []
            const steps: FormStep[] = []
            
            initialConfig.sections.forEach((section: FormSection, sectionIndex: number) => {
              // Créer une étape pour chaque section
              const step: FormStep = {
                id: section.id || generateId('step'),
                formId: newSession.formId,
                title: section.title,
                description: section.description,
                order: sectionIndex + 1,
                icon: 'i-heroicons-document-text'
              }
              steps.push(step)
              
              // Convertir les champs de la section en champs d'étape
              if (section.fields) {
                section.fields.forEach((field: FormSectionField, fieldIndex: number) => {
                  const stepField: StepFormField = {
                    id: field.id || generateId('field'),
                    formId: newSession.formId,
                    stepId: step.id,
                    name: field.id || `field_${fieldIndex}`,
                    label: field.label,
                    type: field.type,
                    order: fieldIndex,
                    width: field.width || 'full',
                    validation: field.validation || { required: false },
                    disabled: field.disabled || false,
                    readonly: field.readonly || false,
                    options: field.options || []
                  }
                  fields.push(stepField)
                })
              }
            })
            
            // Mettre à jour les données locales et le store
            this.localFields = fields
            this.localSteps = steps
            this.$store.commit('form/SET_FIELDS', fields)
            this.$store.commit('form/SET_STEPS', steps)
            
            // Sauvegarder dans localStorage
            this.autoSaveAllData()
          } else {
            // Pas de sections, utiliser le formulaire de travail par défaut
            this.localSteps = workingForm.steps
            this.localFields = workingForm.fields
            this.$store.commit('form/SET_STEPS', workingForm.steps)
          }
          
          this.mode = this.config.mode || 'edit'
        }
      } catch (error) {
        this.error = 'Erreur lors de l\'initialisation du formulaire'
        console.error('Form initialization failed:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Auto-save les changements de session
     */
    autoSaveSession(updates: Record<string, unknown>): void {
      if (!this.hasActiveSession || !this.autoSaveEnabled) return
      
      // Mettre à jour la session
      if (this.workingSession) {
        Object.assign(this.workingSession, { ...updates, lastModified: Date.now() })
        
        // Sauvegarder dans localStorage - CORRECTION: utiliser la fonction locale
        try {
          this.saveToStorage('modulable_working_session', this.workingSession)
        } catch (error) {
          console.error('Erreur lors de l\'auto-sauvegarde de la session:', error)
        }
      }
    },

    /**
     * Synchroniser les champs du store avec localStorage
     */
    syncFieldsToLocalStorage(fields: StepFormField[]): void {
      if (!this.hasActiveSession || !this.autoSaveEnabled) return
      
      // Mettre à jour les champs locaux
      this.localFields = fields.map(field => ({
        ...field,
        formId: this.workingFormId // Assurer que le formId est correct
      }))
      
      // Sauvegarder dans localStorage - CORRECTION: utiliser la fonction locale
      try {
        this.saveToStorage(`modulable_working_fields_${this.workingFormId}`, this.localFields)
        console.log('📝 Champs synchronisés avec localStorage')
      } catch (error) {
        console.error('Erreur lors de la synchronisation des champs:', error)
      }
    },

    /**
     * Synchroniser les étapes du store avec localStorage
     */
    syncStepsToLocalStorage(steps: FormStep[]): void {
      if (!this.hasActiveSession || !this.autoSaveEnabled) return
      
      // Mettre à jour les étapes locales
      this.localSteps = steps.map(step => ({
        ...step,
        formId: this.workingFormId // Assurer que le formId est correct
      }))
      
      // Sauvegarder dans localStorage - CORRECTION: utiliser la fonction locale
      try {
        this.saveToStorage(`modulable_working_steps_${this.workingFormId}`, this.localSteps)
        console.log('📝 Étapes synchronisées avec localStorage')
      } catch (error) {
        console.error('Erreur lors de la synchronisation des étapes:', error)
      }
    },

    /**
     * Sauvegarder toutes les données en une fois
     */
    autoSaveAllData(): void {
      if (!this.hasActiveSession || !this.autoSaveEnabled) return
      
      try {
        // Construire l'objet de données complètes
        const formData = {
          session: this.workingSession,
          config: {
            id: this.workingFormId,
            title: this.config?.title || 'Formulaire sans titre',
            description: this.config?.description || '',
            mode: this.mode,
            sections: []
          },
          steps: this.localSteps.length > 0 ? this.localSteps : this.formSteps,
          fields: this.localFields.length > 0 ? this.localFields : this.formFields,
          state: this.localFormState || this.formState
        }
        
        saveWorkingFormData(formData)
        console.log('💾 Toutes les données sauvegardées')
      } catch (error) {
        console.error('Erreur lors de l\'auto-sauvegarde complète:', error)
      }
    },

    /**
     * Exécuter l'auto-sauvegarde
     */
    performAutoSave(): void {
      if (!this.hasActiveSession || !this.autoSaveEnabled) return
      
      // Mettre à jour la session
      this.autoSaveSession({ lastModified: Date.now() })
      
      // Sauvegarder les données
      this.autoSaveAllData()
    },

    /**
     * Handle mode change
     */
    onModeChange(): void {
      this.$store.commit('form/SET_MODE', this.mode)
      
      // Validate form when switching to preview mode
      if (this.mode === 'preview') {
        this.$store.dispatch('form/validateForm')
      }
      
      // Auto-save le changement de mode
      this.autoSaveSession({ mode: this.mode })
    },

    /**
     * Handle model selection change
     */
    onModelChange(): void {
      // Model change handled in loadModel method
    },

    /**
     * Load selected model
     */
    async loadModel(): Promise<void> {
      if (!this.selectedModelId) return

      try {
        this.loading = true
        this.error = null

        const model = this.models.find(m => m.id === this.selectedModelId)
        if (model) {
          // Créer une nouvelle session pour le modèle chargé
          const newSession = createWorkingSession(model.title)
          this.workingSession = newSession
          
          this.$store.commit('form/SET_CONFIG', {
            ...model,
            id: newSession.formId
          })
            // Convert sections to fields and steps if needed
          const fields: StepFormField[] = []
          const steps: FormStep[] = []

          model.sections!.forEach((section: FormSection, sectionIndex: number) => {
            // Create a step for each section
            const step: FormStep = {
              id: section.id || generateId('step'),
              formId: newSession.formId,
              title: section.title,
              description: section.description,
              order: sectionIndex + 1,
              icon: 'i-heroicons-document-text'
            }
            steps.push(step)
            
            // Convert section fields to step fields
            section.fields.forEach((field: FormSectionField, fieldIndex: number) => {
              const stepField: StepFormField = {
                ...field,
                id: field.id || generateId('field'),
                formId: newSession.formId,
                stepId: step.id,
                name: field.id || `field_${fieldIndex}`,
                order: fieldIndex
              }
              fields.push(stepField)
            })
          })

          // Mettre à jour les données locales et le store
          this.localFields = fields
          this.localSteps = steps
          this.$store.commit('form/SET_FIELDS', fields)
          this.$store.commit('form/SET_STEPS', steps)
          
          // Sauvegarder dans localStorage
          this.autoSaveAllData()
        }
      } catch (error) {
        this.error = 'Erreur lors du chargement du modèle'
        console.error('Model loading failed:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Handle field addition from FieldList or FormBuilder
     */
    onAddField(template: FieldTemplate | StepFormField): void {
      console.log('DynamicForm onAddField called with:', template)
      
      let newField: StepFormField

      if (this.isStepFormField(template)) {
        // C'est déjà un StepFormField, on peut l'utiliser directement
        newField = {
          ...template,
          // S'assurer que l'ID est unique
          id: template.id || generateId('field'),
          // Mise à jour du formId pour la session active
          formId: this.workingFormId,
          // Mise à jour de l'ordre si nécessaire
          order: template.order !== undefined ? template.order : this.formFields.length
        }
      } else if (this.isFieldTemplate(template)) {
        // C'est un FieldTemplate, on doit le convertir en StepFormField
        const fieldId = generateId('field')
        
        newField = {
          id: fieldId,
          formId: this.workingFormId,
          stepId: this.formSteps[0]?.id || 'default_step',
          name: template.name || `${template.type}_${Date.now()}`,
          label: template.label || 'Nouveau champ',
          type: template.type,
          width: 'full',
          validation: { required: false },
          order: this.formFields.length,
          disabled: false,
          readonly: false,
          options: [],
          // Appliquer les propriétés par défaut du template si elles existent
          ...(template.defaultProps || {})
        }
      } else {
        // Cas de fallback (ne devrait pas arriver avec TypeScript)
        console.warn('Unknown template type:', template)
        return
      }

      // Ajouter le champ au store Vuex
      this.$store.commit('form/ADD_FIELD', newField)
      
      // Auto-save le nouveau champ dans localStorage
      if (this.hasActiveSession && this.autoSaveEnabled) {
        try {
          addWorkingField(this.workingFormId, newField)
          console.log('💾 Nouveau champ auto-sauvegardé:', newField.id)
        } catch (error) {
          console.error('Erreur lors de l\'auto-sauvegarde du champ:', error)
        }
          // Mettre à jour les champs locaux
        this.localFields.push(newField)
      }
    },

    /**
     * Handle function modal opening from FieldList or FormBuilder
     */
    onOpenFunctionModal(functionData: Record<string, unknown>): void {
      console.log('DynamicForm onOpenFunctionModal called with:', functionData)
      
      // Ici nous pourrions gérer d'autres logiques globales si nécessaire
      // Pour l'instant, on passe simplement l'événement au FormBuilder via les props
      // Le FormBuilder se chargera d'ouvrir le modal ApiConfigModal
      
      // Note: Cette méthode peut être étendue pour gérer d'autres logiques
      // comme l'enregistrement de l'action dans l'historique, analytics, etc.
    },

    /**
     * Handle field update
     */
    onFieldUpdate(updatedFields: StepFormField[] | StepFormField): void {
      if (Array.isArray(updatedFields)) {
        // Mise à jour de tous les champs
        this.$store.commit('form/SET_FIELDS', updatedFields)
        
        // Auto-save les champs mis à jour
        if (this.hasActiveSession && this.autoSaveEnabled) {
          try {
            // S'assurer que tous les champs ont le bon formId
            const fieldsWithCorrectId = updatedFields.map(field => ({
              ...field,
              formId: this.workingFormId
            }))
            
            // Mettre à jour les champs locaux
            this.localFields = fieldsWithCorrectId
            
            // Mettre à jour l'ordre dans localStorage
            updateWorkingFieldsOrder(this.workingFormId, fieldsWithCorrectId)
            console.log('💾 Tous les champs mis à jour et auto-sauvegardés')
          } catch (error) {
            console.error('Erreur lors de l\'auto-sauvegarde des champs:', error)
          }
        }
      } else {
        // Mise à jour d'un seul champ
        const field = {
          ...updatedFields,
          formId: this.workingFormId // Assurer que le formId est correct
        }
        
        const index = this.formFields.findIndex(f => f.id === field.id)
        if (index !== -1) {
          this.$store.commit('form/UPDATE_FIELD', { index, field })
        } else {
          // Nouveau champ à ajouter
          this.$store.commit('form/ADD_FIELD', field)
        }
        
        // Auto-save le champ mis à jour
        if (this.hasActiveSession && this.autoSaveEnabled) {
          try {
            updateWorkingField(this.workingFormId, field.id, field)
            
            // Mettre à jour les champs locaux
            const fieldIndex = this.localFields.findIndex(f => f.id === field.id)
            if (fieldIndex !== -1) {
              this.localFields[fieldIndex] = field
            } else {
              this.localFields.push(field)
            }
            
            console.log('💾 Champ mis à jour et auto-sauvegardé:', field.id)
          } catch (error) {
            console.error('Erreur lors de l\'auto-sauvegarde du champ:', error)
          }
        }
      }
    },

    /**
     * Handle step update
     */
    onStepUpdate(step: FormStep): void {
      // Assurer que le formId est correct
      const updatedStep = {
        ...step,
        formId: this.workingFormId
      }
      
      const index = this.formSteps.findIndex(s => s.id === step.id)
      if (index !== -1) {
        this.$store.commit('form/UPDATE_STEP', { index, step: updatedStep })
      }
      
      // Auto-save l'étape mise à jour
      if (this.hasActiveSession && this.autoSaveEnabled) {
        try {
          updateWorkingStep(this.workingFormId, updatedStep.id, updatedStep)
          
          // Mettre à jour les étapes locales
          const stepIndex = this.localSteps.findIndex(s => s.id === updatedStep.id)
          if (stepIndex !== -1) {
            this.localSteps[stepIndex] = updatedStep
          }
          
          console.log('💾 Étape mise à jour et auto-sauvegardée:', updatedStep.id)
        } catch (error) {
          console.error('Erreur lors de l\'auto-sauvegarde de l\'étape:', error)
        }
      }
    },

    /**
     * Handle step addition from StepManager
     */
    onStepAdded(step: FormStep): void {
      // Assurer que le formId est correct
      const newStep = {
        ...step,
        formId: this.workingFormId
      }
      
      this.$store.commit('form/ADD_STEP', newStep)
      
      // Auto-save la nouvelle étape
      if (this.hasActiveSession && this.autoSaveEnabled) {
        try {
          addWorkingStep(this.workingFormId, newStep)
          
          // Mettre à jour les étapes locales
          this.localSteps.push(newStep)
          
          console.log('💾 Nouvelle étape auto-sauvegardée:', newStep.id)
        } catch (error) {
          console.error('Erreur lors de l\'auto-sauvegarde de l\'étape:', error)
        }
      }
    },

    /**
     * Handle form submission
     */
    async onSubmit(data: Record<string, unknown>): Promise<void> {
      // Auto-save les données du formulaire
      if (this.hasActiveSession && this.autoSaveEnabled) {
        try {
          updateWorkingFormState(this.workingFormId, {
            data,
            touched: this.formState.touched,
            errors: {},
            submitting: true,
            valid: true
          })
        } catch (error) {
          console.error('Erreur lors de l\'auto-sauvegarde des données du formulaire:', error)
        }
      }
      
      this.$emit('submit', data)
    },

    /**
     * Submit form
     */
    async submitForm(): Promise<void> {
      try {
        this.error = null
        const isValid = await this.$store.dispatch('form/validateForm')
        
        if (isValid) {
          const result = await this.$store.dispatch('form/submitForm')
          this.$emit('submit', result)
        } else {
          this.error = 'Veuillez corriger les erreurs dans le formulaire'
        }
      } catch (error) {
        this.error = 'Erreur lors de la soumission du formulaire'
        console.error('Form submission failed:', error)
      }
    },

    /**
     * Sauvegarde complète du formulaire en base de données
     */
    async saveConfig(): Promise<void> {
      try {
        this.loading = true
        this.error = null
        
        console.log('🚀 Début de la sauvegarde, workingFormId:', this.workingFormId)
        console.log('📋 Étapes à sauvegarder:', this.formSteps)
        console.log('📝 Champs à sauvegarder:', this.formFields)
        
        // ✨ NOUVEAU: Préparer les données pour la structure JSON optimisée
        const saveData = {
          // Configuration du formulaire
          title: this.config?.title || 'Formulaire sans titre',
          description: this.config?.description || '',
          mode: this.mode,
          layout: this.config?.layout || 'VERTICAL',
          spacing: this.config?.spacing || 'NORMAL',
          submitButtonText: this.config?.submitButtonText || 'Soumettre',
          cancelButtonText: this.config?.cancelButtonText || 'Annuler',
          resetButtonText: this.config?.resetButtonText || 'Réinitialiser',
          validateOnSubmit: this.config?.validateOnSubmit ?? true,
          validateOnBlur: this.config?.validateOnBlur ?? false,
          validateOnChange: this.config?.validateOnChange ?? false,
          isPublished: false,
          
          // ✨ Structure JSON optimisée pour les étapes
          steps: this.formSteps.map(step => ({
            id: step.id,
            title: step.title,
            description: step.description,
            order: step.order,
            icon: step.icon,
            fields: this.formFields
              .filter(field => field.stepId === step.id)
              .map(field => field.id) // Liste des IDs des champs
          })),
          
          // ✨ Structure JSON optimisée pour les champs
          fields: this.formFields.map(field => ({
            id: field.id,
            name: field.name,
            type: field.type.toUpperCase(), // Convertir text -> TEXT pour l'API
            label: field.label,
            placeholder: field.placeholder,
            helpText: field.helpText,
            defaultValue: field.defaultValue,
            order: field.order,
            width: field.width?.toUpperCase() || 'FULL', // Convertir full -> FULL
            position: field.position?.toUpperCase() || 'LEFT',
            disabled: field.disabled || false,
            readonly: field.readonly || false,
            class: field.class,
            icon: field.icon,
            prefix: field.prefix,
            suffix: field.suffix,
            rows: field.rows,
            accept: field.accept,
            multiple: field.multiple || false,
            min: field.min,
            max: field.max,
            step: field.step,
            validation: field.validation,
            conditionalLogic: field.conditionalLogic,
            apiConfig: field.apiConfig,
            stepId: field.stepId, // Référence à l'étape
            options: field.options || []
          }))
        }
        
        console.log('💾 Données préparées pour sauvegarde:', saveData)
        
        // Déterminer si c'est une création ou une mise à jour
        const isNewForm = !this.workingFormId || this.workingFormId === 'new' || this.workingFormId.startsWith('form_')
        
        console.log('🔍 Type de sauvegarde:', isNewForm ? 'CRÉATION' : 'MISE À JOUR')
        
        // Utiliser le store Vuex pour la sauvegarde
        const result = await this.$store.dispatch('form/saveCompleteForm', {
          formId: isNewForm ? 'new' : this.workingFormId,
          formData: saveData
        })
        
        console.log('✅ Résultat de la sauvegarde:', result)
        
        if (result?.success) {
          // Mise à jour de l'ID du formulaire si c'était une création
          if (isNewForm) {
            if (this.workingSession) {
              this.workingSession.formId = result.data.form.id
              this.autoSaveSession({ formId: result.data.form.id })
            }
          }
          
          // Nettoyer la session de travail après sauvegarde réussie
          if (this.hasActiveSession) {
            clearWorkingSession()
            this.workingSession = null
            this.localFields = []
            this.localSteps = []
            this.localFormState = null
            
            console.log('🧹 Session de travail nettoyée après sauvegarde')
          }
          
          // Notification de succès
          alert('Formulaire sauvegardé avec succès en base de données!')
          
          this.$emit('save', result.data.form)
        }
        
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error)
        this.error = 'Erreur lors de la sauvegarde du formulaire'
        
        // Notification d'erreur détaillée
        const errorMsg = (error as Error)?.message || 'Erreur inconnue'
        alert(`Impossible de sauvegarder le formulaire: ${errorMsg}. Vos modifications restent en mémoire.`)
      } finally {
        this.loading = false
      }
    },

    /**
     * Sauvegarde rapide/brouillon (localStorage seulement)
     */
    quickSave(): void {
      if (!this.hasActiveSession || !this.autoSaveEnabled) return
      
      try {
        this.performAutoSave()
        
        // Notification discrète
        alert('Brouillon sauvegardé localement!')
        console.log('💾 Sauvegarde rapide effectuée')
      } catch (error) {
        console.error('Erreur lors de la sauvegarde rapide:', error)
        alert('Erreur lors de la sauvegarde rapide')
      }
    },

    /**
     * Reset form and clear working session
     */
    reset(): void {
      // Nettoyer la session de travail
      if (this.hasActiveSession) {
        clearWorkingSession()
        this.workingSession = null
        this.localFields = []
        this.localSteps = []
        this.localFormState = null
        
        console.log('🧹 Session de travail nettoyée après réinitialisation')
      }
      
      // Réinitialiser le store
      this.$store.dispatch('form/reset')
      
      // Créer une nouvelle session
      this.initializeForm()
      
      this.$emit('reset')
    },

    /**
     * Cancel form editing with confirmation
     */
    cancel(): void {
      // Demander confirmation à l'utilisateur
      if (this.hasActiveSession) {
        const confirmation = confirm('Voulez-vous sauvegarder vos modifications avant de quitter?')
        
        if (confirmation) {
          this.saveConfig()
        } else {
          // Nettoyer la session de travail sans sauvegarder
          clearWorkingSession()
          this.workingSession = null
          this.localFields = []
          this.localSteps = []
          this.localFormState = null
        }
      }
      
      this.$emit('cancel')
    },

    /**
     * Clear error message
     */
    clearError(): void {
      this.error = null
    },

    /**
     * Type guard to check if the object is a StepFormField
     */
    isStepFormField(obj: FieldTemplate | StepFormField): obj is StepFormField {
      return 'id' in obj && 'formId' in obj && 'stepId' in obj
    },

    /**
     * Type guard to check if the object is a FieldTemplate
     */
    isFieldTemplate(obj: FieldTemplate | StepFormField): obj is FieldTemplate {
      return !('id' in obj) && !('formId' in obj)
    }
  },

  emits: ['submit', 'save', 'reset', 'cancel', 'form-submitted', 'submissions-loaded']
}
</script>

<style scoped>
.dynamic-form {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Styles personnalisés si nécessaire */
.form-builder-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.form-builder-main {
  flex: 1;
  overflow-y: auto;
}

.form-builder-sidebar {
  width: 320px;
  background-color: #f9fafb;
  border-color: #e5e7eb;
  overflow-y: auto;
}

.form-builder-sidebar--left {
  border-right: 1px solid #e5e7eb;
}

.form-builder-sidebar--right {
  border-left: 1px solid #e5e7eb;
}

/* Animation pour les transitions */
.loading-overlay {
  backdrop-filter: blur(4px);
  transition: opacity 0.2s ease-in-out;
}

.error-notification {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Styles pour les boutons d'action */
.action-button {
  transition: all 0.15s ease-in-out;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.action-button:active {
  transform: translateY(0);
}

/* Styles pour le sélecteur de mode */
.mode-selector {
  transition: border-color 0.15s ease-in-out;
}

.mode-selector:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Styles pour les indicateurs de chargement */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Styles pour améliorer l'accessibilité */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Styles pour les focus states améliorés */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Styles responsive */
@media (max-width: 768px) {
  .form-builder-sidebar {
    width: 280px;
  }
  
  .dynamic-form .header-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .dynamic-form .header-actions button {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }
}

@media (max-width: 640px) {
  .form-builder-layout {
    flex-direction: column;
  }
  
  .form-builder-sidebar {
    width: 100%;
    max-height: 200px;
  }
  
  .dynamic-form .header {
    padding: 1rem;
  }
  
  .dynamic-form .header-content {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Styles pour les états de disabled */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Styles pour les tooltips si nécessaire */
.tooltip {
  position: relative;
}

.tooltip::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  z-index: 1000;
}

.tooltip:hover::before {
  opacity: 1;
}

/* Amélioration de la scrollbar pour webkit */
.form-builder-sidebar::-webkit-scrollbar,
.form-builder-main::-webkit-scrollbar {
  width: 6px;
}

.form-builder-sidebar::-webkit-scrollbar-track,
.form-builder-main::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.form-builder-sidebar::-webkit-scrollbar-thumb,
.form-builder-main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.form-builder-sidebar::-webkit-scrollbar-thumb:hover,
.form-builder-main::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>


