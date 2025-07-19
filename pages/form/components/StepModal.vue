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

          <!-- Configuration API optimisée -->
          <div class="api-config">
            <div class="section-header">
              <div class="section-info">
                <h4 class="section-title">
                  <Icon name="heroicons:cloud" class="section-icon" />
                  Validation API
                </h4>
                <p class="section-hint">Validez les données de cette étape via une API externe</p>
              </div>
              <label class="toggle-switch">
                <input 
                  v-model="formData.apiConfig.enabled"
                  type="checkbox"
                  class="form-checkbox toggle-input"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div v-if="formData.apiConfig.enabled" class="api-content">
              <!-- Configuration de base -->
              <div class="api-basic-config">
                <div class="config-grid">
                  <div class="config-item">
                    <label class="config-label">
                      <Icon name="heroicons:link" class="config-icon" />
                      URL de l'API
                    </label>
                    <input
                      v-model="formData.apiConfig.endpoint"
                      type="url"
                      placeholder="https://api.agify.io"
                      class="config-input"
                      required
                    />
                  </div>
                  
                  <div class="config-item">
                    <label class="config-label">
                      <Icon name="heroicons:bolt" class="config-icon" />
                      Méthode
                    </label>
                    <select v-model="formData.apiConfig.method" class="config-select">
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                </div>
                
                <div class="config-checkbox">
                  <label class="checkbox-card">
                    <input
                      v-model="formData.apiConfig.validationRequired"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span class="checkbox-indicator"></span>
                    <div class="checkbox-content">
                      <span class="checkbox-title">Validation obligatoire</span>
                      <span class="checkbox-subtitle">L'utilisateur ne peut pas continuer sans succès API</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Mapping des champs - Interface compacte -->
              <div class="mapping-section">
                <div class="section-title-compact">
                  <Icon name="heroicons:arrows-right-left" class="section-icon" />
                  <span>Paramètres de l'API</span>
                  <div class="method-indicator">{{ formData.apiConfig.method }}</div>
                </div>
                
                <div class="mapping-container">
                  <!-- Mappings des champs -->
                  <div class="mapping-list">
                    <div 
                      v-for="(mapping, index) in formData.apiConfig.fieldMappings"
                      :key="index"
                      class="mapping-item"
                    >
                      <div class="mapping-content">
                        <select
                          v-model="mapping.fieldId"
                          @change="updateFieldMapping(index, mapping.fieldId)"
                          class="mapping-select"
                        >
                          <option value="">Champ du formulaire</option>
                          <option
                            v-for="field in availableFields"
                            :key="field.id"
                            :value="field.id"
                          >
                            {{ field.label || field.name }}
                          </option>
                        </select>
                        
                        <Icon name="heroicons:arrow-right" class="mapping-arrow" />
                        
                        <input
                          v-model="mapping.parameterName"
                          type="text"
                          placeholder="nom_parametre"
                          class="mapping-input"
                        />
                      </div>
                      
                      <button
                        @click="removeFieldMapping(index)"
                        class="mapping-remove"
                        title="Supprimer"
                      >
                        <Icon name="heroicons:x-mark" />
                      </button>
                    </div>
                    
                    <!-- Paramètres statiques -->
                    <div 
                      v-for="(param, index) in formData.apiConfig.staticParams"
                      :key="`static-${index}`"
                      class="mapping-item static"
                    >
                      <div class="mapping-content">
                        <input
                          v-model="param.key"
                          type="text"
                          placeholder="Paramètre fixe"
                          class="mapping-input static-key"
                        />
                        
                        <Icon name="heroicons:equals" class="mapping-arrow" />
                        
                        <input
                          v-model="param.value"
                          type="text"
                          placeholder="valeur"
                          class="mapping-input"
                        />
                      </div>
                      
                      <button
                        @click="removeStaticParam(index)"
                        class="mapping-remove"
                        title="Supprimer"
                      >
                        <Icon name="heroicons:x-mark" />
                      </button>
                    </div>
                  </div>
                  
                  <!-- Boutons d'ajout -->
                  <div class="add-buttons">
                    <button @click="addFieldMapping" class="add-btn field">
                      <Icon name="heroicons:plus" />
                      <span>Champ dynamique</span>
                    </button>
                    <button @click="addStaticParam" class="add-btn static">
                      <Icon name="heroicons:plus" />
                      <span>Paramètre fixe</span>
                    </button>
                  </div>
                  
                  <!-- Aperçu URL -->
                  <div v-if="urlPreview && urlPreview !== formData.apiConfig.endpoint" class="url-preview">
                    <div class="preview-header">
                      <Icon name="heroicons:eye" class="preview-icon" />
                      <span>Aperçu {{ formData.apiConfig.method }}</span>
                    </div>
                    <code class="preview-url">{{ urlPreview }}</code>
                    <div class="preview-note">
                      <Icon name="heroicons:information-circle" />
                      <span>Les valeurs entre crochets seront remplacées par les données du formulaire</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Messages et options avancées - Repliables -->
              <div class="advanced-section">
                <button 
                  @click="showAdvancedOptions = !showAdvancedOptions" 
                  class="advanced-toggle"
                >
                  <Icon :name="showAdvancedOptions ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" />
                  <span>Options avancées</span>
                  <div class="toggle-badge">{{ showAdvancedOptions ? 'Masquer' : 'Afficher' }}</div>
                </button>
                
                <div v-if="showAdvancedOptions" class="advanced-content">
                  <div class="advanced-grid">
                    <div class="advanced-item">
                      <label class="advanced-label">Message de succès</label>
                      <input
                        v-model="formData.apiConfig.successMessage"
                        type="text"
                        placeholder="Vérification réussie !"
                        class="advanced-input"
                      />
                    </div>
                    
                    <div class="advanced-item">
                      <label class="advanced-label">Message d'erreur</label>
                      <input
                        v-model="formData.apiConfig.errorMessage"
                        type="text"
                        placeholder="Erreur lors de la vérification"
                        class="advanced-input"
                      />
                    </div>
                  </div>
                  
                  <!-- Headers personnalisés -->
                  <div class="headers-config">
                    <label class="advanced-label">Headers HTTP personnalisés</label>
                    <div class="headers-list">
                      <div
                        v-for="(header, index) in formData.apiConfig.headers"
                        :key="index"
                        class="header-item"
                      >
                        <input
                          v-model="header.key"
                          type="text"
                          placeholder="Nom"
                          class="header-input"
                        />
                        <input
                          v-model="header.value"
                          type="text"
                          placeholder="Valeur"
                          class="header-input"
                        />
                        <button
                          @click="removeHeader(index)"
                          class="header-remove"
                        >
                          <Icon name="heroicons:x-mark" />
                        </button>
                      </div>
                      <button @click="addHeader" class="add-header">
                        <Icon name="heroicons:plus" />
                        <span>Ajouter un header</span>
                      </button>
                    </div>
                  </div>
                </div>
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
import type { FormStep, FormField, StepApiConfig, ApiFieldMapping } from '~/types/form'

