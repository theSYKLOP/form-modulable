<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ step ? 'Modifier l\'étape' : 'Nouvelle étape' }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <Icon name="heroicons:x-mark" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSave">
          <!-- Informations de base -->
          <div class="form-group">
            <label for="step-title">Titre de l'étape *</label>
            <input
              id="step-title"
              v-model="formData.title"
              type="text"
              required
              placeholder="Titre de l'étape"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="step-description">Description</label>
            <textarea
              id="step-description"
              v-model="formData.description"
              placeholder="Description optionnelle de l'étape"
              class="form-textarea"
              rows="3"
            />
          </div>

          <!-- Configuration API -->
          <div class="form-group">
            <div class="checkbox-wrapper">
              <input
                id="api-enabled"
                v-model="formData.apiConfig.enabled"
                type="checkbox"
                class="form-checkbox"
              />
              <label for="api-enabled">Activer la vérification API pour cette étape</label>
            </div>
          </div>

          <!-- Configuration API détaillée -->
          <div v-if="formData.apiConfig.enabled" class="api-config-section">
            <div class="form-group">
              <label for="api-endpoint">URL de l'API *</label>
              <input
                id="api-endpoint"
                v-model="formData.apiConfig.endpoint"
                type="url"
                required
                placeholder="https://api.exemple.com/verify"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <div class="checkbox-wrapper">
                <input
                  id="validation-required"
                  v-model="formData.apiConfig.validationRequired"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label for="validation-required">Validation API obligatoire pour continuer</label>
              </div>
            </div>

            <div class="form-group">
              <label>Champs à envoyer à l'API</label>
              <div v-if="availableFields.length > 0" class="fields-selection">
                <div
                  v-for="field in availableFields"
                  :key="field.id"
                  class="field-checkbox"
                >
                  <input
                    :id="`field-${field.id}`"
                    v-model="formData.apiConfig.fieldsToSend"
                    :value="field.id"
                    type="checkbox"
                    class="form-checkbox"
                  />
                  <label :for="`field-${field.id}`">{{ field.label || field.name }}</label>
                </div>
              </div>
              <p v-else class="no-fields-message">
                Aucun champ disponible. Ajoutez des champs à l'étape pour les sélectionner.
              </p>
            </div>

            <div class="form-group">
              <label for="success-message">Message de succès</label>
              <input
                id="success-message"
                v-model="formData.apiConfig.successMessage"
                type="text"
                placeholder="Vérification réussie !"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="error-message">Message d'erreur</label>
              <input
                id="error-message"
                v-model="formData.apiConfig.errorMessage"
                type="text"
                placeholder="Erreur lors de la vérification"
                class="form-input"
              />
            </div>

            <!-- Headers personnalisés -->
            <div class="form-group">
              <label>Headers personnalisés</label>
              <div class="headers-section">
                <div
                  v-for="(header, index) in formData.apiConfig.headers"
                  :key="index"
                  class="header-row"
                >
                  <input
                    v-model="header.key"
                    type="text"
                    placeholder="Nom du header"
                    class="form-input header-key"
                  />
                  <input
                    v-model="header.value"
                    type="text"
                    placeholder="Valeur"
                    class="form-input header-value"
                  />
                  <button
                    type="button"
                    @click="removeHeader(index)"
                    class="remove-btn"
                  >
                    <Icon name="heroicons:trash" />
                  </button>
                </div>
                <button
                  type="button"
                  @click="addHeader"
                  class="add-header-btn"
                >
                  <Icon name="heroicons:plus" />
                  Ajouter un header
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-btn">Annuler</button>
        <button @click="handleSave" class="save-btn">Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormStep, FormField, StepApiConfig } from '~/types/form'

interface HeaderItem {
  key: string
  value: string
}

