<template>
  <div class="field-editor">
    <!-- Header simplifié avec aperçu -->
    <div class="editor-header">
      <div class="field-type-display">
        <div class="type-icon" :class="`type-${temporaryField.type}`">
          <Icon :name="getTypeIcon(temporaryField.type)" />
        </div>
        <div class="type-info">
          <h2>{{ temporaryField.label || 'Nouveau champ' }}</h2>
          <span class="type-label">{{ getTypeLabel(temporaryField.type) }}</span>
        </div>
      </div>
      
      <div class="status-indicators">
        <div class="completion-indicator" :class="completionStatus">
          {{ Math.round(completionPercentage) }}%
        </div>
        <div v-if="hasChanges" class="changes-indicator">
          {{ changesCount }} modification{{ changesCount > 1 ? 's' : '' }}
        </div>
      </div>
    </div>

    <!-- Navigation simple par onglets -->
    <div class="tabs-container">
      <nav class="tabs-nav">
        <button
          v-for="tab in availableTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab', { active: activeTab === tab.id, completed: isTabCompleted(tab.id) }]"
        >
          <Icon :name="tab.icon" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Contenu dynamique -->
    <div class="editor-content">
      <!-- Aperçu en temps réel -->
      <div class="live-preview">
        <label class="preview-label">Aperçu :</label>
        <div class="preview-field">
          <component 
            :is="getPreviewComponent()"
            v-bind="getPreviewProps()"
            :disabled="temporaryField.disabled"
            class="field-preview"
          />
        </div>
      </div>

      <!-- Configuration de base -->
      <div v-show="activeTab === 'basic'" class="tab-content">
        <div class="form-grid">
          <!-- ID et Nom -->
          <div class="form-group">
            <label class="required">Nom technique</label>
            <InputText 
              v-model="temporaryField.id"
              placeholder="ex: firstName, email"
              @input="onChange"
            />
            <small>Identifiant unique du champ</small>
          </div>

          <!-- Libellé -->
          <div class="form-group">
            <label class="required">Libellé</label>
            <InputText 
              v-model="temporaryField.label"
              placeholder="ex: Prénom, Adresse email"
              @input="onChange"
            />
          </div>

          <!-- Placeholder -->
          <div class="form-group">
            <label>Texte d'exemple</label>
            <InputText 
              v-model="temporaryField.placeholder"
              :placeholder="getDefaultPlaceholder()"
              @input="onChange"
            />
          </div>

          <!-- Description/Aide -->
          <div class="form-group span-full">
            <label>Description</label>
            <Textarea 
              v-model="temporaryField.description"
              :rows="2"
              placeholder="Information d'aide pour l'utilisateur"
              @input="onChange"
            />
          </div>

          <!-- Valeur par défaut -->
          <div class="form-group">
            <label>Valeur par défaut</label>
            <component 
              :is="getDefaultValueComponent()"
              v-model="temporaryField.defaultValue"
              v-bind="getDefaultValueProps()"
              @input="onChange"
            />
          </div>

          <!-- Type de champ - SELECT HTML NATIF AMÉLIORÉ -->
          <div class="form-group">
            <label>Type de champ</label>
            <div class="custom-select-wrapper">
              <select
                v-model="temporaryField.type"
                @change="onTypeChange"
                class="custom-select"
              >
                <optgroup 
                  v-for="category in fieldTypeCategories" 
                  :key="category.name" 
                  :label="category.name"
                >
                  <option
                    v-for="fieldType in category.types"
                    :key="fieldType.value"
                    :value="fieldType.value"
                  >
                    {{ fieldType.label }}
                  </option>
                </optgroup>
              </select>
              <div class="select-icon">
                <Icon name="i-heroicons-chevron-down" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation -->
      <div v-show="activeTab === 'validation'" class="tab-content">
        <div class="validation-section">
          <!-- Obligatoire -->
          <div class="validation-item">
            <div class="validation-toggle">
              <ToggleSwitch v-model="temporaryField.required" @change="onChange" />
              <div class="toggle-info">
                <h4>Champ obligatoire</h4>
                <p>L'utilisateur doit renseigner ce champ</p>
              </div>
            </div>
          </div>

          <!-- Validation spécifique au type -->
          <div v-if="showTextValidation" class="validation-group">
            <h4>Validation texte</h4>
            <div class="validation-grid">
              <div class="form-group">
                <label>Longueur minimum</label>
                <InputNumber 
                  v-model="temporaryField.validation.minLength"
                  :min="0"
                  @input="onChange"
                />
              </div>
              <div class="form-group">
                <label>Longueur maximum</label>
                <InputNumber 
                  v-model="temporaryField.validation.maxLength"
                  :min="0"
                  @input="onChange"
                />
              </div>
            </div>
            
            <div v-if="temporaryField.type === 'email'" class="form-group">
              <ToggleSwitch v-model="temporaryField.validation.email" @change="onChange" />
              <label>Format email valide</label>
            </div>
          </div>

          <div v-if="showNumberValidation" class="validation-group">
            <h4>Validation numérique</h4>
            <div class="validation-grid">
              <div class="form-group">
                <label>Valeur minimum</label>
                <InputNumber v-model="temporaryField.validation.min" @input="onChange" />
              </div>
              <div class="form-group">
                <label>Valeur maximum</label>
                <InputNumber v-model="temporaryField.validation.max" @input="onChange" />
              </div>
              <div class="form-group">
                <label>Pas d'incrémentation</label>
                <InputNumber 
                  v-model="temporaryField.step"
                  :min="0.01"
                  :step="0.01"
                  @input="onChange"
                />
              </div>
            </div>
          </div>

          <!-- Validation pour les fichiers -->
          <div v-if="temporaryField.type === 'file'" class="validation-group">
            <h4>Validation fichier</h4>
            <div class="validation-grid">
              <div class="form-group">
                <label>Types de fichiers acceptés</label>
                <InputText 
                  v-model="temporaryField.accept"
                  placeholder="ex: .pdf,.doc,.docx,image/*"
                  @input="onChange"
                />
                <small>Format MIME ou extensions séparées par des virgules</small>
              </div>
            </div>
          </div>

          <!-- Validation pour textarea -->
          <div v-if="temporaryField.type === 'textarea'" class="validation-group">
            <h4>Configuration textarea</h4>
            <div class="validation-grid">
              <div class="form-group">
                <label>Nombre de lignes</label>
                <InputNumber 
                  v-model="temporaryField.rows"
                  :min="1"
                  :max="20"
                  @input="onChange"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Options (pour select, radio, checkbox) -->
      <div v-show="activeTab === 'options'" class="tab-content">
        <div v-if="hasOptions" class="options-section">
          <div class="options-header">
            <h3>Options de choix</h3>
            <Button 
              @click="addOption"
              icon="i-heroicons-plus"
              label="Ajouter"
              size="small"
            />
          </div>

          <div class="options-list">
            <div 
              v-for="(option, index) in temporaryField.options"
              :key="index"
              class="option-item"
            >
              <InputText 
                v-model="option.value"
                placeholder="Valeur"
                @input="onChange"
              />
              <InputText 
                v-model="option.label"
                placeholder="Libellé"
                @input="onChange"
              />
              <div class="option-controls">
                <ToggleSwitch 
                  v-model="option.disabled"
                  @change="onChange"
                />
                <small>Désactivé</small>
                <Button 
                  @click="removeOption(index)"
                  icon="i-heroicons-trash"
                  severity="danger"
                  text
                  size="small"
                />
              </div>
            </div>
          </div>

          <div v-if="temporaryField.options && temporaryField.options.length === 0" class="empty-options">
            <div class="empty-icon">📋</div>
            <h4>Aucune option définie</h4>
            <p>Ajoutez des options pour permettre aux utilisateurs de faire un choix</p>
          </div>

          <div v-if="supportsMultiple" class="multiple-option">
            <ToggleSwitch v-model="temporaryField.multiple" @change="onChange" />
            <label>Sélection multiple</label>
          </div>
        </div>

        <div v-else class="no-options-state">
          <div class="no-options-icon">ℹ️</div>
          <h3>Aucune option requise</h3>
          <p>Ce type de champ ne nécessite pas d'options de choix</p>
        </div>
      </div>

      <!-- Apparence -->
      <div v-show="activeTab === 'appearance'" class="tab-content">
        <div class="appearance-section">
          <div class="form-grid">
            <!-- Largeur - CHECKBOXES STYLISÉES INTUITIVES -->
            <div class="form-group">
              <label>Largeur du champ</label>
              <div class="width-selector">
                <div 
                  v-for="width in widthOptions"
                  :key="width.value"
                  @click="selectWidth(width.value)"
                  :class="['width-option', { selected: temporaryField.width === width.value }]"
                >
                  <div class="width-visual">
                    <div class="width-bar" :class="width.visualClass"></div>
                  </div>
                  <div class="width-info">
                    <span class="width-label">{{ width.label }}</span>
                    <span class="width-description">{{ width.description }}</span>
                  </div>
                  <div class="width-checkbox">
                    <input 
                      type="radio" 
                      :name="`width-${temporaryField.id}`"
                      :value="width.value"
                      :checked="temporaryField.width === width.value"
                      @change="selectWidth(width.value)"
                    />
                    <div class="checkbox-custom">
                      <Icon name="i-heroicons-check" class="check-icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- États -->
            <div class="form-group">
              <label>États</label>
              <div class="toggles">
                <div class="toggle-item">
                  <ToggleSwitch v-model="temporaryField.disabled" @change="onChange" />
                  <span>Désactivé</span>
                </div>
                <div class="toggle-item">
                  <ToggleSwitch v-model="temporaryField.readonly" @change="onChange" />
                  <span>Lecture seule</span>
                </div>
              </div>
            </div>

            <!-- Ordre d'affichage -->
            <div class="form-group">
              <label>Ordre d'affichage</label>
              <InputNumber 
                v-model="temporaryField.order"
                :min="0"
                placeholder="0"
                @input="onChange"
              />
              <small>Position du champ dans le formulaire (0 = premier)</small>
            </div>

            <!-- Icône -->
            <div class="form-group">
              <label>Icône</label>
              <InputText 
                v-model="temporaryField.icon"
                placeholder="i-heroicons-envelope"
                @input="onChange"
              />
              <small>Nom de l'icône à afficher avec le champ</small>
            </div>

            <!-- Préfixe et Suffixe -->
            <div class="form-group">
              <label>Préfixe</label>
              <InputText 
                v-model="temporaryField.prefix"
                placeholder="ex: €, +33, Dr."
                @input="onChange"
              />
              <small>Texte affiché avant la saisie</small>
            </div>

            <div class="form-group">
              <label>Suffixe</label>
              <InputText 
                v-model="temporaryField.suffix"
                placeholder="ex: €, kg, %"
                @input="onChange"
              />
              <small>Texte affiché après la saisie</small>
            </div>

            <!-- Classes CSS -->
            <div class="form-group span-full">
              <label>Classes CSS personnalisées</label>
              <InputText 
                v-model="temporaryField.class"
                placeholder="ex: border-2 bg-blue-50"
                @input="onChange"
              />
              <small>Classes CSS supplémentaires pour personnaliser l'apparence</small>
            </div>

            <!-- Groupe -->
            <div class="form-group">
              <label>Groupe</label>
              <InputText 
                v-model="temporaryField.group"
                placeholder="ex: informations-personnelles"
                @input="onChange"
              />
              <small>Permet de regrouper les champs visuellement</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer avec actions -->
    <div class="editor-footer">
      <div class="footer-left">
        <span class="auto-save" :class="{ saving: autoSaving }">
          <Icon name="i-heroicons-cloud-arrow-up" />
          {{ autoSaveStatus }}
        </span>
        <div v-if="debugMode" class="debug-info">
          <small>Mode debug: {{ JSON.stringify(injectedData, null, 2) }}</small>
        </div>
      </div>
      
      <div class="footer-actions">
        <Button 
          @click="resetChanges"
          label="Annuler"
          severity="secondary"
          outlined
          :disabled="!hasChanges"
        />
        <Button 
          @click="saveField"
          label="Sauvegarder"
          :loading="saving"
          :disabled="!isValid"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, computed, onMounted, ref } from 'vue'