interface HeaderItem {
  key: string
  value: string
}

interface StaticParam {
  key: string
  value: string
}

interface StepFormData {
  title: string
  description: string
  apiConfig: {
    enabled: boolean
    endpoint: string
    method: 'POST' | 'GET'
    fieldMappings: ApiFieldMapping[]
    staticParams: StaticParam[]
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

const showAdvancedOptions = ref(false)

const formData = ref<StepFormData>({
  title: '',
  description: '',
  apiConfig: {
    enabled: false,
    endpoint: '',
    method: 'POST',
    fieldMappings: [],
    staticParams: [],
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
        method: props.step.apiConfig.method || 'POST',
        fieldMappings: props.step.apiConfig.fieldMappings ? [...props.step.apiConfig.fieldMappings] : [],
        staticParams: props.step.apiConfig.staticParams ? 
          Object.entries(props.step.apiConfig.staticParams).map(([key, value]) => ({ key, value: String(value) })) : 
          [],
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
        method: 'POST',
        fieldMappings: [],
        staticParams: [],
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
        method: 'POST',
        fieldMappings: [],
        staticParams: [],
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

const addFieldMapping = () => {
  formData.value.apiConfig.fieldMappings.push({ 
    fieldId: '', 
    parameterName: '',
    fieldLabel: ''
  })
}

const removeFieldMapping = (index: number) => {
  formData.value.apiConfig.fieldMappings.splice(index, 1)
}

const addStaticParam = () => {
  formData.value.apiConfig.staticParams.push({ key: '', value: '' })
}

const removeStaticParam = (index: number) => {
  formData.value.apiConfig.staticParams.splice(index, 1)
}

const updateFieldMapping = (index: number, fieldId: string) => {
  const field = props.availableFields.find(f => f.id === fieldId)
  if (field) {
    formData.value.apiConfig.fieldMappings[index].fieldLabel = field.label || field.name
  }
}

// Computed pour l'aperçu de l'URL
const urlPreview = computed(() => {
  if (!formData.value.apiConfig.endpoint) return ''
  
  const baseUrl = formData.value.apiConfig.endpoint
  const mappings = formData.value.apiConfig.fieldMappings.filter(m => m.parameterName)
  const staticParams = formData.value.apiConfig.staticParams.filter(p => p.key && p.value)
  
  if (formData.value.apiConfig.method === 'GET' && (mappings.length > 0 || staticParams.length > 0)) {
    const params: string[] = []
    
    // Ajouter les paramètres statiques
    staticParams.forEach(param => {
      params.push(`${param.key}=${param.value}`)
    })
    
    // Ajouter les paramètres des champs
    mappings.forEach(mapping => {
      const placeholder = mapping.fieldLabel ? `[${mapping.fieldLabel}]` : '[valeur]'
      params.push(`${mapping.parameterName}=${placeholder}`)
    })
    
    return `${baseUrl}?${params.join('&')}`
  }
  
  return baseUrl
})

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

    const staticParams = formData.value.apiConfig.staticParams
      .filter(p => p.key.trim() && p.value.trim())
      .reduce((acc, p) => {
        acc[p.key.trim()] = p.value.trim()
        return acc
      }, {} as Record<string, any>)

    const validMappings = formData.value.apiConfig.fieldMappings
      .filter(m => m.fieldId && m.parameterName.trim())

    stepData.apiConfig = {
      enabled: true,
      endpoint: formData.value.apiConfig.endpoint.trim(),
      method: formData.value.apiConfig.method,
      fieldMappings: validMappings,
      staticParams: Object.keys(staticParams).length > 0 ? staticParams : undefined,
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
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  margin-top: 1rem;
}

/* Configuration API optimisée */
.api-config {
  margin-top: 1.5rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.section-info {
  flex: 1;
}

.section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: #6366f1;
}

.section-hint {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.3;
}

.toggle-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #d1d5db;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  top: 3px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-input:checked + .toggle-slider {
  background-color: #6366f1;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.api-content {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px dashed #cbd5e1;
}

.api-basic-config {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.config-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.config-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.config-input,
.config-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #fafbfc;
  transition: all 0.2s ease;
}

.config-input:focus,
.config-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: white;
}

.config-checkbox {
  margin-top: 0.5rem;
}

.checkbox-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
}

.checkbox-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: white;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-indicator {
  background: #6366f1;
  border-color: #6366f1;
}

.checkbox-input:checked + .checkbox-indicator:after {
  content: "✓";
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-content {
  flex: 1;
}

.checkbox-title {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.checkbox-subtitle {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.3;
}

.mapping-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.section-title-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.method-indicator {
  background: #6366f1;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: auto;
}

.mapping-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mapping-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mapping-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.mapping-item:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.mapping-item.static {
  border-left: 3px solid #f59e0b;
}

.mapping-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: center;
}

.mapping-select,
.mapping-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  min-height: 40px;
}

.mapping-select:focus,
.mapping-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.static-key {
  background: #fef3c7;
  border-color: #f59e0b;
}

.mapping-arrow {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
}

.mapping-remove {
  width: 32px;
  height: 32px;
  border: 1px solid #ef4444;
  background: white;
  color: #ef4444;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.mapping-remove:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.05);
}

.add-buttons {
  display: flex;
  gap: 0.75rem;
}

.add-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  border: 2px dashed #cbd5e1;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-btn.field {
  color: #10b981;
}

.add-btn.field:hover {
  border-color: #10b981;
  background: #f0fdf4;
  color: #059669;
}

.add-btn.static {
  color: #f59e0b;
}

.add-btn.static:hover {
  border-color: #f59e0b;
  background: #fffbeb;
  color: #d97706;
}

.url-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.preview-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.preview-url {
  display: block;
  padding: 0.875rem;
  background: #1e293b;
  color: #94a3b8;
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  word-break: break-all;
  line-height: 1.5;
  border: 1px solid #334155;
}

.preview-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  color: #92400e;
}

