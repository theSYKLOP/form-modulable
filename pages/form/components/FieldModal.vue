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

          <!-- Logique conditionnelle -->
          <div class="conditional-logic">
            <div class="section-header">
              <h4 class="section-title">Logique conditionnelle</h4>
              <div class="section-toggle">
                <label class="toggle-switch">
                  <input 
                    v-model="fieldConfig.conditionalLogic!.enabled"
                    type="checkbox"
                    class="form-checkbox"
                  />
                  <span class="toggle-label">Activer</span>
                </label>
              </div>
            </div>
            
            <div v-if="fieldConfig.conditionalLogic?.enabled" class="conditional-content">
              <div class="form-group">
                <label>Action</label>
                <select v-model="fieldConfig.conditionalLogic!.action" class="form-select">
                  <option value="show">Afficher ce champ si</option>
                  <option value="hide">Masquer ce champ si</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Opérateur logique</label>
                <div class="operator-toggle">
                  <button 
                    class="operator-btn"
                    :class="{ active: fieldConfig.conditionalLogic!.logicalOperator === 'AND' }"
                    @click="fieldConfig.conditionalLogic!.logicalOperator = 'AND'"
                  >
                    Toutes les conditions (ET)
                  </button>
                  <button 
                    class="operator-btn"
                    :class="{ active: fieldConfig.conditionalLogic!.logicalOperator === 'OR' }"
                    @click="fieldConfig.conditionalLogic!.logicalOperator = 'OR'"
                  >
                    Une condition (OU)
                  </button>
                </div>
              </div>
              
              <div v-if="fieldConfig.conditionalLogic!.rules.length > 0" class="conditional-rules">
                <div 
                  v-for="(rule, index) in fieldConfig.conditionalLogic!.rules"
                  :key="index"
                  class="rule-item"
                >
                  <select v-model="rule.targetFieldId" class="form-select">
                    <option value="">Sélectionnez un champ</option>
                    <!-- Liste des champs ici (à implémenter) -->
                  </select>
                  
                  <select v-model="rule.operator" class="form-select">
                    <option value="equals">Égal à</option>
                    <option value="not_equals">Différent de</option>
                    <option value="contains">Contient</option>
                    <option value="empty">Est vide</option>
                    <option value="not_empty">N'est pas vide</option>
                  </select>
                  
                  <input 
                    v-if="!['empty', 'not_empty'].includes(rule.operator)"
                    v-model="rule.value"
                    type="text"
                    placeholder="Valeur"
                    class="form-input"
                  />
                  
                  <button 
                    @click="fieldConfig.conditionalLogic!.rules.splice(index, 1)" 
                    class="remove-rule-btn"
                  >
                    <Icon name="i-heroicons-trash" />
                  </button>
                </div>
              </div>
              
              <button 
                @click="addConditionalRule" 
                class="add-rule-btn"
              >
                <Icon name="i-heroicons-plus" />
                Ajouter une condition
              </button>
            </div>
          </div>
          
          <!-- Configuration API simplifiée -->
          <div v-if="canHaveApi" class="api-config">
            <div class="api-header">
              <label class="api-toggle">
                <input 
                  v-model="fieldConfig.hasApi"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="api-toggle-label">Charger les options depuis une API</span>
              </label>
            </div>
            
            <div v-if="fieldConfig.hasApi" class="api-fields">
              <div class="api-setup-wizard">
                <!-- Étape 1: URL API -->
                <div class="form-group api-endpoint-input">
                  <label>URL de l'API</label>
                  <div class="input-with-button">
                    <input 
                      v-model="fieldConfig.apiConfig!.endpoint"
                      type="text"
                      placeholder="https://api.example.com/data"
                      class="form-input"
                    />
                    <button 
                      @click="testApiConnection" 
                      class="api-test-btn" 
                      :disabled="!isApiConfigValid"
                      title="Tester l'API"
                    >
                      <Icon name="i-heroicons-play" class="btn-icon" />
                    </button>
                  </div>
                  <small class="form-hint">Entrez l'URL qui renvoie vos données au format JSON</small>
                </div>
                
                <!-- Prévisualisation avec sélection rapide des champs -->
                <div v-if="apiPreviewLoading" class="api-preview-loading">
                  <Icon name="i-heroicons-arrow-path" class="spin-icon" />
                  <span>Connexion à l'API...</span>
                </div>
                
                <div v-else-if="apiPreviewError" class="api-preview-error">
                  <Icon name="i-heroicons-exclamation-circle" class="error-icon" />
                  <span>{{ apiPreviewError }}</span>
                </div>
                
                <div v-else-if="apiPreviewData" class="api-preview">
                  <h4 class="api-preview-title">Configuration automatique</h4>
                  
                  <!-- Aperçu des données détectées -->
                  <div class="api-mapping-preview">
                    <div class="api-preview-fields">
                      <div class="api-field-selector">
                        <label>Champ à utiliser comme libellé:</label>
                        <div class="api-field-buttons">
                          <button 
                            v-for="field in detectedFields" 
                            :key="field"
                            @click="fieldConfig.apiConfig!.labelKey = field"
                            class="api-field-btn"
                            :class="{ active: fieldConfig.apiConfig!.labelKey === field }"
                          >
                            {{ field }}
                          </button>
                        </div>
                      </div>
                      
                      <div class="api-field-selector">
                        <label>Champ à utiliser comme valeur:</label>
                        <div class="api-field-buttons">
                          <button 
                            v-for="field in detectedFields" 
                            :key="field"
                            @click="fieldConfig.apiConfig!.valueKey = field"
                            class="api-field-btn"
                            :class="{ active: fieldConfig.apiConfig!.valueKey === field }"
                          >
                            {{ field }}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Aperçu des résultats -->
                    <div class="api-results-preview">
                      <h5>Aperçu des options</h5>
                      <div class="api-results-list">
                        <div v-for="(item, index) in apiPreviewOptions.slice(0, 3)" :key="index" class="api-result-item">
                          <div class="api-result-label">{{ item.label }}</div>
                          <div class="api-result-value">{{ item.value }}</div>
                        </div>
                        <div v-if="apiPreviewOptions.length > 3" class="api-results-more">
                          + {{ apiPreviewOptions.length - 3 }} autres options
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Options avancées (repliées par défaut) -->
                  <div class="advanced-options">
                    <button @click="showAdvancedApi = !showAdvancedApi" class="advanced-toggle">
                      {{ showAdvancedApi ? 'Masquer les options avancées' : 'Options avancées' }}
                      <Icon :name="showAdvancedApi ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" />
                    </button>
                    
                    <div v-if="showAdvancedApi" class="advanced-settings">
                      <div class="form-row">
                        <div class="form-group">
                          <label>Méthode</label>
                          <select v-model="fieldConfig.apiConfig!.method" class="form-select">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                          </select>
                        </div>
                        
                        <div class="form-group">
                          <label>Cache (secondes)</label>
                          <input 
                            v-model="fieldConfig.apiConfig!.cacheTime" 
                            type="number" 
                            min="0"
                            placeholder="0" 
                            class="form-input" 
                          />
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label>Chemin JSON</label>
                        <input 
                          v-model="fieldConfig.apiConfig!.responsePath" 
                          type="text"
                          placeholder="Ex: data.results" 
                          class="form-input"
                        />
                        <small class="form-hint">Chemin vers le tableau de données dans la réponse JSON</small>
                      </div>
                    </div>
                  </div>
                </div>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useFieldTypes } from '../composables/useFieldTypes'