import type { FormField, FormFieldType, FormFieldOption, FormFieldValidation } from '~/types/form'
import { 
  saveToStorage, 
  loadFromStorage, 
  updateWorkingField,
  generateId 
} from '~/utils/utilsForm'

interface FieldTypeOption {
  value: FormFieldType
  label: string
  icon: string
  hasOptions: boolean
}

interface FieldTypeCategory {
  name: string
  types: FieldTypeOption[]
}

interface WidthOption {
  value: 'full' | 'half' | 'third'
  label: string
  description: string
  visualClass: string
}

export default defineComponent({
  name: 'FieldEditorModal',

  setup() {
    // *** RÉCUPÉRATION DES DONNÉES VIA DYNAMICDIALOG ***
    const dialogRef = inject('dialogRef') as any
    
    // État réactif
    const activeTab = ref('basic')
    const saving = ref(false)
    const autoSaving = ref(false)
    const temporaryField = ref({} as FormField)
    const originalField = ref({} as FormField)
    const hasChanges = ref(false)
    const changesCount = ref(0)
    const autoSaveTimer = ref<NodeJS.Timeout | null>(null)
    const debugMode = ref(false) // Pour le debug

    // Données injectées depuis le parent
    const injectedData = computed(() => {
      if (!dialogRef?.value?.data) {
        console.warn('⚠️ Aucune donnée reçue via DynamicDialog')
        return {}
      }
      console.log('📥 Données reçues via DynamicDialog:', dialogRef.value.data)
      return dialogRef.value.data
    })

    // Configuration des types de champs
    const fieldTypeCategories = ref<FieldTypeCategory[]>([
      {
        name: '📝 Saisie de base',
        types: [
          { value: 'text', label: 'Texte simple', icon: 'i-heroicons-pencil', hasOptions: false },
          { value: 'email', label: 'Adresse email', icon: 'i-heroicons-at-symbol', hasOptions: false },
          { value: 'password', label: 'Mot de passe', icon: 'i-heroicons-lock-closed', hasOptions: false },
          { value: 'tel', label: 'Numéro de téléphone', icon: 'i-heroicons-phone', hasOptions: false },
          { value: 'url', label: 'Adresse web', icon: 'i-heroicons-link', hasOptions: false },
          { value: 'textarea', label: 'Texte long', icon: 'i-heroicons-document-text', hasOptions: false }
        ]
      },
      {
        name: '🔢 Numérique',
        types: [
          { value: 'number', label: 'Nombre', icon: 'i-heroicons-hashtag', hasOptions: false },
          { value: 'range', label: 'Curseur de valeur', icon: 'i-heroicons-adjustments-horizontal', hasOptions: false }
        ]
      },
      {
        name: '📋 Sélection',
        types: [
          { value: 'select', label: 'Liste déroulante', icon: 'i-heroicons-chevron-down', hasOptions: true },
          { value: 'multiselect', label: 'Sélection multiple', icon: 'i-heroicons-queue-list', hasOptions: true },
          { value: 'radio', label: 'Choix unique', icon: 'i-heroicons-radio', hasOptions: true },
          { value: 'checkbox', label: 'Cases à cocher', icon: 'i-heroicons-check-circle', hasOptions: true },
          { value: 'switch', label: 'Interrupteur', icon: 'i-heroicons-toggle', hasOptions: false }
        ]
      },
      {
        name: '📅 Date et fichiers',
        types: [
          { value: 'date', label: 'Date', icon: 'i-heroicons-calendar-days', hasOptions: false },
          { value: 'datetime-local', label: 'Date et heure', icon: 'i-heroicons-clock', hasOptions: false },
          { value: 'file', label: 'Téléchargement de fichier', icon: 'i-heroicons-document-arrow-up', hasOptions: false }
        ]
      }
    ])

    // Options de largeur
    const widthOptions = ref<WidthOption[]>([
      { 
        value: 'full', 
        label: 'Pleine largeur', 
        description: 'Occupe toute la ligne',
        visualClass: 'width-full'
      },
      { 
        value: 'half', 
        label: 'Demi-largeur', 
        description: '50% de la ligne',
        visualClass: 'width-half'
      },
      { 
        value: 'third', 
        label: 'Tiers', 
        description: '33% de la ligne',
        visualClass: 'width-third'
      }
    ])

    // Computed properties
    const fieldTypes = computed(() => {
      return fieldTypeCategories.value.flatMap(category => category.types)
    })

    const availableTabs = computed(() => {
      const baseTabs = [
        { id: 'basic', label: 'Configuration', icon: 'i-heroicons-cog-6-tooth' },
        { id: 'validation', label: 'Validation', icon: 'i-heroicons-shield-check' },
        { id: 'appearance', label: 'Apparence', icon: 'i-heroicons-paint-brush' }
      ]

      if (hasOptions.value) {
        baseTabs.splice(2, 0, { id: 'options', label: 'Options', icon: 'i-heroicons-list-bullet' })
      }

      return baseTabs
    })

    const hasOptions = computed(() => {
      return ['select', 'multiselect', 'radio', 'checkbox'].includes(temporaryField.value.type)
    })

    const supportsMultiple = computed(() => {
      return ['select', 'checkbox', 'file'].includes(temporaryField.value.type)
    })

    const showTextValidation = computed(() => {
      return ['text', 'email', 'password', 'textarea', 'url', 'tel'].includes(temporaryField.value.type)
    })

    const showNumberValidation = computed(() => {
      return ['number', 'range'].includes(temporaryField.value.type)
    })

    const completionPercentage = computed(() => {
      let completed = 0
      let total = 3

      if (temporaryField.value.id && temporaryField.value.label) completed++
      completed++ // Validation toujours OK
      if (!hasOptions.value || (temporaryField.value.options && temporaryField.value.options.length > 0)) {
        completed++
      } else {
        total++
      }

      return (completed / total) * 100
    })

    const completionStatus = computed(() => {
      if (completionPercentage.value === 100) return 'complete'
      if (completionPercentage.value >= 75) return 'high'
      if (completionPercentage.value >= 50) return 'medium'
      return 'low'
    })

    const isValid = computed(() => {
      return !!(temporaryField.value.id && temporaryField.value.label && completionPercentage.value >= 60)
    })

    const autoSaveStatus = computed(() => {
      if (autoSaving.value) return 'Sauvegarde...'
      if (hasChanges.value) return 'Non sauvegardé'
      return 'Sauvegardé'
    })

    // *** FONCTIONS D'INITIALISATION ***
    
    /**
     * Initialise le champ depuis les données DynamicDialog
     */
    const initializeField = () => {
      console.log('🔧 Initialisation du champ...')
      
      // Données par défaut pour un nouveau champ
      const defaultField: FormField = {
        id: generateId('field'),
        type: 'text',
        label: '',
        placeholder: '',
        description: '',
        required: false,
        disabled: false,
        readonly: false,
        width: 'full',
        order: 0,
        validation: {},
        options: []
      }

      // Récupération et traitement des données injectées
      const receivedData = injectedData.value
      console.log('📋 Données reçues pour traitement:', receivedData)

      let fieldData = {}
      
      if (receivedData.field) {
        // Si on reçoit des données d'un champ existant, on les convertit
        fieldData = convertFromAnyFieldFormat(receivedData.field)
        console.log('🔄 Données converties:', fieldData)
      } else if (receivedData.fieldType) {
        // Si on crée un nouveau champ avec un type spécifique
        fieldData = { 
          type: receivedData.fieldType,
          label: `Nouveau ${getTypeLabel(receivedData.fieldType)}`,
          ...receivedData
        }
        console.log('🆕 Nouveau champ avec type:', fieldData)
      } else {
        console.log('🆕 Nouveau champ avec valeurs par défaut')
      }

      // Fusion avec les données par défaut
      originalField.value = Object.assign({}, defaultField, fieldData)
      temporaryField.value = JSON.parse(JSON.stringify(originalField.value))
      
      // S'assurer que la validation existe et est bien structurée
      if (!temporaryField.value.validation || typeof temporaryField.value.validation !== 'object') {
        temporaryField.value.validation = {}
      }

      // S'assurer que les options existent pour les champs qui en ont besoin
      if (hasOptions.value && (!temporaryField.value.options || !Array.isArray(temporaryField.value.options))) {
        temporaryField.value.options = []
      }

      console.log('✅ Champ initialisé:', temporaryField.value)
      console.log('📊 Données originales sauvegardées:', originalField.value)
    }

    /**
     * Convertit les données d'un champ depuis n'importe quel format vers FormField
     */
    const convertFromAnyFieldFormat = (fieldData: any): Partial<FormField> => {
      console.log('🔄 Conversion de format de champ:', fieldData)
      
      // Mapping flexible pour gérer différents formats
      const converted: Partial<FormField> = {
        // Propriétés de base (mapping direct ou avec fallback)
        id: fieldData.id || fieldData.name || generateId('field'),
        type: fieldData.type || 'text',
        label: fieldData.label || fieldData.title || '',
        placeholder: fieldData.placeholder || '',
        description: fieldData.description || fieldData.helpText || fieldData.help || '',
        defaultValue: fieldData.defaultValue || fieldData.value || undefined,
        
        // États booléens
        required: fieldData.required || fieldData.validation?.required || false,
        disabled: fieldData.disabled || false,
        readonly: fieldData.readonly || false,
        multiple: fieldData.multiple || false,
        
        // Layout et apparence
        width: fieldData.width || 'full',
        order: fieldData.order || 0,
        group: fieldData.group || '',
        icon: fieldData.icon || '',
        prefix: fieldData.prefix || '',
        suffix: fieldData.suffix || '',
        class: fieldData.class || fieldData.className || '',
        
        // Propriétés spécifiques aux types
        accept: fieldData.accept || '', // pour file
        step: fieldData.step || undefined, // pour number/range
        rows: fieldData.rows || undefined, // pour textarea
        
        // Validation (merge de toutes les règles trouvées)
        validation: {
          required: fieldData.required || fieldData.validation?.required || false,
          minLength: fieldData.validation?.minLength || fieldData.minLength,
          maxLength: fieldData.validation?.maxLength || fieldData.maxLength,
          min: fieldData.validation?.min || fieldData.min,
          max: fieldData.validation?.max || fieldData.max,
          pattern: fieldData.validation?.pattern || fieldData.pattern,
          email: fieldData.validation?.email || (fieldData.type === 'email'),
          ...fieldData.validation
        },
        
        // Options (pour les champs select, radio, checkbox)
        options: Array.isArray(fieldData.options) ? fieldData.options.map((opt: any) => ({
          label: opt.label || opt.text || opt.name || opt,
          value: opt.value || opt.val || opt,
          disabled: opt.disabled || false,
          description: opt.description || opt.desc || ''
        })) : []
      }
      
      // Nettoyage des valeurs undefined/null
      Object.keys(converted).forEach(key => {
        if (converted[key as keyof FormField] === undefined || converted[key as keyof FormField] === null) {
          delete converted[key as keyof FormField]
        }
      })
      
      console.log('✅ Données converties vers FormField:', converted)
      return converted
    }

    /**
     * Convertit FormField vers le format attendu par le composant parent
     */
    const convertToParentFormat = (formField: FormField): any => {
      // Récupération des données originales du parent pour préserver la structure
      const originalParentData = injectedData.value.field || {}
      
      const converted = {
        // Préservation des champs du parent qui ne sont pas dans FormField
        ...originalParentData,
        
        // Mapping des données FormField vers le format parent
        id: formField.id,
        type: formField.type,
        label: formField.label,
        placeholder: formField.placeholder || '',
        helpText: formField.description || '',
        defaultValue: formField.defaultValue,
        
        // États
        disabled: formField.disabled || false,
        readonly: formField.readonly || false,
        required: formField.required || false,
        multiple: formField.multiple || false,
        
        // Layout
        width: formField.width || 'full',
        order: formField.order || 0,
        group: formField.group || '',
        
        // Apparence
        icon: formField.icon || '',
        prefix: formField.prefix || '',
        suffix: formField.suffix || '',
        class: formField.class || '',
        
        // Propriétés spécifiques
        accept: formField.accept || '',
        step: formField.step,
        rows: formField.rows,
        
        // Validation
        validation: {
          required: formField.required || false,
          ...formField.validation
        },
        
        // Options
        options: formField.options || []
      }
      
      console.log('🔄 Données converties pour le parent:', converted)
      return converted
    }

    /**
     * Charge les données temporaires du localStorage
     */
    const loadTempData = () => {
      const tempKey = `temp_field_${originalField.value.id}`
      const tempData = loadFromStorage(tempKey, null)
      
      if (tempData && typeof tempData === 'object') {
        temporaryField.value = Object.assign({}, temporaryField.value, tempData)
        detectChanges()
        console.log('🔄 Données temporaires rechargées depuis localStorage')
      }
    }

    // *** FONCTIONS DE GESTION DES CHANGEMENTS ***
    
    const detectChanges = () => {
      const hasChanged = JSON.stringify(temporaryField.value) !== JSON.stringify(originalField.value)
      hasChanges.value = hasChanged
      
      if (hasChanged) {
        changesCount.value = countChanges()
      } else {
        changesCount.value = 0
      }
    }

    const countChanges = (): number => {
      let count = 0
      const original = originalField.value as Record<string, any>
      const current = temporaryField.value as Record<string, any>

      Object.keys(current).forEach(key => {
        if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
          count++
        }
      })

      return count
    }

    const onChange = () => {
      detectChanges()
      debouncedAutoSave()
    }

    const onTypeChange = () => {
      // Réinitialiser les propriétés spécifiques au type
      if (!hasOptions.value) {
        temporaryField.value.options = []
        temporaryField.value.multiple = false
      }

      // Ajouter les options par défaut si nécessaire
      if (hasOptions.value && (!temporaryField.value.options || temporaryField.value.options.length === 0)) {
        temporaryField.value.options = [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ]
      }

      // Ajuster la validation selon le type
      if (!temporaryField.value.validation) {
        temporaryField.value.validation = {}
      }

      // Validation spécifique email
      if (temporaryField.value.type === 'email') {
        temporaryField.value.validation.email = true
      }

      onChange()
    }

    // *** FONCTIONS DE SAUVEGARDE ***
    
    const debouncedAutoSave = () => {
      if (autoSaveTimer.value) {
        clearTimeout(autoSaveTimer.value)
      }
      
      autoSaveTimer.value = setTimeout(() => {
        performAutoSave()
      }, 1000)
    }

    const performAutoSave = async () => {
      if (!hasChanges.value) return
      
      autoSaving.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 200))
        saveTempData()
      } finally {
        autoSaving.value = false
      }
    }

    const saveTempData = () => {
      const tempKey = `temp_field_${originalField.value.id}`
      saveToStorage(tempKey, temporaryField.value)
      console.log('💾 Données temporaires sauvegardées')
    }

    const saveField = async () => {
      if (!isValid.value) return
      
      saving.value = true
      try {
        // Convertir vers le format parent avant de fermer
        const parentFormatField = convertToParentFormat(temporaryField.value)
        
        // Optionnel: sauvegarder via les utilitaires
        const success = updateWorkingField('default', temporaryField.value.id, temporaryField.value)
        
        if (success) {
          // Nettoyer le localStorage temporaire
          const tempKey = `temp_field_${originalField.value.id}`
          localStorage.removeItem(tempKey)
          
          console.log('💾 Données sauvegardées et converties pour le parent:', parentFormatField)
          
          // Fermer le modal avec les données converties
          dialogRef?.value?.close(parentFormatField)
        }
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error)
      } finally {
        saving.value = false
      }
    }

    const resetChanges = () => {
      temporaryField.value = JSON.parse(JSON.stringify(originalField.value))
      detectChanges()
      
      // Nettoyer les données temporaires
      const tempKey = `temp_field_${originalField.value.id}`
      localStorage.removeItem(tempKey)
      
      console.log('🔄 Modifications annulées, retour aux valeurs originales')
    }

    // *** FONCTIONS UTILITAIRES ***
    
    const selectWidth = (width: 'full' | 'half' | 'third') => {
      temporaryField.value.width = width
      onChange()
    }

    const addOption = () => {
      if (!temporaryField.value.options) {
        temporaryField.value.options = []
      }
      
      const newOption: FormFieldOption = {
        label: `Option ${temporaryField.value.options.length + 1}`,
        value: `option${temporaryField.value.options.length + 1}`,
        disabled: false
      }
      
      temporaryField.value.options.push(newOption)
      onChange()
    }

    const removeOption = (index: number) => {
      if (temporaryField.value.options) {
        temporaryField.value.options.splice(index, 1)
        onChange()
      }
    }

    const isTabCompleted = (tabId: string): boolean => {
      switch (tabId) {
        case 'basic':
          return !!(temporaryField.value.id && temporaryField.value.label)
        case 'validation':
          return true
        case 'options':
          return !hasOptions.value || !!(temporaryField.value.options && temporaryField.value.options.length > 0)
        case 'appearance':
          return true
        default:
          return false
      }
    }

    const getTypeIcon = (type: FormFieldType): string => {
      const fieldType = fieldTypes.value.find(t => t.value === type)
      return fieldType?.icon || 'i-heroicons-square-3-stack-3d'
    }

    const getTypeLabel = (type: FormFieldType): string => {
      const fieldType = fieldTypes.value.find(t => t.value === type)
      return fieldType?.label || type
    }

    const getDefaultPlaceholder = (): string => {
      const placeholders: Record<FormFieldType, string> = {
        text: 'Saisissez votre texte...',
        email: 'exemple@domaine.com',
        password: '••••••••',
        number: '0',
        tel: '+33 1 23 45 67 89',
        url: 'https://exemple.com',
        textarea: 'Votre message...',
        select: 'Choisissez une option',
        multiselect: 'Sélectionnez des options',
        radio: '',
        checkbox: '',
        date: 'JJ/MM/AAAA',
        'datetime-local': 'JJ/MM/AAAA HH:MM',
        file: 'Choisir un fichier',
        switch: '',
        range: '50'
      }
      return placeholders[temporaryField.value.type] || ''
    }

    const getPreviewComponent = (): string => {
      const components: Record<FormFieldType, string> = {
        text: 'InputText',
        email: 'InputText',
        password: 'Password',
        number: 'InputNumber',
        tel: 'InputMask',
        url: 'InputText',
        textarea: 'Textarea',
        select: 'Dropdown',
        multiselect: 'MultiSelect',
        radio: 'RadioButton',
        checkbox: 'Checkbox',
        date: 'Calendar',
        'datetime-local': 'Calendar',
        file: 'FileUpload',
        switch: 'ToggleSwitch',
        range: 'Slider'
      }
      return components[temporaryField.value.type] || 'InputText'
    }

    const getPreviewProps = (): Record<string, any> => {
      const baseProps = {
        placeholder: temporaryField.value.placeholder || getDefaultPlaceholder(),
        readonly: temporaryField.value.readonly,
        modelValue: temporaryField.value.defaultValue
      }

      switch (temporaryField.value.type) {
        case 'tel':
          return { ...baseProps, mask: '+33 9 99 99 99 99' }
        case 'number':
        case 'range':
          return { 
            ...baseProps, 
            min: temporaryField.value.validation?.min,
            max: temporaryField.value.validation?.max,
            step: temporaryField.value.step
          }
        case 'select':
        case 'multiselect':
          return {
            ...baseProps,
            options: temporaryField.value.options || [],
            optionLabel: 'label',
            optionValue: 'value',
            multiple: temporaryField.value.multiple
          }
        case 'textarea':
          return { ...baseProps, rows: temporaryField.value.rows || 3 }
        case 'file':
          return { 
            ...baseProps, 
            accept: temporaryField.value.accept,
            multiple: temporaryField.value.multiple 
          }
        default:
          return baseProps
      }
    }

    const getDefaultValueComponent = (): string => {
      if (['select', 'multiselect'].includes(temporaryField.value.type)) {
        return 'Dropdown'
      }
      if (temporaryField.value.type === 'textarea') {
        return 'Textarea'
      }
      if (['number', 'range'].includes(temporaryField.value.type)) {
        return 'InputNumber'
      }
      if (temporaryField.value.type === 'switch') {
        return 'ToggleSwitch'
      }
      return 'InputText'
    }

    const getDefaultValueProps = (): Record<string, any> => {
      const baseProps = { placeholder: 'Valeur par défaut...' }
      
      if (['select', 'multiselect'].includes(temporaryField.value.type)) {
        return {
          ...baseProps,
          options: temporaryField.value.options || [],
          optionLabel: 'label',
          optionValue: 'value'
        }
      }
      
      return baseProps
    }

    const cleanup = () => {
      if (autoSaveTimer.value) {
        clearTimeout(autoSaveTimer.value)
      }
    }

    // === GESTION DES CHAMPS (API) ===
    
    /**
     * Créer un nouveau champ via API
     */
    const createFieldAPI = async (formId: string, fieldData: any): Promise<void> => {
      try {
        saving.value = true
        
        const response = await $fetch(`/api/forms/${formId}/fields`, {
          method: 'POST',
          body: fieldData
        })
        
        if (response.success && response.data.field) {
          // Émettre l'événement de création réussie
          if (dialogRef?.value?.close) {
            dialogRef.value.close({ 
              type: 'field-created', 
              field: response.data.field 
            })
          }
        }
      } catch (error) {
        console.error('Erreur lors de la création du champ:', error)
        throw error
      } finally {
        saving.value = false
      }
    }

    /**
     * Mettre à jour un champ via API
     */
    const updateFieldAPI = async (formId: string, fieldId: string, fieldData: any): Promise<void> => {
      try {
        saving.value = true
        
        const response = await $fetch(`/api/forms/${formId}/fields/${fieldId}`, {
          method: 'PUT',
          body: fieldData
        })
        
        if (response.success && response.data.field) {
          // Émettre l'événement de mise à jour réussie
          if (dialogRef?.value?.close) {
            dialogRef.value.close({ 
              type: 'field-updated', 
              field: response.data.field 
            })
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du champ:', error)
        throw error
      } finally {
        saving.value = false
      }
    }

    /**
     * Supprimer un champ via API
     */
    const deleteFieldAPI = async (formId: string, fieldId: string): Promise<void> => {
      try {
        const response = await $fetch(`/api/forms/${formId}/fields/${fieldId}`, {
          method: 'DELETE'
        })
        
        if (response.success) {
          // Émettre l'événement de suppression réussie
          if (dialogRef?.value?.close) {
            dialogRef.value.close({ 
              type: 'field-deleted', 
              fieldId: fieldId 
            })
          }
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du champ:', error)
        throw error
      }
    }

    /**
     * Sauvegarder le champ via API (version améliorée)
     */
    const saveFieldAPI = async (): Promise<void> => {
      if (!isValid.value) return

      try {
        const fieldData = convertToParentFormat(temporaryField.value)
        const receivedData = injectedData.value
        
        if (receivedData.field && receivedData.field.id) {
          // Mise à jour d'un champ existant
          await updateFieldAPI(receivedData.formId || 'default', receivedData.field.id, fieldData)
        } else {
          // Création d'un nouveau champ
          await createFieldAPI(receivedData.formId || 'default', fieldData)
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde via API:', error)
        // Fallback vers la méthode existante
        await saveField()
      }
    }

    // *** CYCLE DE VIE ***
    onMounted(() => {
      console.log('🚀 FieldEditorModal monté, initialisation...')
      initializeField()
      loadTempData()
      
      // Activer le mode debug si nécessaire
      if (process.env.NODE_ENV === 'development') {
        debugMode.value = true
      }
    })

    // Retour de tous les éléments nécessaires au template
    return {
      // État réactif
      activeTab,
      saving,
      autoSaving,
      temporaryField,
      hasChanges,
      changesCount,
      debugMode,
      injectedData,
      
      // Configuration
      fieldTypeCategories,
      widthOptions,
      
      // Computed
      fieldTypes,
      availableTabs,
      hasOptions,
      supportsMultiple,
      showTextValidation,
      showNumberValidation,
      completionPercentage,
      completionStatus,
      isValid,
      autoSaveStatus,
      
      // Méthodes
      onChange,
      onTypeChange,
      selectWidth,
      addOption,
      removeOption,
      resetChanges,
      saveField,
      saveFieldAPI,
      createFieldAPI,
      updateFieldAPI,
      deleteFieldAPI,
      isTabCompleted,
      getTypeIcon,
      getTypeLabel,
      getDefaultPlaceholder,
      getPreviewComponent,
      getPreviewProps,
      getDefaultValueComponent,
      getDefaultValueProps,
      cleanup
    }
  }
})
</script>

<style scoped>
/* FieldEditorModal - Styles avec SELECT natif et WIDTH checkboxes */

.field-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  min-height: 600px;
}

