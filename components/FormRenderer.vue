<template>
  <div class="form-renderer">
    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <Icon name="heroicons:arrow-path" class="animate-spin w-8 h-8 text-blue-600" />
      </div>
      <p class="loading-text">Chargement du formulaire...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state">
      <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button @click="retryLoading" class="retry-btn">
        <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
        Réessayer
      </button>
    </div>

    <!-- Formulaire principal -->
    <div v-else-if="formConfig" class="form-container">
      <!-- En-tête du formulaire -->
      <div class="form-header">
        <div class="form-header-content">
          <div class="form-icon" v-if="formConfig.icon">
            <Icon :name="formConfig.icon" class="w-8 h-8 text-blue-600" />
          </div>
          <div class="form-meta">
            <h1 class="form-title">{{ formConfig.title }}</h1>
            <p v-if="formConfig.description" class="form-description">
              {{ formConfig.description }}
            </p>
          </div>
        </div>

        <!-- Indicateur de progression pour formulaires multi-étapes -->
        <div v-if="formConfig.steps.length > 1" class="progress-section">
          <div class="progress-header">
            <span class="progress-text">
              Étape {{ currentStepIndex + 1 }} sur {{ formConfig.steps.length }}
            </span>
            <span class="progress-percentage">
              {{ Math.round(((currentStepIndex + 1) / formConfig.steps.length) * 100) }}%
            </span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${((currentStepIndex + 1) / formConfig.steps.length) * 100}%` }"
            ></div>
          </div>

          <!-- Navigation par étapes pour formulaires longs -->
          <div v-if="formConfig.steps.length > 2" class="step-navigation">
            <button 
              v-for="(step, index) in formConfig.steps"
              :key="step.id"
              @click="goToStep(index)"
              class="step-nav-item"
              :class="{ 
                'active': index === currentStepIndex,
                'completed': index < currentStepIndex,
                'disabled': index > currentStepIndex + 1
              }"
              :disabled="index > currentStepIndex + 1"
            >
              <div class="step-indicator">
                <Icon 
                  v-if="index < currentStepIndex" 
                  name="heroicons:check" 
                  class="w-4 h-4" 
                />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span class="step-label">{{ step.title }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Contenu de l'étape actuelle -->
      <form @submit.prevent="handleSubmit" class="form-content">
        <div v-if="currentStep" class="step-content">
          <!-- Titre et description de l'étape -->
          <div v-if="formConfig.steps.length > 1" class="step-header">
            <h2 class="step-title">{{ currentStep.title }}</h2>
            <p v-if="currentStep.description" class="step-description">
              {{ currentStep.description }}
            </p>
          </div>

          <!-- Champs du formulaire -->
          <div class="fields-container" :class="formConfig.layout.toLowerCase()">
            <div class="fields-grid">
              <FieldRenderer
                v-for="field in visibleFields"
                :key="field.id"
                :field="field"
                :value="getFieldValue(field.id)"
                :errors="fieldErrors[field.id]"
                :disabled="isSubmitting || isFieldDisabled(field)"
                :show-labels="true"
                :is-preview="false"
                @update:value="updateFieldValue(field.id, $event)"
                @validate="validateField(field.id)"
                class="field-item"
                :class="[
                  `width-${field.width || 'full'}`,
                  formConfig.spacing.toLowerCase(),
                  { 'has-error': fieldErrors[field.id] }
                ]"
              />
            </div>
          </div>

          <!-- Messages de validation d'étape -->
          <div v-if="stepMessages[currentStep.id]" class="step-messages">
            <div 
              v-for="message in stepMessages[currentStep.id]"
              :key="message.id"
              class="step-message"
              :class="message.type"
            >
              <Icon 
                :name="message.type === 'success' ? 'heroicons:check-circle' : 'heroicons:exclamation-triangle'"
                class="w-5 h-5"
              />
              <span>{{ message.text }}</span>
            </div>
          </div>
        </div>

        <!-- Actions du formulaire -->
        <div class="form-actions">
          <div class="action-buttons">
            <!-- Bouton précédent -->
            <button
              v-if="currentStepIndex > 0"
              type="button"
              @click="goToPreviousStep"
              class="btn btn-secondary"
              :disabled="isSubmitting"
            >
              <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" />
              Précédent
            </button>

            <!-- Bouton suivant/soumettre -->
            <button
              v-if="!isLastStep"
              type="button"
              @click="goToNextStep"
              class="btn btn-primary"
              :disabled="isSubmitting || !canProceedToNext"
            >
              <Icon 
                v-if="isValidatingStep" 
                name="heroicons:arrow-path" 
                class="animate-spin w-4 h-4 mr-2" 
              />
              <Icon v-else name="heroicons:arrow-right" class="w-4 h-4 mr-2" />
              {{ isValidatingStep ? 'Validation...' : 'Suivant' }}
            </button>

            <button
              v-else
              type="submit"
              class="btn btn-success"
              :disabled="isSubmitting || !canSubmit"
            >
              <Icon 
                v-if="isSubmitting" 
                name="heroicons:arrow-path" 
                class="animate-spin w-4 h-4 mr-2" 
              />
              <Icon v-else name="heroicons:paper-airplane" class="w-4 h-4 mr-2" />
              {{ isSubmitting ? 'Envoi en cours...' : 'Soumettre' }}
            </button>
          </div>

          <!-- Actions secondaires -->
          <div class="secondary-actions">
            <button
              type="button"
              @click="resetForm"
              class="btn btn-outline"
              :disabled="isSubmitting"
            >
              <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" />
              Réinitialiser
            </button>

            <button
              type="button"
              @click="saveAsDraft"
              class="btn btn-outline"
              :disabled="isSubmitting"
            >
              <Icon name="heroicons:bookmark" class="w-4 h-4 mr-2" />
              Sauvegarder
            </button>
          </div>
        </div>
      </form>

      <!-- Modal de succès -->
      <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
        <div class="success-modal" @click.stop>
          <div class="success-content">
            <div class="success-icon">
              <Icon name="heroicons:check-circle" class="w-16 h-16 text-green-500" />
            </div>
            <h3 class="success-title">Formulaire soumis avec succès !</h3>
            <p class="success-description">
              Votre demande a été enregistrée et sera traitée dans les plus brefs délais.
            </p>
            <div class="success-actions">
              <button @click="createNewForm" class="btn btn-primary">
                Nouveau formulaire
              </button>
              <button @click="closeSuccessModal" class="btn btn-outline">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="empty-state">
      <Icon name="heroicons:document-text" class="w-12 h-12 text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun formulaire trouvé</h3>
      <p class="text-gray-600">Le formulaire demandé n'existe pas ou n'est plus disponible.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { FormConfig, FormStep, FormField } from '~/types/form'
import FieldRenderer from '~/pages/form/components/FieldRenderer.vue'

// Props
interface Props {
  formId?: string
  formConfig?: FormConfig
  autoSubmit?: boolean
  showProgress?: boolean
  allowSaveAsDraft?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoSubmit: false,
  showProgress: true,
  allowSaveAsDraft: true
})

// Emits
const emit = defineEmits<{
  formLoaded: [config: FormConfig]
  stepChanged: [stepIndex: number, step: FormStep]
  formSubmitted: [data: Record<string, any>]
  formSaved: [data: Record<string, any>]
  error: [error: string]
}>()

// État principal
const loading = ref(false)
const error = ref<string | null>(null)
const formConfig = ref<FormConfig | null>(props.formConfig || null)
const currentStepIndex = ref(0)
const formData = ref<Record<string, any>>({})
const fieldErrors = ref<Record<string, string[]>>({})
const stepMessages = ref<Record<string, Array<{ id: string, type: string, text: string }>>>({})

// États de soumission
const isSubmitting = ref(false)
const isValidatingStep = ref(false)
const showSuccessModal = ref(false)

// Computed
const currentStep = computed(() => {
  return formConfig.value?.steps[currentStepIndex.value] || null
})

const isLastStep = computed(() => {
  return currentStepIndex.value === (formConfig.value?.steps.length || 0) - 1
})

const visibleFields = computed(() => {
  if (!currentStep.value) return []
  
  return currentStep.value.fields
    .filter(field => isFieldVisible(field))
    .sort((a, b) => a.order - b.order)
})

const canProceedToNext = computed(() => {
  return validateCurrentStep() && !isValidatingStep.value
})

const canSubmit = computed(() => {
  return validateCurrentStep() && isLastStep.value
})

// Fonctions utilitaires
const getFieldValue = (fieldId: string) => {
  return formData.value[fieldId] || ''
}

const isFieldVisible = (field: FormField): boolean => {
  // Logique conditionnelle
  if (!field.conditionalLogic || !field.conditionalLogic.enabled) return true
  
  const condLogic = field.conditionalLogic
  const shouldShow = condLogic.action === 'show'
  
  // Évaluer toutes les règles
  const ruleResults = condLogic.rules.map(rule => {
    const conditionValue = formData.value[rule.targetFieldId]
    
    switch (rule.operator) {
      case 'equals':
        return conditionValue === rule.value
      case 'not_equals':
        return conditionValue !== rule.value
      case 'contains':
        return String(conditionValue).includes(String(rule.value))
      case 'not_contains':
        return !String(conditionValue).includes(String(rule.value))
      case 'empty':
        return !conditionValue || conditionValue === ''
      case 'not_empty':
        return conditionValue && conditionValue !== ''
      case 'greater_than':
        return Number(conditionValue) > Number(rule.value)
      case 'less_than':
        return Number(conditionValue) < Number(rule.value)
      default:
        return true
    }
  })
  
  // Appliquer l'opérateur logique
  const conditionMet = condLogic.logicalOperator === 'AND' 
    ? ruleResults.every(result => result)
    : ruleResults.some(result => result)
  
  // Si l'action est 'show', on affiche si condition met, sinon on cache
  return shouldShow ? conditionMet : !conditionMet
}

const isFieldDisabled = (field: FormField): boolean => {
  return field.disabled || field.readonly || false
}

// Gestion des données
const updateFieldValue = (fieldId: string, value: any) => {
  formData.value[fieldId] = value
  
  // Effacer les erreurs pour ce champ
  if (fieldErrors.value[fieldId]) {
    delete fieldErrors.value[fieldId]
  }
  
  // Valider le champ en temps réel
  validateField(fieldId)
}

const validateField = (fieldId: string) => {
  const field = currentStep.value?.fields.find(f => f.id === fieldId)
  if (!field) return true
  
  const value = formData.value[fieldId]
  const errors: string[] = []
  
  // Validation required
  if (field.required && (!value || value === '')) {
    errors.push('Ce champ est obligatoire')
  }
  
  // Validation par type
  if (value && field.validation) {
    const validation = field.validation
    
    if (validation.minLength && String(value).length < validation.minLength) {
      errors.push(`Minimum ${validation.minLength} caractères`)
    }
    
    if (validation.maxLength && String(value).length > validation.maxLength) {
      errors.push(`Maximum ${validation.maxLength} caractères`)
    }
    
    if (validation.pattern && !new RegExp(validation.pattern).test(String(value))) {
      errors.push('Format invalide')
    }
  }
  
  if (errors.length > 0) {
    fieldErrors.value[fieldId] = errors
    return false
  } else {
    delete fieldErrors.value[fieldId]
    return true
  }
}

const validateCurrentStep = (): boolean => {
  if (!currentStep.value) return false
  
  let isValid = true
  
  for (const field of visibleFields.value) {
    if (!validateField(field.id)) {
      isValid = false
    }
  }
  
  return isValid
}

// Navigation entre étapes
const goToStep = (index: number) => {
  if (index < 0 || index >= (formConfig.value?.steps.length || 0)) return
  if (index > currentStepIndex.value + 1) return // Ne peut pas sauter d'étapes
  
  currentStepIndex.value = index
  emit('stepChanged', index, currentStep.value!)
}

const goToPreviousStep = () => {
  if (currentStepIndex.value > 0) {
    goToStep(currentStepIndex.value - 1)
  }
}

const goToNextStep = async () => {
  if (!validateCurrentStep()) return
  
  // Validation API si configurée
  if (currentStep.value?.apiConfig?.enabled) {
    await validateStepWithApi()
  }
  
  if (currentStepIndex.value < (formConfig.value?.steps.length || 0) - 1) {
    goToStep(currentStepIndex.value + 1)
  }
}

// Validation API
const validateStepWithApi = async () => {
  if (!currentStep.value?.apiConfig) return
  
  isValidatingStep.value = true
  
  try {
    const stepApiConfig = currentStep.value.apiConfig
    const stepData: Record<string, any> = {}
    
    // Mapper les champs vers les paramètres API
    for (const mapping of stepApiConfig.fieldMappings) {
      stepData[mapping.parameterName] = formData.value[mapping.fieldId]
    }
    
    // Ajouter les paramètres statiques
    Object.assign(stepData, stepApiConfig.staticParams || {})
    
    const fetchOptions: RequestInit = {
      method: stepApiConfig.method,
      headers: {
        'Content-Type': 'application/json',
        ...stepApiConfig.headers
      }
    }
    
    if (stepApiConfig.method !== 'GET') {
      fetchOptions.body = JSON.stringify(stepData)
    }
    
    const url = stepApiConfig.method === 'GET' 
      ? `${stepApiConfig.endpoint}?${new URLSearchParams(stepData).toString()}`
      : stepApiConfig.endpoint
    
    const response = await fetch(url, fetchOptions)
    
    if (!response.ok) {
      throw new Error('Erreur de validation API')
    }
    
    // Afficher message de succès
    addStepMessage(currentStep.value.id, 'success', stepApiConfig.successMessage || 'Validation réussie')
    
  } catch (err: any) {
    const stepApiConfig = currentStep.value?.apiConfig
    const errorMessage = stepApiConfig?.errorMessage || 'Erreur de validation'
    addStepMessage(currentStep.value.id, 'error', errorMessage)
    
    if (stepApiConfig?.validationRequired) {
      throw new Error(errorMessage)
    }
  } finally {
    isValidatingStep.value = false
  }
}

const addStepMessage = (stepId: string, type: string, text: string) => {
  if (!stepMessages.value[stepId]) {
    stepMessages.value[stepId] = []
  }
  
  const message = {
    id: Date.now().toString(),
    type,
    text
  }
  
  stepMessages.value[stepId].push(message)
  
  // Supprimer le message après 5 secondes
  setTimeout(() => {
    const messages = stepMessages.value[stepId]
    if (messages) {
      const index = messages.findIndex(m => m.id === message.id)
      if (index > -1) {
        messages.splice(index, 1)
      }
    }
  }, 5000)
}

// Soumission du formulaire
const handleSubmit = async () => {
  if (!validateCurrentStep() || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Validation API de la dernière étape si nécessaire
    if (currentStep.value?.apiConfig?.enabled) {
      await validateStepWithApi()
    }
    
    // Soumettre le formulaire
    const response = await fetch('/api/form-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId: formConfig.value?.id,
        data: formData.value,
        completedAt: new Date().toISOString()
      })
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la soumission')
    }
    
    emit('formSubmitted', formData.value)
    showSuccessModal.value = true
    
  } catch (err: any) {
    const errorMessage = err.message || 'Erreur lors de la soumission'
    error.value = errorMessage
    emit('error', errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// Actions du formulaire
const resetForm = () => {
  formData.value = {}
  fieldErrors.value = {}
  stepMessages.value = {}
  currentStepIndex.value = 0
}

const saveAsDraft = async () => {
  try {
    const response = await fetch('/api/form-drafts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId: formConfig.value?.id,
        data: formData.value,
        currentStep: currentStepIndex.value,
        savedAt: new Date().toISOString()
      })
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la sauvegarde')
    }
    
    emit('formSaved', formData.value)
    
  } catch (err: any) {
    error.value = 'Erreur lors de la sauvegarde'
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const createNewForm = () => {
  resetForm()
  closeSuccessModal()
}

// Chargement du formulaire
const loadForm = async () => {
  if (!props.formId) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`/api/form/${props.formId}`)
    const data = await response.json()
    
    if (data.success) {
      formConfig.value = data.data
      emit('formLoaded', data.data)
    } else {
      throw new Error(data.message || 'Formulaire non trouvé')
    }
  } catch (err: any) {
    const errorMessage = err.message || 'Erreur de chargement'
    error.value = errorMessage
    emit('error', errorMessage)
  } finally {
    loading.value = false
  }
}

const retryLoading = () => {
  loadForm()
}

// Lifecycle
onMounted(() => {
  if (props.formId) {
    loadForm()
  } else if (props.formConfig) {
    formConfig.value = props.formConfig
    emit('formLoaded', props.formConfig)
  }
})

// Watchers
watch(() => props.formId, (newId) => {
  if (newId) {
    loadForm()
  }
})

watch(() => props.formConfig, (newConfig) => {
  if (newConfig) {
    formConfig.value = newConfig
    emit('formLoaded', newConfig)
  }
})
</script>

<style scoped>
.form-renderer {
  @apply max-w-4xl mx-auto;
}

/* États de chargement et d'erreur */
.loading-state, .error-state, .empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.loading-text {
  @apply mt-4 text-gray-600;
}

.retry-btn {
  @apply inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
}

/* Container principal */
.form-container {
  @apply bg-white rounded-xl shadow-lg overflow-hidden;
}

/* En-tête du formulaire */
.form-header {
  @apply bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6;
}

.form-header-content {
  @apply flex items-start gap-4 mb-6;
}

.form-icon {
  @apply flex-shrink-0 w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm;
}

.form-title {
  @apply text-2xl font-bold text-gray-900;
}

.form-description {
  @apply text-gray-600 mt-2;
}

/* Indicateur de progression */
.progress-section {
  @apply space-y-4;
}

.progress-header {
  @apply flex justify-between items-center text-sm;
}

.progress-text {
  @apply font-medium text-gray-700;
}

.progress-percentage {
  @apply text-blue-600 font-semibold;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}

/* Navigation par étapes */
.step-navigation {
  @apply flex gap-2 overflow-x-auto pb-2;
}

.step-nav-item {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap;
}

.step-nav-item.active {
  @apply bg-blue-600 text-white border-blue-600;
}

.step-nav-item.completed {
  @apply bg-green-50 text-green-700 border-green-200;
}

.step-nav-item.disabled {
  @apply opacity-50 cursor-not-allowed;
}

.step-indicator {
  @apply flex items-center justify-center w-6 h-6 rounded-full bg-current bg-opacity-20 text-sm font-medium;
}

.step-label {
  @apply text-sm font-medium;
}

/* Contenu du formulaire */
.form-content {
  @apply p-6;
}

.step-header {
  @apply mb-8 pb-4 border-b border-gray-200;
}

.step-title {
  @apply text-xl font-semibold text-gray-900;
}

.step-description {
  @apply text-gray-600 mt-2;
}

/* Grille des champs */
.fields-grid {
  @apply grid gap-6;
  grid-template-columns: repeat(12, 1fr);
}

.field-item {
  @apply transition-all duration-200;
}

.field-item.width-full {
  @apply col-span-12;
}

.field-item.width-half {
  @apply col-span-12 md:col-span-6;
}

.field-item.width-third {
  @apply col-span-12 md:col-span-4;
}

.field-item.width-quarter {
  @apply col-span-12 md:col-span-3;
}

.field-item.compact {
  @apply gap-2;
}

.field-item.relaxed {
  @apply gap-8;
}

.field-item.has-error {
  @apply transform scale-[1.02];
}

/* Messages d'étape */
.step-messages {
  @apply mt-6 space-y-3;
}

.step-message {
  @apply flex items-center gap-3 p-4 rounded-lg;
}

.step-message.success {
  @apply bg-green-50 text-green-700 border border-green-200;
}

.step-message.error {
  @apply bg-red-50 text-red-700 border border-red-200;
}

/* Actions du formulaire */
.form-actions {
  @apply mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-4;
}

.action-buttons {
  @apply flex gap-3;
}

.secondary-actions {
  @apply flex gap-3;
}

/* Boutons */
.btn {
  @apply inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Modal de succès */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.success-modal {
  @apply bg-white rounded-xl max-w-md w-full;
}

.success-content {
  @apply p-8 text-center;
}

.success-icon {
  @apply mx-auto mb-4;
}

.success-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.success-description {
  @apply text-gray-600 mb-6;
}

.success-actions {
  @apply flex gap-3 justify-center;
}

/* Responsive */
@media (max-width: 640px) {
  .form-header {
    @apply p-4;
  }
  
  .form-content {
    @apply p-4;
  }
  
  .form-header-content {
    @apply flex-col gap-3;
  }
  
  .step-navigation {
    @apply gap-1;
  }
  
  .step-nav-item {
    @apply px-2 py-1 text-xs;
  }
  
  .action-buttons, .secondary-actions {
    @apply flex-col;
  }
}
</style>