interface StepFormData {
  title: string
  description: string
  apiConfig: {
    enabled: boolean
    endpoint: string
    fieldsToSend: string[]
    validationRequired: boolean
    successMessage: string
    errorMessage: string
    headers: HeaderItem[]
  }
}

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  step: {
    type: Object as PropType<FormStep>,
    default: null
  },
  availableFields: {
    type: Array as PropType<FormField[]>,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref<StepFormData>({
  title: '',
  description: '',
  apiConfig: {
    enabled: false,
    endpoint: '',
    fieldsToSend: [],
    validationRequired: false,
    successMessage: 'Vérification réussie !',
    errorMessage: 'Erreur lors de la vérification',
    headers: []
  }
})

// Watchers pour initialiser les données du formulaire
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    initializeFormData()
  }
})

watch(() => props.step, () => {
  if (props.isOpen) {
    initializeFormData()
  }
})

const initializeFormData = () => {
  if (props.step) {
    formData.value.title = props.step.title
    formData.value.description = props.step.description || ''
    
    if (props.step.apiConfig) {
      formData.value.apiConfig = {
        enabled: props.step.apiConfig.enabled,
        endpoint: props.step.apiConfig.endpoint,
        fieldsToSend: [...props.step.apiConfig.fieldsToSend],
        validationRequired: props.step.apiConfig.validationRequired || false,
        successMessage: props.step.apiConfig.successMessage || 'Vérification réussie !',
        errorMessage: props.step.apiConfig.errorMessage || 'Erreur lors de la vérification',
        headers: props.step.apiConfig.headers ? 
          Object.entries(props.step.apiConfig.headers).map(([key, value]) => ({ key, value: String(value) })) : 
          []
      }
    } else {
      formData.value.apiConfig = {
        enabled: false,
        endpoint: '',
        fieldsToSend: [],
        validationRequired: false,
        successMessage: 'Vérification réussie !',
        errorMessage: 'Erreur lors de la vérification',
        headers: []
      }
    }
  } else {
    // Nouveau step
    formData.value = {
      title: '',
      description: '',
      apiConfig: {
        enabled: false,
        endpoint: '',
        fieldsToSend: [],
        validationRequired: false,
        successMessage: 'Vérification réussie !',
        errorMessage: 'Erreur lors de la vérification',
        headers: []
      }
    }
  }
}

const addHeader = () => {
  formData.value.apiConfig.headers.push({ key: '', value: '' })
}

const removeHeader = (index: number) => {
  formData.value.apiConfig.headers.splice(index, 1)
}

const handleSave = () => {
  // Validation
  if (!formData.value.title.trim()) {
    return
  }

  if (formData.value.apiConfig.enabled && !formData.value.apiConfig.endpoint.trim()) {
    return
  }

  // Préparer les données à sauvegarder
  const stepData: Partial<FormStep> = {
    title: formData.value.title.trim(),
    description: formData.value.description.trim() || undefined
  }

  // Ajouter la config API si activée
  if (formData.value.apiConfig.enabled) {
    const headers = formData.value.apiConfig.headers
      .filter(h => h.key.trim() && h.value.trim())
      .reduce((acc, h) => {
        acc[h.key.trim()] = h.value.trim()
        return acc
      }, {} as Record<string, string>)

    stepData.apiConfig = {
      enabled: true,
      endpoint: formData.value.apiConfig.endpoint.trim(),
      method: 'POST' as const,
      fieldsToSend: formData.value.apiConfig.fieldsToSend,
      validationRequired: formData.value.apiConfig.validationRequired,
      successMessage: formData.value.apiConfig.successMessage.trim(),
      errorMessage: formData.value.apiConfig.errorMessage.trim(),
      headers: Object.keys(headers).length > 0 ? headers : undefined
    }
  } else {
    stepData.apiConfig = undefined
  }

  emit('save', stepData)
}
</script>

<style scoped>
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
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.close-btn:hover {
  background: #f3f4f6;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.save-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.save-btn:hover {
  background: #2563eb;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-checkbox {
  width: auto;
}

.api-config-section {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  margin-top: 1rem;
}

.fields-selection {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.no-fields-message {
  color: #6b7280;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.headers-section {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.header-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.header-key {
  flex: 1;
}

.header-value {
  flex: 2;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #dc2626;
}

.add-header-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.add-header-btn:hover {
  background: #059669;
}
</style>