.advanced-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.advanced-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.advanced-toggle:hover {
  background: #f1f5f9;
}

.toggle-badge {
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-left: auto;
}

.advanced-content {
  padding: 1.25rem;
  border-top: 1px solid #e2e8f0;
}

.advanced-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.advanced-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.advanced-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.advanced-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #fafbfc;
}

.advanced-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: white;
}

.headers-config {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.headers-list {
  margin-top: 0.75rem;
}

.header-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.header-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #fafbfc;
}

.header-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  background: white;
}

.header-remove {
  width: 32px;
  height: 32px;
  border: 1px solid #ef4444;
  background: white;
  color: #ef4444;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-remove:hover {
  background: #ef4444;
  color: white;
}

.add-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px dashed #cbd5e1;
  background: white;
  color: #6366f1;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
}

.add-header:hover {
  border-color: #6366f1;
  background: #f8fafc;
}

/* Responsive */
@media (max-width: 768px) {
  .config-grid,
  .advanced-grid {
    grid-template-columns: 1fr;
  }
  
  .add-buttons {
    flex-direction: column;
  }
  
  .mapping-content {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .mapping-arrow {
    display: none;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.section-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.section-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* Field Mappings */
.field-mappings {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
}

.mapping-row {
  display: grid;
  grid-template-columns: 2fr auto 2fr auto;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.mapping-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-weight: 500;
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-mapping-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
  justify-content: center;
  margin-top: 0.75rem;
}

.add-mapping-btn:hover {
  background: #059669;
}

/* Static Params */
.static-params {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
}

.param-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.add-param-btn {
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  width: 100%;
  justify-content: center;
  margin-top: 0.75rem;
}

.add-param-btn:hover {
  background: #4f46e5;
}

/* URL Preview */
.url-preview {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.375rem;
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.preview-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.preview-url {
  display: block;
  padding: 0.75rem;
  background: #1e293b;
  color: #94a3b8;
  border-radius: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  word-break: break-all;
  line-height: 1.4;
  border: 1px solid #334155;
}

.preview-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  color: #92400e;
}

.info-icon {
  width: 1rem;
  height: 1rem;
  color: #f59e0b;
  flex-shrink: 0;
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