import type { FieldTemplate, FormFieldData, FormFieldOption, FormFieldType, FieldWidth, ApiConfig, ConditionalLogic } from '../../../types/form'

const props = defineProps<{
  isOpen: boolean
  type: 'field' | 'step'
  editingStepId?: string | null
  insertPosition?: number | null
  field?: FormFieldData | null // Champ à modifier (si mode édition)
}>()

const emit = defineEmits<{
  close: []
  addField: [field: Partial<FormFieldData>]
  updateField: [fieldId: string, field: Partial<FormFieldData>]
  updateStep: [stepId: string, title: string, description?: string]
}>()

const { fieldTemplates, fieldCategories, getFieldsByCategory, getFieldTemplate } = useFieldTypes()

// On commence à la sélection sauf si on édite un champ existant
const step = ref<'select' | 'config'>('select')
const selectedCategory = ref('input')
const selectedTemplate = ref<FieldTemplate | null>(null)
const isEditMode = computed(() => !!props.field)

// États pour l'API
const apiPreviewData = ref<any>(null)
const apiPreviewLoading = ref(false)
const apiPreviewError = ref<string | null>(null)
const apiPreviewOptions = ref<FormFieldOption[]>([])
const showAdvancedApi = ref(false)
const detectedFields = ref<string[]>([])