/* Header moderne et cohérent */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid #e2e8f0;
  position: relative;
}

.editor-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  opacity: 0.8;
}

.field-type-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.type-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.type-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
  z-index: -1;
}

/* Types de champs avec gradients cohérents */
.type-icon.type-text,
.type-icon.type-email,
.type-icon.type-password,
.type-icon.type-url,
.type-icon.type-tel,
.type-icon.type-textarea {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.type-icon.type-number,
.type-icon.type-range {
  background: linear-gradient(135deg, #10b981, #059669);
}

.type-icon.type-select,
.type-icon.type-multiselect,
.type-icon.type-radio,
.type-icon.type-checkbox {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.type-icon.type-date,
.type-icon.type-datetime-local {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.type-icon.type-file {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.type-icon.type-switch {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.type-info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.type-info .type-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

/* Indicateurs de statut améliorés */
.status-indicators {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.completion-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.completion-indicator.low {
  background: linear-gradient(135deg, #fef3c7, #fed7aa);
  color: #92400e;
  border: 2px solid #f59e0b;
}

.completion-indicator.medium {
  background: linear-gradient(135deg, #ddd6fe, #c7d2fe);
  color: #5b21b6;
  border: 2px solid #8b5cf6;
}

.completion-indicator.high {
  background: linear-gradient(135deg, #bfdbfe, #93c5fd);
  color: #1e40af;
  border: 2px solid #3b82f6;
}

.completion-indicator.complete {
  background: linear-gradient(135deg, #bbf7d0, #86efac);
  color: #166534;
  border: 2px solid #10b981;
  animation: completePulse 2s infinite;
}

@keyframes completePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.changes-indicator {
  background: linear-gradient(135deg, #fef3c7, #fed7aa);
  color: #92400e;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid #f59e0b;
  animation: changesPulse 3s infinite;
}

@keyframes changesPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Navigation par onglets moderne */
.tabs-container {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2rem;
  position: relative;
}

.tabs-nav {
  display: flex;
  gap: 0;
  position: relative;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 0.5rem 0.5rem 0 0;
}

.tab::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px 2px 0 0;
}

.tab:hover {
  color: #374151;
  background: #f9fafb;
}

.tab:hover::before {
  width: 60%;
}

.tab.active {
  color: #3b82f6;
  background: #f8fafc;
  font-weight: 600;
}

.tab.active::before {
  width: 100%;
}

.tab.completed {
  color: #10b981;
}

.tab.completed::after {
  content: '✓';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1rem;
  height: 1rem;
  background: #10b981;
  color: white;
  border-radius: 50%;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* Contenu principal */
.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: #fafbfc;
}

/* Aperçu en temps réel */
.live-preview {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.live-preview:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.preview-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.preview-field {
  position: relative;
}

.field-preview {
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Contenu des onglets */
.tab-content {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  animation: slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Grille de formulaire responsive */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.span-full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.form-group label.required::after {
  content: '*';
  color: #ef4444;
  font-weight: bold;
}

.form-group small {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  line-height: 1.4;
}

/* === SELECT NATIF CUSTOM ULTRA-STYLÉ === */

.custom-select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.custom-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.5;
  color: #374151;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border: 2px solid #d1d5db;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.custom-select:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  transform: translateY(-1px);
}

.custom-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 4px 16px rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
  transform: translateY(-2px);
}

.custom-select:active {
  transform: translateY(0);
}

.select-icon {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
}

.custom-select:hover + .select-icon {
  color: #3b82f6;
  transform: translateY(-50%) rotate(180deg);
}

.custom-select:focus + .select-icon {
  color: #1d4ed8;
  transform: translateY(-50%) rotate(180deg) scale(1.1);
}

/* Styles pour les optgroups */
.custom-select optgroup {
  font-weight: 700;
  color: #1f2937;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #d1d5db;
}

.custom-select option {
  padding: 0.75rem 1rem;
  color: #374151;
  background: white;
  font-weight: 500;
  line-height: 1.5;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.custom-select option:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1d4ed8;
}

.custom-select option:checked {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
}

/* === SÉLECTEUR DE LARGEUR AVEC CHECKBOXES INTUITIVES === */

.width-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.width-selector:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.width-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.width-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.6s ease;
  z-index: 1;
}

.width-option:hover::before {
  left: 100%;
}

.width-option:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.width-option.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 
    0 4px 16px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.width-option.selected::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 0.75rem 0.75rem 0 0;
}

.width-visual {
  flex-shrink: 0;
  width: 4rem;
  height: 2rem;
  background: #f3f4f6;
  border-radius: 0.375rem;
  position: relative;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.width-bar {
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 0.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.width-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.width-bar.width-full {
  width: 100%;
}

.width-bar.width-half {
  width: 50%;
}

.width-bar.width-third {
  width: 33.333%;
}

.width-option:hover .width-bar {
  transform: scaleY(1.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.width-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
  z-index: 2;
}

.width-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  transition: color 0.3s ease;
}

.width-option.selected .width-label {
  color: #1d4ed8;
}

.width-description {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.width-option.selected .width-description {
  color: #3730a3;
}

.width-checkbox {
  position: relative;
  flex-shrink: 0;
  z-index: 2;
}

.width-checkbox input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.width-option:hover .checkbox-custom {
  border-color: #93c5fd;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.width-option.selected .checkbox-custom {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.check-icon {
  width: 0.875rem;
  height: 0.875rem;
  opacity: 0;
  transform: scale(0) rotate(-45deg);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.width-option.selected .check-icon {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* États vides pour les options */
.empty-options {
  text-align: center;
  padding: 3rem 2rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 2px dashed #d1d5db;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-options h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-options p {
  color: #6b7280;
  margin: 0;
}

.no-options-state {
  text-align: center;
  padding: 3rem 2rem;
}

.no-options-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-options-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.no-options-state p {
  color: #6b7280;
  margin: 0;
}

/* Sections de validation */
.validation-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.validation-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.validation-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.validation-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.toggle-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.validation-group {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.validation-group h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.validation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Options de champs */
.options-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 2rem;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.options-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.option-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.multiple-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
}

.multiple-option label {
  font-weight: 600 !important;
  color: #374151 !important;
}

/* Apparence */
.appearance-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 2rem;
}

.toggles {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.toggle-item span {
  font-weight: 600;
  color: #374151;
}

/* Footer avec actions */
.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  border-top: 2px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.footer-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.auto-save {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.auto-save.saving {
  color: #3b82f6;
  background: #eff6ff;
  border-color: #93c5fd;
  animation: savingPulse 2s infinite;
}

@keyframes savingPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.debug-info {
  max-width: 300px;
  overflow: hidden;
  font-family: monospace;
  background: #111827;
  color: #f3f4f6;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.footer-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .tabs-nav {
    flex-wrap: wrap;
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .editor-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .footer-actions {
    width: 100%;
    justify-content: center;
  }

  .option-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .width-selector {
    padding: 0.75rem;
  }

  .width-option {
    padding: 0.75rem;
  }
}

/* Styles des inputs cohérents avec l'application */
:deep(.p-inputtext),
:deep(.p-textarea),
:deep(.p-dropdown),
:deep(.p-inputnumber-input),
:deep(.p-selectbutton .p-button) {
  border: 2px solid #d1d5db !important;
  border-radius: 0.5rem !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.875rem !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  background: white !important;
  color: #374151 !important;
}

:deep(.p-inputtext:hover),
:deep(.p-textarea:hover),
:deep(.p-dropdown:hover),
:deep(.p-inputnumber:hover .p-inputnumber-input) {
  border-color: #93c5fd !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1) !important;
}

:deep(.p-inputtext:focus),
:deep(.p-textarea:focus),
:deep(.p-dropdown:focus),
:deep(.p-inputnumber:focus-within .p-inputnumber-input),
:deep(.p-selectbutton .p-button:focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  outline: none !important;
}

/* Toggle Switch personnalisé */
:deep(.p-toggleswitch) {
  width: 3rem !important;
  height: 1.75rem !important;
}

:deep(.p-toggleswitch .p-toggleswitch-slider) {
  background: #d1d5db !important;
  border-radius: 9999px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 2px solid #e5e7eb !important;
  position: relative !important;
}

:deep(.p-toggleswitch .p-toggleswitch-slider::before) {
  content: '' !important;
  position: absolute !important;
  top: 4px !important;
  left: 2px !important;
  width: 1rem !important;
  height: 1rem !important;
  background: white !important;
  border-radius: 50% !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  border-color: #1d4ed8 !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider::before) {
  transform: translateX(1.25rem) !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
}

:deep(.p-toggleswitch:hover .p-toggleswitch-slider) {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2) !important;
  transform: scale(1.05) !important;
}

:deep(.p-toggleswitch:focus .p-toggleswitch-slider) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  outline: none !important;
}

/* Focus visible pour l'accessibilité */
.tab:focus-visible,
:deep(.p-button:focus-visible),
:deep(.p-inputtext:focus-visible),
.custom-select:focus-visible,
.width-option:focus-visible {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
}
</style>
