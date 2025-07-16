<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ modalTitle }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <Icon name="i-heroicons-x-mark" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Sélection de champ -->
        <div v-if="type === 'field' && step === 'select'" class="field-selection">
          <div class="categories">
            <button 
              v-for="category in fieldCategories"
              :key="category.id"
              @click="selectedCategory = category.id"
              class="category-btn"
              :class="{ active: selectedCategory === category.id }"
            >
              <Icon :name="category.icon" />
              {{ category.label }}
            </button>
          </div>

          <div class="field-templates">
            <div 
              v-for="template in filteredTemplates"
              :key="template.type"
              @click="selectTemplate(template)"
              class="template-item"
            >
              <Icon :name="template.icon" class="template-icon" />
              <span class="template-label">{{ template.label }}</span>
            </div>
          </div>
        </div>

        <!-- Configuration de champ -->
        <div v-else-if="type === 'field' && step === 'config'" class="field-config">
          <div class="form-group">
            <label>Libellé *</label>
            <input 
              v-model="fieldConfig.label"
              type="text"
              placeholder="Libellé du champ"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Placeholder</label>
            <input 
              v-model="fieldConfig.placeholder"
              type="text"
              placeholder="Texte d'aide"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Texte d'aide</label>
            <input 
              v-model="fieldConfig.helpText"
              type="text"
              placeholder="Description du champ"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Largeur</label>
            <select v-model="fieldConfig.width" class="form-select">
              <option value="full">Pleine largeur</option>
              <option value="half">Demi-largeur</option>
              <option value="third">Un tiers</option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input 
                v-model="fieldConfig.required"
                type="checkbox"
                class="form-checkbox"
              />
              Champ obligatoire
            </label>
          </div>

          <!-- Options pour les champs select/radio/checkbox -->
          <div v-if="selectedTemplate?.hasOptions" class="options-config">
            <h4>Options</h4>
            <div 
              v-for="(option, index) in fieldConfig.options"
              :key="index"
              class="option-item"
            >
              <input 
                v-model="option.label"
                type="text"
                placeholder="Libellé"
                class="form-input"
              />
              <input 
                v-model="option.value"
                type="text"
                placeholder="Valeur"
                class="form-input"
              />
              <button 
                @click="removeOption(index)"
                class="remove-option-btn"
              >
                <Icon name="i-heroicons-trash" />
              </button>
            </div>
            <button @click="addOption" class="add-option-btn">
              <Icon name="i-heroicons-plus" />
              Ajouter une option
            </button>
          </div>

          <!-- Configuration API -->
          <div v-if="canHaveApi" class="api-config">
            <label>
              <input 
                v-model="fieldConfig.hasApi"
                type="checkbox"
                class="form-checkbox"
              />
              Utiliser une API
            </label>
            
            <div v-if="fieldConfig.hasApi" class="api-fields">
              <div class="form-group">
                <label>Méthode</label>
                <select v-model="fieldConfig.apiConfig.method" class="form-select">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>URL</label>
                <input 
                  v-model="fieldConfig.apiConfig.endpoint"
                  type="text"
                  placeholder="https://api.example.com/data"
                  class="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration d'étape -->
        <div v-else-if="type === 'step'" class="step-config">
          <div class="form-group">
            <label>Titre de l'étape *</label>
            <input 
              v-model="stepConfig.title"
              type="text"
              placeholder="Titre de l'étape"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="stepConfig.description"
              placeholder="Description de l'étape"
              class="form-textarea"
            />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-btn">
          Annuler
        </button>
        <button 
          v-if="type === 'field' && step === 'select'"
          @click="goToConfig"
          :disabled="!selectedTemplate"
          class="next-btn"
        >
          Suivant
        </button>
        <button 
          v-else
          @click="save"
          :disabled="!canSave"
          class="save-btn"
        >
          {{ type === 'field' ? 'Ajouter le champ' : 'Sauvegarder' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFieldTypes } from '../composables/useFieldTypes'
import type { FieldTemplate, FormField, FieldOption } from '../types/form'

const props = defineProps<{
  isOpen: boolean
  type: 'field' | 'step'
  editingStepId?: string | null
  insertPosition?: number | null
}>()

const emit = defineEmits<{
  close: []
  addField: [field: Omit<FormField, 'id' | 'stepId' | 'order'>]
  updateStep: [stepId: string, title: string]
}>()

const { fieldTemplates, fieldCategories, getFieldsByCategory } = useFieldTypes()

const step = ref<'select' | 'config'>('select')
const selectedCategory = ref('input')
const selectedTemplate = ref<FieldTemplate | null>(null)

const fieldConfig = ref({
  label: '',
  placeholder: '',
  helpText: '',
  width: 'full' as const,
  required: false,
  options: [] as FieldOption[], // Changé ici
  hasApi: false,
  apiConfig: {
    method: 'GET' as const,
    endpoint: ''
  }
})

const stepConfig = ref({
  title: '',
  description: ''
})

const modalTitle = computed(() => {
  if (props.type === 'step') return 'Configuration de l\'étape'
  return step.value === 'select' ? 'Choisir un type de champ' : 'Configurer le champ'
})

const filteredTemplates = computed(() => {
  return getFieldsByCategory(selectedCategory.value)
})

const canHaveApi = computed(() => {
  return selectedTemplate.value?.hasOptions || selectedTemplate.value?.type === 'text'
})

const canSave = computed(() => {
  if (props.type === 'step') {
    return stepConfig.value.title.trim() !== ''
  }
  return fieldConfig.value.label.trim() !== ''
})

const selectTemplate = (template: FieldTemplate) => {
  selectedTemplate.value = template
  fieldConfig.value.label = template.label
  
  // Appliquer les propriétés par défaut
  if (template.defaultProps) {
    Object.assign(fieldConfig.value, template.defaultProps)
  }
  
  // Initialiser les options si nécessaire
  if (template.hasOptions && template.defaultProps?.options) {
    fieldConfig.value.options = [...template.defaultProps.options]
  }
}

const goToConfig = () => {
  step.value = 'config'
}

const addOption = () => {
  fieldConfig.value.options.push({
    label: `Option ${fieldConfig.value.options.length + 1}`,
    value: `option${fieldConfig.value.options.length + 1}` // Maintenant compatible avec string | number
  })
}

const removeOption = (index: number) => {
  fieldConfig.value.options.splice(index, 1)
}

const save = () => {
  if (props.type === 'field' && selectedTemplate.value) {
    const field = {
      type: selectedTemplate.value.type,
      label: fieldConfig.value.label,
      placeholder: fieldConfig.value.placeholder,
      helpText: fieldConfig.value.helpText,
      width: fieldConfig.value.width,
      validation: { required: fieldConfig.value.required },
      options: fieldConfig.value.options,
      ...(fieldConfig.value.hasApi && {
        apiConfig: fieldConfig.value.apiConfig
      })
    }
    emit('addField', field)
  } else if (props.type === 'step' && props.editingStepId) {
    emit('updateStep', props.editingStepId, stepConfig.value.title)
  }
  
  emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// Reset modal state when opened
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    step.value = 'select'
    selectedTemplate.value = null
    fieldConfig.value = {
      label: '',
      placeholder: '',
      helpText: '',
      width: 'full',
      required: false,
      options: [] as FieldOption[], // Changé ici aussi
      hasApi: false,
      apiConfig: { method: 'GET', endpoint: '' }
    }
    stepConfig.value = { title: '', description: '' }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  border-color: #3b82f6;
}

.category-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.field-templates {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.template-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.template-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.template-icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
}

.template-label {
  font-size: 0.875rem;
  color: #374151;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  min-height: 4rem;
  resize: vertical;
}

.form-checkbox {
  margin-right: 0.5rem;
}

.options-config {
  margin-top: 1.5rem;
}

.options-config h4 {
  margin-bottom: 1rem;
  color: #374151;
}

.option-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.remove-option-btn {
  padding: 0.75rem;
  border: 1px solid #ef4444;
  background: white;
  color: #ef4444;
  border-radius: 0.5rem;
  cursor: pointer;
}

.remove-option-btn:hover {
  background: #ef4444;
  color: white;
}

.add-option-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #10b981;
  background: white;
  color: #10b981;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.add-option-btn:hover {
  background: #10b981;
  color: white;
}

.api-config {
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.api-fields {
  margin-top: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d5d5db;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn:hover {
  background: #f3f4f6;
}

.next-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.next-btn:hover:not(:disabled),
.save-btn:hover:not(:disabled) {
  background: #2563eb;
}

.next-btn:disabled,
.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>