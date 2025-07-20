<template>
  <div class="form-preview-step">
    <!-- Header de l'étape -->
    <div class="step-header">
      <h3 class="step-title">{{ step.title }}</h3>
      <p v-if="step.description" class="step-description">{{ step.description }}</p>
      
      <!-- Indicateur API -->
      <div v-if="step.apiConfig?.enabled" class="api-indicator">
        <Icon 
          name="heroicons:link" 
          class="api-icon"
          :class="{ 'validation-required': step.apiConfig.validationRequired }"
        />
        <span class="api-text">
          {{ step.apiConfig.validationRequired ? 'Validation API requise' : 'Vérification API optionnelle' }}
        </span>
      </div>
    </div>

    <!-- Champs de l'étape -->
    <div class="step-fields">
      <FieldRenderer
        v-for="field in sortedFields"
        :key="field.id"
        :field="field"
        :value="formData[field.name]"
        :formValues="formData"
        :allFields="allFields"
        @update:value="(value: any) => updateFieldValue(field.name, value)"
        :disabled="isValidating"
        :isBuilder="false"
        :isPreview="true"
      />
    </div>

    <!-- Messages de validation API -->
    <div v-if="validationError" class="validation-message error">
      <Icon name="heroicons:exclamation-triangle" />
      {{ validationError }}
    </div>
    
    <div v-if="validationSuccess" class="validation-message success">
      <Icon name="heroicons:check-circle" />
      {{ validationSuccess }}
    </div>

    <!-- Actions de l'étape -->
    <div class="step-actions">
      <button
        v-if="canGoPrevious"
        @click="$emit('previous')"
        class="step-btn previous"
        :disabled="isValidating"
      >
        <Icon name="heroicons:arrow-left" />
        Précédent
      </button>

      <button
        v-if="step.apiConfig?.enabled"
        @click="validateWithApi"
        class="step-btn validate"
        :disabled="isValidating || !hasRequiredFields"
      >
        <Icon 
          v-if="isValidating" 
          name="heroicons:arrow-path" 
          class="animate-spin" 
        />
        <Icon v-else name="heroicons:shield-check" />
        {{ isValidating ? 'Vérification...' : 'Valider' }}
      </button>

      <button
        v-if="canGoNext && !isLastStep"
        @click="handleNext"
        class="step-btn next"
        :disabled="isValidating || (step.apiConfig?.validationRequired && !validationSuccess)"
      >
        Suivant
        <Icon name="heroicons:arrow-right" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormStep, FormField } from '~/types/form'
import { useStepApi } from '../composables/useStepApi'
import FieldRenderer from './FieldRenderer.vue'

const props = defineProps<{
  step: FormStep
  formData: Record<string, any>
  allFields: any[]
  canGoPrevious: boolean
  canGoNext: boolean
  isLastStep: boolean
}>()

const emit = defineEmits<{
  'update-field': [fieldName: string, value: any]
  'previous': []
  'next': []
  'validate-api': []
}>()

// Composables
const { isValidating, validationError, validationSuccess, validateStepWithApi, clearValidationState } = useStepApi()

// Computed
const sortedFields = computed(() => {
  return props.step.fields.sort((a, b) => a.order - b.order)
})

const hasRequiredFields = computed(() => {
  return sortedFields.value
    .filter(field => field.required)
    .every(field => {
      const value = props.formData[field.name]
      return value !== undefined && value !== null && value !== ''
    })
})

// Methods
const updateFieldValue = (fieldName: string, value: any) => {
  emit('update-field', fieldName, value)
  
  // Effacer les messages de validation si l'utilisateur modifie les données
  if (validationError.value || validationSuccess.value) {
    clearValidationState()
  }
}

const validateWithApi = async () => {
  if (!props.step.apiConfig?.enabled) return

  try {
    const isValid = await validateStepWithApi(
      props.step.apiConfig,
      props.formData,
      sortedFields.value
    )
    
    if (isValid) {
      emit('validate-api')
    }
  } catch (error) {
    console.error('Erreur lors de la validation API:', error)
  }
}

const handleNext = () => {
  // Si une validation API est requise et qu'elle n'a pas été effectuée avec succès
  if (props.step.apiConfig?.validationRequired && !validationSuccess.value) {
    validateWithApi()
    return
  }
  
  emit('next')
}

// Lifecycle
onMounted(() => {
  clearValidationState()
})
</script>

<style scoped>
.form-preview-step {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.step-header {
  margin-bottom: 2rem;
  text-align: center;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-description {
  color: #6b7280;
  margin-bottom: 1rem;
}

.api-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #6b7280;
}

.api-icon {
  width: 1rem;
  height: 1rem;
}

.api-icon.validation-required {
  color: #f59e0b;
}

.step-fields {
  margin-bottom: 2rem;
  line-height: 0; /* Évite les espaces entre les champs inline-block */
}

.step-fields > * {
  line-height: normal; /* Remet la hauteur de ligne normale pour le contenu */
}

.validation-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.validation-message.error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.validation-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.step-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.step-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-btn.previous {
  background: #f3f4f6;
  color: #6b7280;
}

.step-btn.previous:hover:not(:disabled) {
  background: #e5e7eb;
}

.step-btn.validate {
  background: #f59e0b;
  color: white;
}

.step-btn.validate:hover:not(:disabled) {
  background: #d97706;
}

.step-btn.next {
  background: #3b82f6;
  color: white;
  margin-left: auto;
}

.step-btn.next:hover:not(:disabled) {
  background: #2563eb;
}
</style>
