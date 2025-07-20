<template>
  <div class="form-preview">
    <div class="preview-container">
      <div v-if="!shouldShowForm" class="preview-empty">
        <div class="empty-content">
          <Icon name="heroicons:document-text" class="empty-icon" />
          <p>{{ !props.formConfig ? 'Aucune donnée de formulaire à prévisualiser' : 'Aucune étape configurée' }}</p>
          <p class="empty-description">
            {{ !props.formConfig ? 'Configurez votre formulaire pour voir l\'aperçu' : 'Ajoutez des étapes à votre formulaire' }}
          </p>
        </div>
      </div>
      
      <div v-else class="preview-content">
        <!-- Header du formulaire -->
        <div class="form-header">
          <h2 class="form-title">{{ formConfig?.title }}</h2>
          <p v-if="formConfig?.description" class="form-description">
            {{ formConfig.description }}
          </p>
          
          <!-- Indicateur de progression pour formulaires multi-étapes -->
          <div v-if="formConfig && formConfig.steps.length > 1" class="progress-indicator">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${(currentStepIndex + 1) / (formConfig?.steps?.length || 1) * 100}%` }"
              ></div>
            </div>
            <span class="progress-text">
              Étape {{ currentStepIndex + 1 }} sur {{ formConfig?.steps.length }}
            </span>
          </div>
        </div>

        <!-- Formulaire interactif -->
        <form @submit.prevent="handleFormSubmit" class="preview-form">
          <!-- Étape actuelle -->
          <FormStepPreview
            v-if="currentStep"
            :step="currentStep"
            :form-data="formData"
            :all-fields="allFields"
            :can-go-previous="currentStepIndex > 0"
            :can-go-next="currentStepIndex < (formConfig?.steps?.length || 0) - 1 || canSubmit"
            :is-last-step="currentStepIndex === (formConfig?.steps?.length || 0) - 1"
            @update-field="updateFieldValue"
            @previous="goToPreviousStep"
            @next="goToNextStep"
            @validate-api="handleApiValidation"
          />

          <!-- Messages globaux -->
          <div v-if="globalMessage" class="global-message" :class="globalMessage.type">
            <Icon 
              :name="globalMessage.type === 'success' ? 'heroicons:check-circle' : 'heroicons:exclamation-triangle'" 
            />
            {{ globalMessage.text }}
          </div>
        </form>

        <!-- Actions globales du formulaire -->
        <div class="form-actions">
          <button
            type="button"
            @click="resetForm"
            class="action-btn reset"
            :disabled="isSubmitting"
          >
            <Icon name="heroicons:arrow-path" />
            Réinitialiser
          </button>

          <button
            type="button"
            @click="previewFormData"
            class="action-btn preview"
          >
            <Icon name="heroicons:eye" />
            Voir les données
          </button>

          <button
            v-if="formConfig && currentStepIndex === formConfig.steps.length - 1"
            type="button"
            @click="handleFormSubmit"
            class="action-btn submit"
            :disabled="isSubmitting || !canSubmit"
          >
            <Icon 
              v-if="isSubmitting" 
              name="heroicons:arrow-path" 
              class="animate-spin" 
            />
            <Icon v-else name="heroicons:paper-airplane" />
            {{ isSubmitting ? 'Envoi...' : 'Soumettre le formulaire' }}
          </button>
        </div>

        <!-- Modal de prévisualisation des données -->
        <div v-if="showDataPreview" class="modal-overlay" @click="showDataPreview = false">
          <div class="data-preview-modal" @click.stop>
            <div class="modal-header">
              <h3>Données du formulaire</h3>
              <button @click="showDataPreview = false" class="close-btn">
                <Icon name="heroicons:x-mark" />
              </button>
            </div>
            <div class="modal-body">
              <pre class="data-json">{{ JSON.stringify(formData, null, 2) }}</pre>
            </div>
            <div class="modal-footer">
              <button @click="copyFormData" class="copy-btn">
                <Icon name="heroicons:clipboard" />
                Copier JSON
              </button>
              <button @click="showDataPreview = false" class="close-btn-secondary">
                Fermer
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de succès de soumission -->
        <div v-if="showSuccessModal" class="modal-overlay" @click="showSuccessModal = false">
          <div class="success-modal" @click.stop>
            <div class="success-content">
              <Icon name="heroicons:check-circle" class="success-icon" />
              <h3>Formulaire soumis avec succès !</h3>
              <p>Toutes les données ont été traitées correctement.</p>
              <button @click="resetAndCloseSuccess" class="success-btn">
                Créer un nouveau formulaire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormConfig, FormStep, FormField } from '~/types/form'
import FormStepPreview from './FormStepPreview.vue'

const props = defineProps<{
  formConfig: FormConfig | null
}>()

// États du formulaire
const currentStepIndex = ref(0)
const formData = ref<Record<string, any>>({})
const isSubmitting = ref(false)
const showDataPreview = ref(false)
const showSuccessModal = ref(false)
const globalMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

// Fonction pour réinitialiser le formulaire
const resetForm = () => {
  currentStepIndex.value = 0
  formData.value = {}
  globalMessage.value = null
  isSubmitting.value = false
  
  // Initialiser les valeurs par défaut
  if (props.formConfig) {
    props.formConfig.steps.forEach(step => {
      step.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          formData.value[field.name] = field.defaultValue
        }
      })
    })
  }
}

// Watcher pour réinitialiser quand la config change
watch(() => props.formConfig, (newConfig) => {
  if (newConfig) {
    resetForm()
  }
}, { immediate: true })

// Computed pour l'étape actuelle
const currentStep = computed(() => {
  if (!props.formConfig?.steps || !Array.isArray(props.formConfig.steps)) {
    return null
  }
  
  const step = props.formConfig.steps[currentStepIndex.value]
  return step || null
})

const canSubmit = computed(() => {
  if (!props.formConfig) return false
  
  // Vérifier que tous les champs requis sont remplis
  return props.formConfig.steps.every(step => {
    return step.fields
      .filter(field => field.required)
      .every(field => {
        const value = formData.value[field.name]
        return value !== undefined && value !== null && value !== ''
      })
  })
})

// Computed avec vérification de l'affichage
const shouldShowForm = computed(() => {
  const hasFormConfig = !!props.formConfig
  const hasSteps = props.formConfig?.steps && Array.isArray(props.formConfig.steps) && props.formConfig.steps.length > 0
  
  return hasFormConfig && hasSteps
})

// Computed pour récupérer tous les champs de tous les steps (nécessaire pour la logique conditionnelle)
const allFields = computed(() => {
  if (!props.formConfig?.steps) return []
  
  return props.formConfig.steps.reduce((acc, step) => {
    return acc.concat(step.fields || [])
  }, [] as any[])
})

// Methods (déjà déclarées après resetForm)
const updateFieldValue = (fieldName: string, value: any) => {
  formData.value[fieldName] = value
  
  // Effacer les messages globaux quand l'utilisateur modifie des données
  if (globalMessage.value) {
    globalMessage.value = null
  }
}

const goToPreviousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    globalMessage.value = null
  }
}

const goToNextStep = async () => {
  if (!currentStep.value) return
  
  // Valider l'étape actuelle si elle a une API obligatoire
  if (currentStep.value.apiConfig?.validationRequired) {
    // Cette validation sera gérée par FormStepPreview
    return
  }
  
  // Simplement naviguer vers l'étape suivante (ne pas soumettre)
  if (currentStepIndex.value < (props.formConfig?.steps.length || 0) - 1) {
    currentStepIndex.value++
    globalMessage.value = null
  }
  // Ne rien faire si on est à la dernière étape - laisser l'utilisateur cliquer sur "Soumettre"
}

const handleApiValidation = () => {
  // Callback pour quand la validation API réussit
  globalMessage.value = {
    type: 'success',
    text: 'Validation réussie ! Vous pouvez continuer.'
  }
  
  // Passer à l'étape suivante automatiquement si ce n'est pas la dernière
  setTimeout(() => {
    if (currentStepIndex.value < (props.formConfig?.steps.length || 0) - 1) {
      goToNextStep()
    }
  }, 1500)
}

const handleFormSubmit = async () => {
  if (!props.formConfig || !canSubmit.value) return
  
  isSubmitting.value = true
  globalMessage.value = null
  
  try {
    // Générer un formId si il n'existe pas (pour le mode preview)
    const formId = props.formConfig.id || `preview_${Date.now()}`
    
    // Vérifier que nous avons des données
    if (!formData.value || Object.keys(formData.value).length === 0) {
      throw new Error('Aucune donnée à soumettre')
    }
    
    // Préparer les données pour la soumission
    const submissionData = {
      formId: formId,
      title: props.formConfig.title || 'Formulaire sans titre',
      data: formData.value,
      metadata: {
        steps: props.formConfig.steps.length,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        completionTime: Date.now(),
        isPreview: true // Indiquer que c'est un test preview
      }
    }
    
    console.log('📤 Envoi des données:', submissionData)
    
    // Simuler un appel API ou vraie soumission
    const response = await $fetch('/api/form/submit', {
      method: 'POST',
      body: submissionData
    })
    
    if (response.success) {
      globalMessage.value = {
        type: 'success',
        text: 'Formulaire soumis avec succès !'
      }
      
      showSuccessModal.value = true
    } else {
      throw new Error(response.message || 'Erreur lors de la soumission')
    }
  } catch (error: any) {
    console.error('Erreur lors de la soumission:', error)
    globalMessage.value = {
      type: 'error',
      text: error.message || 'Erreur lors de la soumission du formulaire'
    }
  } finally {
    isSubmitting.value = false
  }
}

const previewFormData = () => {
  showDataPreview.value = true
}

const copyFormData = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(formData.value, null, 2))
    globalMessage.value = {
      type: 'success',
      text: 'Données copiées dans le presse-papiers !'
    }
    showDataPreview.value = false
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
    globalMessage.value = {
      type: 'error',
      text: 'Impossible de copier les données'
    }
  }
}

const resetAndCloseSuccess = () => {
  showSuccessModal.value = false
  resetForm()
}
</script>

<style scoped>
.form-preview {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* État vide */
.preview-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  color: #6b7280;
  max-width: 600px;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  color: #d1d5db;
}

.empty-description {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Header du formulaire */
.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-description {
  color: #6b7280;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

/* Indicateur de progression */
.progress-indicator {
  max-width: 400px;
  margin: 0 auto 2rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Formulaire de prévisualisation */
.preview-form {
  max-width: 600px;
  margin: 0 auto;
}

/* Messages globaux */
.global-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin: 1rem 0;
}

.global-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.global-message.error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Actions du formulaire */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  font-size: 0.875rem;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.reset {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.action-btn.reset:hover:not(:disabled) {
  background: #e5e7eb;
}

.action-btn.preview {
  background: #fbbf24;
  color: white;
}

.action-btn.preview:hover:not(:disabled) {
  background: #f59e0b;
}

.action-btn.submit {
  background: #10b981;
  color: white;
}

.action-btn.submit:hover:not(:disabled) {
  background: #059669;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.data-preview-modal {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  color: #6b7280;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.data-json {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #1e293b;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.copy-btn:hover {
  background: #2563eb;
}

.close-btn-secondary {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.close-btn-secondary:hover {
  background: #e5e7eb;
}

/* Modal de succès */
.success-modal {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  color: #10b981;
}

.success-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.success-content p {
  color: #6b7280;
  margin: 0;
}

.success-btn {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.success-btn:hover {
  background: #059669;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}

.preview-content {
  animation: fadeIn 0.3s ease-out;
}

/* Responsive */
@media (max-width: 640px) {
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn {
    justify-content: center;
  }
  
  .data-preview-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}
</style>