// Pour la logique conditionnelle
const availableFields = ref<{id: string, label: string}[]>([])

// Configuration complète du champ selon la nouvelle interface
const fieldConfig = ref<Partial<FormFieldData>>({
  name: '',
  type: undefined as unknown as FormFieldType,
  label: '',
  placeholder: '',
  helpText: '',
  defaultValue: undefined,
  width: 'full' as FieldWidth,
  position: 'default',
  disabled: false,
  readonly: false,
  class: '',
  icon: '',
  prefix: '',
  suffix: '',
  rows: 4,
  accept: '',
  multiple: false,
  min: undefined,
  max: undefined,
  step: undefined,
  validation: {
    required: false
  },
  conditionalLogic: {
    enabled: false,
    action: 'show' as const,
    logicalOperator: 'AND' as const,
    rules: []
  },
  options: [] as FormFieldOption[],
  hasApi: false,
  apiConfig: {
    method: 'GET' as const,
    endpoint: '',
    cacheTime: 0,
    responsePath: '',
    labelKey: 'name',
    valueKey: 'id',
    headers: {}
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
  return fieldConfig.value.label?.trim() !== ''
})

const selectTemplate = (template: FieldTemplate) => {
  selectedTemplate.value = template
  
  // Réinitialiser les valeurs générales du champ
  fieldConfig.value = {
    ...fieldConfig.value,
    type: template.type,
    name: template.type + '_' + Date.now(),
    label: template.label,
    placeholder: `Saisissez ${template.label.toLowerCase()}...`,
  }
  
  // Appliquer les propriétés par défaut
  if (template.defaultProps) {
    Object.assign(fieldConfig.value, template.defaultProps)
  }
  
  // Initialiser les options si nécessaire
  if (template.hasOptions && template.defaultProps?.options) {
    fieldConfig.value.options = [...template.defaultProps.options]
  } else if (template.hasOptions) {
    fieldConfig.value.options = [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' }
    ]
  }

  // Ajuster les propriétés spécifiques au type de champ
  switch (template.type) {
    case 'textarea':
      fieldConfig.value.rows = 4
      break
    case 'number':
    case 'range':
      fieldConfig.value.min = 0
      fieldConfig.value.max = 100
      fieldConfig.value.step = 1
      break
    case 'file':
      fieldConfig.value.accept = '*/*'
      break
  }
}

const goToConfig = () => {
  step.value = 'config'
}

const addOption = () => {
  if (!fieldConfig.value.options) fieldConfig.value.options = []
  
  fieldConfig.value.options.push({
    label: `Option ${fieldConfig.value.options.length + 1}`,
    value: `option${fieldConfig.value.options.length + 1}`
  })
}

const removeOption = (index: number) => {
  if (fieldConfig.value.options) {
    fieldConfig.value.options.splice(index, 1)
  }
}

// Vérifier si la configuration API est valide pour le test
const isApiConfigValid = computed(() => {
  return fieldConfig.value.hasApi && 
         fieldConfig.value.apiConfig?.endpoint && 
         fieldConfig.value.apiConfig.endpoint.startsWith('http')
})

// Tester la connexion à l'API
const testApiConnection = async () => {
  if (!fieldConfig.value.apiConfig?.endpoint) return

  apiPreviewLoading.value = true
  apiPreviewError.value = null
  apiPreviewData.value = null
  apiPreviewOptions.value = []

  try {
    // Simuler un appel API (à remplacer par un vrai appel dans la prod)
    const response = await fetch(fieldConfig.value.apiConfig.endpoint)
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    apiPreviewData.value = data
    
    // Extraire les données selon le chemin si spécifié
    let results = data
    if (fieldConfig.value.apiConfig.responsePath) {
      const paths = fieldConfig.value.apiConfig.responsePath.split('.')
      for (const path of paths) {
        if (results && path in results) {
          results = results[path]
        } else {
          throw new Error(`Chemin "${fieldConfig.value.apiConfig.responsePath}" invalide dans la réponse`)
        }
      }
    }
    
    // Si ce n'est pas un tableau, on tente de trouver un tableau dedans
    if (!Array.isArray(results)) {
      if (results && typeof results === 'object') {
        // Chercher un tableau dans l'objet
        const arrayProp = Object.keys(results).find(key => Array.isArray(results[key]))
        if (arrayProp) {
          results = results[arrayProp]
          // Met à jour le chemin de réponse automatiquement
          fieldConfig.value.apiConfig.responsePath = fieldConfig.value.apiConfig.responsePath 
            ? `${fieldConfig.value.apiConfig.responsePath}.${arrayProp}` 
            : arrayProp
        } else {
          throw new Error("Pas de tableau trouvé dans la réponse API")
        }
      } else {
        throw new Error("La réponse API n'est pas un tableau ou ne contient pas de tableau")
      }
    }
    
    // Détection automatique des champs
    if (results.length > 0) {
      detectedFields.value = Object.keys(results[0])
      
      // Proposer des valeurs par défaut intelligentes pour label/value
      const possibleLabelFields = ['name', 'title', 'label', 'libelle', 'text', 'description']
      const possibleValueFields = ['id', 'code', 'key', 'value', 'valeur']
      
      // Auto-sélection du champ label si pas déjà défini
      if (!fieldConfig.value.apiConfig.labelKey) {
        for (const field of possibleLabelFields) {
          if (detectedFields.value.includes(field)) {
            fieldConfig.value.apiConfig.labelKey = field
            break
          }
        }
      }
      
      // Auto-sélection du champ value si pas déjà défini
      if (!fieldConfig.value.apiConfig.valueKey) {
        for (const field of possibleValueFields) {
          if (detectedFields.value.includes(field)) {
            fieldConfig.value.apiConfig.valueKey = field
            break
          }
        }
      }
      
      // Si aucun champ label/value n'a été trouvé, prendre les deux premiers champs
      if (!fieldConfig.value.apiConfig.labelKey && detectedFields.value.length > 0) {
        fieldConfig.value.apiConfig.labelKey = detectedFields.value[0]
      }
      
      if (!fieldConfig.value.apiConfig.valueKey && detectedFields.value.length > 1) {
        fieldConfig.value.apiConfig.valueKey = detectedFields.value[1]
      } else if (!fieldConfig.value.apiConfig.valueKey) {
        fieldConfig.value.apiConfig.valueKey = fieldConfig.value.apiConfig.labelKey
      }
    }
    
    // Extraire les options selon les clés spécifiées
    const labelKey = fieldConfig.value.apiConfig!.labelKey || 'name'
    const valueKey = fieldConfig.value.apiConfig!.valueKey || 'id'
    
    apiPreviewOptions.value = results.map((item: any) => ({
      label: item[labelKey] || 'Sans libellé',
      value: item[valueKey]?.toString() || 'sans-valeur'
    }))
    
  } catch (error: any) {
    apiPreviewError.value = error.message || 'Erreur lors de l\'appel à l\'API'
    console.error('Erreur API:', error)
  } finally {
    apiPreviewLoading.value = false
  }
}

const save = () => {
  if (props.type === 'field') {
    // Construire l'objet de champ complet
    const field: Partial<FormFieldData> = {
      ...fieldConfig.value,
      // S'assurer que les propriétés essentielles sont définies
      type: selectedTemplate.value?.type || fieldConfig.value.type,
      label: fieldConfig.value.label,
      validation: {
        required: fieldConfig.value.validation?.required || false
      }
    }

    // Ajouter la configuration API si activée
    if (fieldConfig.value.hasApi) {
      field.apiConfig = fieldConfig.value.apiConfig
      
      // Si on a prévisualisé l'API, utiliser les options générées
      if (apiPreviewOptions.value.length > 0) {
        field.options = apiPreviewOptions.value
      }
    }
    
    if (isEditMode.value && props.field?.id) {
      // Mode édition: mise à jour d'un champ existant
      emit('updateField', props.field.id, field)
    } else {
      // Mode ajout: création d'un nouveau champ
      emit('addField', field)
    }
  } else if (props.type === 'step' && props.editingStepId) {
    // Sauvegarde d'une étape
    emit('updateStep', props.editingStepId, stepConfig.value.title, stepConfig.value.description)
  }
  
  emit('close')
}

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// Initialiser le formulaire en mode édition
const initEditMode = () => {
  if (!props.field) return
  
  // Récupérer le template correspondant au type de champ
  const template = getFieldTemplate(props.field.type)
  if (template) {
    selectedTemplate.value = template
    selectedCategory.value = template.category
  }
  
  // Remplir le formulaire avec les valeurs du champ
  fieldConfig.value = { ...props.field }
  
  // Gérer les cas spéciaux
  fieldConfig.value.hasApi = !!props.field.apiConfig
  
  // Si pas d'options mais API config, initialiser les options
  if ((!props.field.options || props.field.options.length === 0) && props.field.apiConfig) {
    fieldConfig.value.options = []
  }
  
  // Passer directement à l'étape de configuration
  step.value = 'config'
}

// Gérer la logique conditionnelle entre les champs
const setupConditionalLogic = () => {
  // Interface pour les règles conditionnelles
  fieldConfig.value.conditionalLogic = {
    enabled: false,
    action: 'show' as const, // 'show' ou 'hide'
    logicalOperator: 'AND' as const, // 'AND' ou 'OR'
    rules: [] as {
      targetFieldId: string,
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'empty' | 'not_empty' | 'greater_than' | 'less_than',
      value: any
    }[]
  }
}

const addConditionalRule = () => {
  if (!fieldConfig.value.conditionalLogic) {
    setupConditionalLogic()
  }
  
  fieldConfig.value.conditionalLogic!.rules.push({
    targetFieldId: '',
    operator: 'equals',
    value: ''
  })
}

// Reset modal state when opened
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (isEditMode.value) {
      initEditMode()
    } else {
      // Mode création
      step.value = 'select'
      selectedTemplate.value = null
      fieldConfig.value = {
        name: '',
        label: '',
        placeholder: '',
        helpText: '',
        width: 'full',
        validation: { required: false },
        options: [],
        hasApi: false,
        apiConfig: {
          method: 'GET',
          endpoint: '',
          cacheTime: 0,
          responsePath: '',
          labelKey: 'name',
          valueKey: 'id'
        }
      }
      setupConditionalLogic()
    }
    
    // Réinitialiser l'état de prévisualisation API
    apiPreviewData.value = null
    apiPreviewLoading.value = false
    apiPreviewError.value = null
    
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

.conditional-logic {
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.section-toggle {
  display: flex;
  align-items: center;
}

.toggle-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.conditional-content {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #d1d5db;
}

.operator-toggle {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.operator-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.operator-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.conditional-rules {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rule-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.remove-rule-btn {
  padding: 0.5rem;
  border: 1px solid #ef4444;
  background: white;
  color: #ef4444;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-rule-btn:hover {
  background: #ef4444;
  color: white;
}

.add-rule-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #10b981;
  background: white;
  color: #10b981;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.add-rule-btn:hover {
  background: #10b981;
  color: white;
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
  background: #f9fafb;
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.api-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.api-toggle-label {
  font-weight: 500;
  color: #374151;
}

.api-test-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.api-test-btn:hover:not(:disabled) {
  background: #2563eb;
}

.api-test-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.api-fields {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #d1d5db;
}

.api-preview {
  margin-top: 1.5rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.api-preview-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.api-preview-container {
  max-height: 200px;
  overflow-y: auto;
}

.api-preview-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #6b7280;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.api-preview-error {
  padding: 0.75rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.api-preview-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.api-preview-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.api-preview-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
}

.api-preview-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.api-preview-value {
  font-size: 0.75rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.api-preview-more {
  text-align: center;
  font-size: 0.75rem;
  font-style: italic;
  color: #6b7280;
  padding: 0.5rem 0;
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