<!--
  FormBuilder.vue - Constructeur de formulaires avec drag & drop avancé
  
  @description Composant principal pour construire des formulaires avec interface drag & drop,
  redimensionnement intelligent, alignement automatique et édition de champs.
  
  @features
  - Drag & drop depuis FieldList vers le formulaire
  - Redimensionnement des champs (1/3, 1/2, pleine largeur)
  - Alignement intelligent automatique
  - Édition de champs via modal
  - Déplacement et réorganisation des champs
  - Interface utilisateur intuitive
  
  @example
  <FormBuilder
    :fields="formFields"
    :steps="formSteps"
    :mode="currentMode"
    @submit="onFormSubmit"
    @field-update="onFieldUpdate"
  />
-->
<template>
  <div class="form-builder">
    <!-- Edit mode: Interface de construction -->
    <div v-if="mode === 'edit'" class="form-builder-edit">
      <div class="form-builder-layout">
        <!-- Zone de construction principale -->
        <div class="form-builder-main">
          <!-- Navigation des étapes -->
          <div v-if="steps.length > 0" class="form-steps-nav">
            <nav class="flex space-x-1 mb-6">
              <button
                v-for="(step, index) in steps"
                :key="step.id"
                @click="setActiveStep(index)"
                class="form-step-tab"
                :class="{
                  'form-step-tab--active': activeStepIndex === index,
                  'form-step-tab--completed': isStepCompleted(index)
                }"
              >
                <Icon v-if="step.icon" :name="step.icon" class="w-4 h-4 mr-2" />
                <span class="form-step-number">{{ index + 1 }}</span>
                <span class="form-step-title">{{ step.title }}</span>
              </button>
            </nav>
          </div>

          <!-- Contenu de l'étape active -->
          <div class="form-builder-content">
            <div v-if="activeStep" class="form-step-content">
              <!-- En-tête de l'étape -->
              <div class="form-step-header">
                <h2 class="form-step-title-large">{{ activeStep.title }}</h2>
                <p v-if="activeStep.description" class="form-step-description">
                  {{ activeStep.description }}
                </p>
              </div>
              
              <!-- Barre d'outils -->
              <div class="form-builder-toolbar">
                <div class="toolbar-left">
                  <div class="form-builder-instructions">
                    <Icon name="i-heroicons-information-circle" class="w-4 h-4 mr-2 text-blue-500" />
                    <span class="text-sm text-gray-600">
                      Glissez depuis la sidebar • Redimensionnez avec le coin inférieur droit
                    </span>
                  </div>
                  
                  <!-- Indicateur de session -->
                  <div v-if="sessionInitialized" class="session-indicator">
                    <Icon name="i-heroicons-circle-stack" class="w-4 h-4 mr-1 text-green-500" />
                    <span class="text-xs text-gray-600">Session active</span>
                    <span v-if="hasUnsavedChanges" class="unsaved-indicator">•</span>
                  </div>
                </div>
                
                <div class="toolbar-center">
                  <!-- Boutons de gestion de session -->
                  <div class="session-controls">
                    <button
                      @click="addStep"
                      :disabled="!sessionInitialized || isLoading"
                      class="toolbar-btn toolbar-btn--success"
                      title="Ajouter une étape (crée en BD)"
                    >
                      <Icon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
                      <span class="btn-text">Nouvelle étape</span>
                    </button>
                    
                    <button
                      @click="saveToDatabase"
                      :disabled="!sessionInitialized || !hasUnsavedChanges || isLoading"
                      class="toolbar-btn toolbar-btn--primary"
                      title="Sauvegarder les champs en base de données"
                    >
                      <Icon v-if="isLoading" name="i-heroicons-arrow-path" class="w-4 h-4 mr-1 animate-spin" />
                      <Icon v-else name="i-heroicons-cloud-arrow-up" class="w-4 h-4 mr-1" />
                      <span class="btn-text">Sauvegarder</span>
                    </button>
                  </div>
                </div>
                
                <div class="toolbar-right">
                  <!-- Options d'alignement -->
                  <div class="alignment-options">
                    <button
                      @click="toggleGridOverlay"
                      :class="{ 'active': showGridOverlay }"
                      class="toolbar-btn"
                      title="Afficher la grille"
                    >
                      <Icon name="i-heroicons-squares-2x2" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="toggleSmartAlignment"
                      :class="{ 'active': smartAlignment }"
                      class="toolbar-btn"
                      title="Alignement intelligent"
                    >
                      <Icon name="i-heroicons-bars-3-bottom-left" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="clearCurrentSession"
                      :disabled="!sessionInitialized"
                      class="toolbar-btn toolbar-btn--danger"
                      title="Terminer la session"
                    >
                      <Icon name="i-heroicons-x-mark" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Zone de construction des champs -->
              <div 
                class="form-fields-container"
                :class="{ 
                  'show-grid': showGridOverlay,
                  'smart-alignment': smartAlignment
                }"
              >                <!-- Overlay de redimensionnement en temps réel -->
                <div 
                  v-if="resizePreview" 
                  class="resize-preview-overlay"
                >
                  <div class="preview-indicator">
                    <div class="preview-header">
                      <Icon name="i-heroicons-arrows-right-left" class="w-5 h-5 text-blue-600" />
                      <span class="preview-title">Redimensionnement en cours</span>
                    </div>
                    
                    <div class="preview-content">
                      <div class="preview-current">
                        <span class="preview-label">{{ resizePreview.widthLabel }}</span>
                        <span class="preview-percentage">{{ resizePreview.widthPercentage }}%</span>
                      </div>
                      
                      <div v-if="resizePreview.deltaX !== undefined" class="preview-delta">
                        <span class="delta-arrow">{{ resizePreview.deltaX > 0 ? '→' : '←' }}</span>
                        <span class="delta-value">{{ Math.abs(resizePreview.deltaX || 0) }}px</span>
                      </div>
                    </div>
                    
                    <div class="preview-guide">
                      <div class="width-options">
                        <div 
                          v-for="(label, key) in widthLabels" 
                          :key="key"
                          class="width-option"
                          :class="{ 
                            'active': key === resizePreview.currentWidth,
                            'start': key === resizePreview.startWidth
                          }"
                        >
                          <div class="option-bar" :style="{ width: widthValues[key] + '%' }"></div>
                          <span class="option-label">{{ label }}</span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>

                <!-- Système de lignes intelligentes -->
                <div class="intelligent-rows-container">                  <!-- État vide -->                  
                  <div v-if="currentStepFields.length === 0" class="form-fields-empty">
                    <!-- Zone de drop pour champs vides -->
                    <draggable
                      v-model="emptyDropZone"
                      :group="{ name: 'form-fields', pull: false, put: true }"
                      :item-key="() => 'empty'"
                      class="empty-drop-zone"
                      @add="onFieldAddedToEmpty"
                      @change="onEmptyZoneChange"
                    >
                      <template #item="{}">
                        <!-- Template vide, ne sera jamais utilisé -->
                      </template>
                      
                      <div class="empty-content">
                        <Icon name="i-heroicons-cursor-arrow-rays" class="w-16 h-16 text-gray-300 mb-4" />
                        <h3 class="text-lg font-medium text-gray-700 mb-2">Zone de construction</h3>
                        <p class="text-gray-500 mb-4">
                          Glissez des champs depuis la sidebar pour commencer à construire votre formulaire
                        </p>
                        <div class="drop-zone-hint" :class="{ 'drop-zone-hint--active': isDragging }">
                          <Icon name="i-heroicons-arrow-down" class="w-5 h-5 text-blue-400" />
                          <span class="text-sm text-blue-600">Déposez un champ ici</span>
                        </div>
                      </div>
                    </draggable>
                  </div>

                  <!-- Lignes de champs avec alignement intelligent -->
                  <div v-else class="field-rows">
                    <div 
                      v-for="(row, rowIndex) in intelligentRows" 
                      :key="`row-${rowIndex}`"
                      class="field-row"
                      :class="{
                        'field-row--has-space': row.hasSpace,
                        'field-row--drag-target': dragState.targetRow === rowIndex,
                        'field-row--can-accept': canRowAcceptDraggedField(row)
                      }"
                    >
                      <!-- Zone de drop au début de la ligne -->
                      <div 
                        v-if="isDragging && canRowAcceptDraggedField(row)"
                        class="drop-zone drop-zone--row-start"
                        @dragover.prevent
                        @drop="onDropInRow(rowIndex, 'start')"
                      >
                        <Icon name="i-heroicons-plus" class="w-4 h-4" />
                      </div>                      <!-- Conteneur des champs de la ligne -->                      <draggable
                        v-model="row.fields"
                        :group="{ name: 'form-fields', pull: true, put: true }"
                        :item-key="(field: StepFormField) => field.id"
                        :disabled="mode !== 'edit'"
                        ghost-class="field-ghost"
                        chosen-class="field-chosen"
                        drag-class="field-drag"
                        @start="onFieldDragStart"
                        @end="onFieldDragEnd"
                        @change="onRowFieldsChange(rowIndex, $event)"
                        @add="onFieldAdded"
                        class="row-fields-container"
                      >
                        <template #item="{ element: field, index: fieldIndex }">                          <div
                            :key="field.id"
                            class="field-wrapper"
                            :class="getFieldClasses(field)"
                            :data-field-id="field.id"
                            :data-field-width="getEffectiveFieldWidth(field)"
                            @click="selectField(field.id)"
                          ><!-- Bouton d'édition visible au survol -->
                            
                            
                            <!-- Composant FieldItem -->
                            <FieldItem
                              :field="field"
                              :selected="selectedFieldId === field.id"
                              :affected="isFieldAffectedByResize(field)"
                              :preview-width="getPreviewWidth(field)"
                              @edit="editField"
                              @delete="deleteField"
                              @duplicate="duplicateField"
                            />                            <!-- Contrôle de redimensionnement -->
                            <FieldCornerControl
                              v-if="mode === 'edit' && selectedFieldId === field.id"
                              :field="field"
                              :is-active="activeCornerFieldId === field.id"
                              @resize-start="onFieldResizeStart"
                              @resize="onFieldResize"
                              @resize-end="onFieldResizeEnd"
                            />

                            <!-- Barre d'outils du champ sélectionné -->
                            <div 
                              v-if="mode === 'edit' && selectedFieldId === field.id"
                              class="field-toolbar"
                            >
                              <div class="field-toolbar-buttons">
                                 <button
                                    type="button"
                                    @click="editField(field.id)"
                                    class="field-toolbar-btn field-toolbar-btn--edit"
                                    title="Éditer le champ"
                                  >
                                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    @click="duplicateField(field.id)"
                                    class="field-toolbar-btn field-toolbar-btn--duplicate"
                                    title="Dupliquer le champ"
                                  >
                                    <Icon name="heroicons:document-duplicate" class="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    @click="deleteField(field.id)"
                                    class="field-toolbar-btn field-toolbar-btn--delete"
                                    title="Supprimer le champ"
                                  >
                                    <Icon name="heroicons:trash" class="w-4 h-4" />
                                  </button>
                              </div>
                              <div class="field-toolbar-info">
                                <span class="field-type-badge">{{ getFieldTypeLabel(field.type) }}</span>
                              </div>
                            </div>

                            <!-- Zone de drop entre champs -->
                            <div 
                              v-if="isDragging && fieldIndex < row.fields.length - 1"
                              class="drop-zone drop-zone--between"
                              @dragover.prevent
                              @drop="onDropInRow(rowIndex, 'between', fieldIndex)"
                            >
                              <Icon name="i-heroicons-plus" class="w-3 h-3" />
                            </div>
                          </div>
                        </template>
                      </draggable>

                      <!-- Zone de drop à la fin de la ligne -->
                      <div 
                        v-if="isDragging && canRowAcceptDraggedField(row)"
                        class="drop-zone drop-zone--row-end"
                        @dragover.prevent
                        @drop="onDropInRow(rowIndex, 'end')"
                      >
                        <Icon name="i-heroicons-plus" class="w-4 h-4" />
                      </div>

                      <!-- Informations de la ligne (en mode debug) -->
                      <div v-if="isDragging" class="row-info">
                        <span class="row-stats">
                          {{ row.fields.length }}/{{ maxFieldsPerRow }} • {{ Math.round(row.totalWidth) }}%
                        </span>
                      </div>
                    </div>

                    <!-- Zone de drop pour nouvelle ligne -->
                    <div 
                      v-if="isDragging"
                      class="drop-zone drop-zone--new-row"
                      @dragover.prevent
                      @drop="onDropNewRow"
                    >
                      <div class="drop-zone-content">
                        <Icon name="i-heroicons-plus-circle" class="w-6 h-6" />
                        <span>Créer une nouvelle ligne</span>
                      </div>
                    </div>

                    <!-- Zone de drop permanente pour ajouter des champs -->
                    <div class="permanent-drop-zone">
                      <draggable
                        v-model="newFieldDropZone"
                        :group="{ name: 'form-fields', pull: false, put: true }"
                        :item-key="() => 'new-field'"
                        class="new-field-drop-zone"
                        @add="onNewFieldDropped"
                        @change="onNewFieldChange"
                      >
                        <template #item="{}">
                          <!-- Template vide, ne sera jamais utilisé -->
                        </template>
                        
                        <div class="new-field-content">
                          <Icon name="i-heroicons-plus-circle" class="w-8 h-8 text-gray-300 mb-2" />
                          <p class="text-sm text-gray-500">
                            Glissez un champ ici pour l'ajouter à une nouvelle ligne
                          </p>
                        </div>
                      </draggable>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- État sans étape -->
            <div v-else class="form-no-steps">
              <Icon name="i-heroicons-list-bullet" class="w-12 h-12 text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune étape</h3>
              <p class="text-gray-500">Ajoutez des étapes pour organiser votre formulaire.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode preview -->
    <div v-else-if="mode === 'preview'" class="form-builder-preview">
      <div class="form-builder-layout">
        <!-- Zone de formulaire principale -->
        <div class="form-builder-main">
          <!-- Navigation des étapes -->
          <div v-if="steps.length > 0" class="form-steps-nav">
            <nav class="flex space-x-1 mb-6">
              <button
                v-for="(step, index) in steps"
                :key="step.id"
                @click="setActiveStep(index)"
                class="form-step-tab"
                :class="{
                  'form-step-tab--active': activeStepIndex === index,
                  'form-step-tab--completed': isStepCompleted(index)
                }"
                :disabled="!canNavigateToStep(index)"
              >
                <Icon v-if="step.icon" :name="step.icon" class="w-4 h-4 mr-2" />
                <span class="form-step-number">{{ index + 1 }}</span>
                <span class="form-step-title">{{ step.title }}</span>
                <Icon 
                  v-if="isStepCompleted(index)" 
                  name="i-heroicons-check" 
                  class="w-4 h-4 ml-2 text-green-600" 
                />
              </button>
            </nav>
            
            <!-- Barre de progression -->
            <div class="form-progress-bar">
              <div class="progress-track">
                <div 
                  class="progress-fill"
                  :style="{ width: `${formProgress}%` }"
                ></div>
              </div>
              <span class="progress-text">
                Étape {{ activeStepIndex + 1 }} sur {{ steps.length }}
              </span>
            </div>
          </div>

          <!-- Contenu de l'étape active -->
          <div class="form-builder-content">
            <div v-if="activeStep" class="form-step-content">
              <!-- En-tête de l'étape -->
              <div class="form-step-header">
                <h2 class="form-step-title-large">{{ activeStep.title }}</h2>
                <p v-if="activeStep.description" class="form-step-description">
                  {{ activeStep.description }}
                </p>
              </div>              <!-- Formulaire des champs -->
              <form @submit.prevent="onFormSubmit" class="form-preview-container">
                <!-- Lignes de champs avec même layout qu'en mode edit -->
                <div class="form-fields-container preview-mode">
                  <div v-if="currentStepFields.length === 0" class="form-fields-empty">
                    <Icon name="i-heroicons-document-text" class="w-16 h-16 text-gray-300 mb-4" />
                    <h3 class="text-lg font-medium text-gray-700 mb-2">Aucun champ</h3>
                    <p class="text-gray-500">
                      Cette étape ne contient aucun champ à remplir.
                    </p>
                  </div>

                  <!-- Lignes de champs -->
                  <div v-else class="field-rows">
                    <div 
                      v-for="(row, rowIndex) in intelligentRows" 
                      :key="`preview-row-${rowIndex}`"
                      class="field-row field-row--preview"
                    >
                      <div class="row-fields-container">                        <div
                          v-for="field in row.fields"
                          :key="`preview-${field.id}`"
                          class="field-wrapper"
                          :class="getPreviewFieldClasses(field)"
                          :data-field-width="getEffectiveFieldWidth(field)"
                        >
                          <!-- Utilisation du composant FieldItem pour la cohérence -->
                          <FieldItem
                            :field="field"
                            :value="getFieldValue(field.id)"
                            :error="getFieldError(field.id) || undefined"
                            @input="handleFieldInput(field.id, $event)"
                            @focus="handleFieldFocus(field.id, $event)"
                            @blur="handleFieldBlur(field.id)"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Actions du formulaire -->
                    <div class="form-actions">
                      <div class="form-actions-container">
                        <!-- Bouton précédent -->
                        <button
                          v-if="!isFirstStep"
                          type="button"
                          @click="previousStep"
                          class="btn btn--secondary"
                        >
                          <Icon name="i-heroicons-arrow-left" class="w-4 h-4 mr-2" />
                          Précédent
                        </button>

                        <div class="flex-1"></div>

                        <!-- Bouton suivant ou soumettre -->
                        <button
                          v-if="!isLastStep"
                          type="button"
                          @click="nextStep"
                          :disabled="!isCurrentStepValid"
                          class="btn btn--primary"
                        >
                          Suivant
                          <Icon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
                        </button>

                        <button
                          v-else
                          type="submit"
                          :disabled="!isCurrentStepValid"
                          class="btn btn--primary"
                        >
                          <Icon name="i-heroicons-check" class="w-4 h-4 mr-2" />
                          {{ submitText }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <!-- État sans étape -->
            <div v-else class="form-no-steps">
              <Icon name="i-heroicons-list-bullet" class="w-12 h-12 text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune étape</h3>
              <p class="text-gray-500">Ce formulaire ne contient aucune étape à afficher.</p>
            </div>
          </div>
        </div>      </div>
    </div>

    <!-- Composants PrimeVue pour les services
    <Toast />
    <DynamicDialog /> -->
    
    <!-- Modal d'édition de champ -->
    <!-- Note: Le modal est maintenant géré par DynamicDialog via useFieldEditor -->
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts">
import type { StepFormField, FormStep, FormMode, FormState } from '~/types/form'
import FieldItem from './FieldItem.vue'

import FieldCornerControl from './FieldCornerControl.vue'
import draggable from 'vuedraggable'
import type { PropType } from 'vue'

import FieldEditorModal from './FieldEditorModal.vue'  // Utilisation du nouveau modal
import { primeVueServicesMixin } from '~/composables/usePrimeVueServices'
import { useFormSession } from '~/composables/useFormSession'


interface FieldRow {
  rowIndex: number
  fields: StepFormField[]
  totalWidth: number
  hasSpace: boolean
  maxAdditionalFields: number
}

interface DragStateType {
  isDragging: boolean
  draggedField: StepFormField | null
  draggedFromRow: number
  targetRow: number
  sourceComponent: 'field-list' | 'existing-field' | null
}

interface ResizePreviewType {
  fieldId: string
  widthLabel: string
  widthPercentage: number
  currentWidth?: 'third' | 'half' | 'full'
  startWidth?: 'third' | 'half' | 'full'
  deltaX?: number
  steps?: number
  isResizing?: boolean
}

export default {
  name: 'FormBuilder',
  
  
  components: {
    FieldItem,
    FieldCornerControl,
    draggable
  },
  mixins: [primeVueServicesMixin],  
  props: {
    fields: {
      type: Array as PropType<StepFormField[]>,
      default: () => []
    },
    steps: {
      type: Array as PropType<FormStep[]>,
      default: () => []
    },
    mode: {
      type: String as PropType<FormMode>,
      default: 'edit'
    },
    submitText: {
      type: String,
      default: 'Soumettre'
    }
  },
  emits: [
    'submit',
    'field-update',
    'field-add',
    'field-delete',
    'field-duplicate',
    'step-update',
    'field-resized',
    'field-resize-preview',
    'field-input',
    'field-blur',
    'field-focus'
  ] as const,
  setup() {
    // Utiliser le nouveau composable de session
    const {
      isLoading,
      currentSession,
      currentForm,
      error,
      createNewSession,
      createNewStep,
      addFieldToLocalStorage,
      updateFieldInLocalStorage,
      saveAllToDatabase,
      loadSession,
      clearSession
    } = useFormSession()

    return {
      isLoading,
      currentSession,
      currentForm,
      error,
      createNewSession,
      createNewStep,
      addFieldToLocalStorage,
      updateFieldInLocalStorage,
      saveAllToDatabase,
      loadSession,
      clearSession
    }
  },
  data() {
    return {
      activeStepIndex: 0,
      selectedFieldId: null as string | null,
      activeCornerFieldId: null as string | null,
      resizePreview: null as ResizePreviewType | null,
      showGridOverlay: false,
      smartAlignment: true,
      maxFieldsPerRow: 3,
      isDragging: false,
      emptyDropZone: [] as any[], // Zone de drop temporaire pour l'état vide
      newFieldDropZone: [] as any[], // Zone de drop permanente pour nouveaux champs
      showFieldEditor: false,  // Ajout pour contrôler le modal
      editingField: null as StepFormField | null,  // Champ en cours d'édition
      dragState: {
        isDragging: false,
        draggedField: null,
        draggedFromRow: -1,
        targetRow: -1,
        sourceComponent: null
      } as DragStateType,
      widthValues: {
        'third': 33.33,
        'half': 50,
        'full': 100
      } as const,
      widthLabels: {
        'third': '1/3 - Compact',
        'half': '1/2 - Moyen',
        'full': 'Pleine largeur'
      } as const,
      // État de la session
      sessionInitialized: false,
      autoSaveEnabled: true,
      lastSaveTime: null,
      hasUnsavedChanges: false
    }
  },

  computed: {
    formState(): FormState {
      return (this as any).$store?.state?.form?.state || {}
    },

    activeStep(): FormStep | null {
      return this.steps[this.activeStepIndex] || null
    },

    currentStepFields(): StepFormField[] {
      if (!this.activeStep) return []
      return this.fields
        .filter((field: StepFormField) => field.stepId === this.activeStep!.id)
        .sort((a: StepFormField, b: StepFormField) => (a.order || 0) - (b.order || 0))
    },

    formProgress(): number {
      if (this.steps.length === 0) return 0
      return ((this.activeStepIndex + 1) / this.steps.length) * 100
    },

    isFirstStep(): boolean {
      return this.activeStepIndex === 0
    },

    isLastStep(): boolean {
      return this.activeStepIndex === this.steps.length - 1
    },

    isCurrentStepValid(): boolean {
      const stepFields = this.currentStepFields
      for (const field of stepFields) {
        if (this.getFieldError(field.id)) {
          return false
        }
        if (field.validation?.required && !this.getFieldValue(field.id)) {
          return false
        }
      }
      return true
    },

    // Système de lignes intelligentes
    intelligentRows(): FieldRow[] {
      const rows: FieldRow[] = []

      let currentRow: StepFormField[] = []
      let currentRowWidth = 0
      let rowIndex = 0

      for (const field of this.currentStepFields) {
        const fieldWidth = this.getFieldWidthValue(field)
        
        // Vérifier si le champ peut tenir dans la ligne actuelle
        if (currentRowWidth + fieldWidth <= 100 && currentRow.length < this.maxFieldsPerRow) {
          currentRow.push(field)
          currentRowWidth += fieldWidth
        } else {
          // Finaliser la ligne actuelle si elle contient des champs
          if (currentRow.length > 0) {
            rows.push({
              rowIndex,
              fields: [...currentRow],
              totalWidth: currentRowWidth,
              hasSpace: currentRowWidth < 100,
              maxAdditionalFields: this.calculateMaxAdditionalFields(currentRowWidth)
            })
            rowIndex++
          }
          
          // Commencer une nouvelle ligne
          currentRow = [field]
          currentRowWidth = fieldWidth
        }
      }
      
      // Ajouter la dernière ligne si elle contient des champs
      if (currentRow.length > 0) {
        rows.push({
          rowIndex,
          fields: [...currentRow],
          totalWidth: currentRowWidth,
          hasSpace: currentRowWidth < 100,
          maxAdditionalFields: this.calculateMaxAdditionalFields(currentRowWidth)
        })
      }
        return rows
    },

    currentFormId(): string {
      return this.activeStep?.formId || 'default-form'
    }
  },

  watch: {
    steps: {
      handler(newSteps: FormStep[]) {
        // Ajuster l'index de l'étape active si nécessaire
        if (this.activeStepIndex >= newSteps.length) {
          this.activeStepIndex = Math.max(0, newSteps.length - 1)
        }
      },
      immediate: true
    },

    selectedFieldId(newId: string | null, oldId: string | null) {
      // Nettoyer l'état de redimensionnement quand on change de sélection
      if (oldId !== newId) {
        this.activeCornerFieldId = null
        this.resizePreview = null
      }
    },

    // Watch emptyDropZone for changes
    emptyDropZone: {
      handler(newValue: any[], oldValue: any[]) {
        console.log('emptyDropZone changed from:', oldValue, 'to:', newValue) // Debug log
        if (newValue.length > 0 && (!oldValue || oldValue.length === 0)) {
          console.log('New item detected in emptyDropZone:', newValue[newValue.length - 1]) // Debug log
        }
      },
      deep: true
    },

    // Watch newFieldDropZone for changes
    newFieldDropZone: {
      handler(newValue: any[], oldValue: any[]) {
        console.log('newFieldDropZone changed from:', oldValue, 'to:', newValue) // Debug log
        if (newValue.length > 0 && (!oldValue || oldValue.length === 0)) {
          console.log('New item detected in newFieldDropZone:', newValue[newValue.length - 1]) // Debug log
        }
      },
      deep: true
    }
  },

  async mounted() {
    console.log('🔧 FormBuilder monté - Initialisation de la session...')
    
    try {
      // Vérifier s'il y a une session existante
      const existingSession = this.loadSession()
      
      if (existingSession && existingSession.formId) {
        console.log('📂 Session existante trouvée:', existingSession.formId)
        this.sessionInitialized = true
        await this.loadExistingSession(existingSession)
      } else {
        console.log('🆕 Création d\'une nouvelle session...')
        await this.initializeNewSession()
      }
    } catch (error) {
      console.error('❌ Erreur initialisation session:', error)
      this.showError('Erreur lors de l\'initialisation de la session')
    }
  },

  methods: {
    /**
     * Initialiser une nouvelle session avec création en BD
     */
    async initializeNewSession() {
      try {
        const result = await this.createNewSession('Mon nouveau formulaire')
        
        // Mettre à jour les données locales
        this.activeFormId = result.formId
        this.sessionInitialized = true
        this.hasUnsavedChanges = false
        
        // Charger les données depuis le localStorage
        await this.loadFormDataFromLocalStorage(result.formId)
        
        console.log('✅ Nouvelle session initialisée avec succès')
      } catch (error) {
        console.error('❌ Erreur nouvelle session:', error)
        throw error
      }
    },

    /**
     * Charger une session existante
     */
    async loadExistingSession(session) {
      try {
        this.activeFormId = session.formId
        this.sessionInitialized = true
        
        // Charger les données depuis le localStorage
        await this.loadFormDataFromLocalStorage(session.formId)
        
        console.log('✅ Session existante chargée avec succès')
      } catch (error) {
        console.error('❌ Erreur chargement session:', error)
        throw error
      }
    },

    /**
     * Charger les données du formulaire depuis localStorage
     */
    async loadFormDataFromLocalStorage(formId) {
      try {
        // Charger les étapes depuis localStorage
        const stepsData = localStorage.getItem(`working_steps_${formId}`)
        if (stepsData) {
          this.steps = JSON.parse(stepsData)
        }

        // Charger les champs depuis localStorage  
        const fieldsData = localStorage.getItem(`working_fields_${formId}`)
        if (fieldsData) {
          this.fields = JSON.parse(fieldsData)
        }

        // Charger la configuration du formulaire
        const configData = localStorage.getItem(`working_form_${formId}`)
        if (configData) {
          const config = JSON.parse(configData)
          this.formTitle = config.title || 'Mon formulaire'
        }

        console.log('📥 Données chargées depuis localStorage:', {
          steps: this.steps.length,
          fields: this.fields.length
        })
      } catch (error) {
        console.error('❌ Erreur chargement localStorage:', error)
      }
    },

    /**
     * Créer une nouvelle étape en BD
     */
    async addStep() {
      if (!this.sessionInitialized || !this.activeFormId) {
        this.showError('Session non initialisée')
        return
      }

      try {
        const stepData = {
          title: `Étape ${this.steps.length + 1}`,
          description: 'Nouvelle étape du formulaire',
          icon: 'i-heroicons-document-text'
        }

        const newStep = await this.createNewStep(this.activeFormId, stepData)
        
        // Mettre à jour les données locales
        this.steps.push(newStep)
        this.hasUnsavedChanges = false // L'étape est directement en BD
        
        console.log('✅ Nouvelle étape créée:', newStep.id)
        this.showSuccess(`Étape "${newStep.title}" créée avec succès`)
      } catch (error) {
        console.error('❌ Erreur création étape:', error)
        this.showError('Erreur lors de la création de l\'étape')
      }
    },

    /**
     * Ajouter un champ en localStorage seulement
     */
    onFieldAdded(newField) {
      if (!this.sessionInitialized || !this.activeFormId) {
        this.showError('Session non initialisée')
        return
      }

      try {
        // S'assurer que le champ a un stepId valide
        if (!newField.stepId && this.activeStep) {
          newField.stepId = this.activeStep.id
        }

        // Ajouter en localStorage avec un ID temporaire
        const addedField = this.addFieldToLocalStorage(this.activeFormId, newField)
        
        // Mettre à jour les données locales
        this.fields.push(addedField)
        this.hasUnsavedChanges = true
        
        console.log('📝 Champ ajouté en localStorage:', addedField.id)
        
        // Auto-save activé par défaut
        if (this.autoSaveEnabled) {
          this.autoSaveToLocalStorage()
        }
      } catch (error) {
        console.error('❌ Erreur ajout champ:', error)
        this.showError('Erreur lors de l\'ajout du champ')
      }
    },

    /**
     * Modifier un champ en localStorage
     */
    onFieldUpdated(fieldId, updates) {
      if (!this.sessionInitialized || !this.activeFormId) {
        return
      }

      try {
        // Mettre à jour en localStorage
        this.updateFieldInLocalStorage(this.activeFormId, fieldId, updates)
        
        // Mettre à jour les données locales
        const fieldIndex = this.fields.findIndex(f => f.id === fieldId)
        if (fieldIndex !== -1) {
          this.fields[fieldIndex] = { ...this.fields[fieldIndex], ...updates }
        }
        
        this.hasUnsavedChanges = true
        
        console.log('📝 Champ modifié en localStorage:', fieldId)
        
        // Auto-save
        if (this.autoSaveEnabled) {
          this.autoSaveToLocalStorage()
        }
      } catch (error) {
        console.error('❌ Erreur modification champ:', error)
      }
    },

    /**
     * Sauvegarder tout en base de données
     */
    async saveToDatabase() {
      if (!this.sessionInitialized || !this.activeFormId) {
        this.showError('Session non initialisée')
        return
      }

      if (!this.hasUnsavedChanges) {
        this.showInfo('Aucune modification à sauvegarder')
        return
      }

      try {
        console.log('💾 Sauvegarde en base de données...')
        
        await this.saveAllToDatabase(this.activeFormId)
        
        this.hasUnsavedChanges = false
        this.lastSaveTime = new Date()
        
        console.log('✅ Sauvegarde en BD terminée avec succès')
        this.showSuccess('Formulaire sauvegardé avec succès !')
        
      } catch (error) {
        console.error('❌ Erreur sauvegarde BD:', error)
        this.showError('Erreur lors de la sauvegarde en base de données')
      }
    },

    /**
     * Auto-save en localStorage
     */
    autoSaveToLocalStorage() {
      if (!this.autoSaveEnabled || !this.activeFormId) return

      try {
        // Sauvegarder les champs et étapes actuels
        localStorage.setItem(`working_fields_${this.activeFormId}`, JSON.stringify(this.fields))
        localStorage.setItem(`working_steps_${this.activeFormId}`, JSON.stringify(this.steps))
        
        console.log('💾 Auto-save localStorage effectué')
      } catch (error) {
        console.error('❌ Erreur auto-save:', error)
      }
    },

    /**
     * Nettoyer la session
     */
    async clearCurrentSession() {
      try {
        this.clearSession()
        this.sessionInitialized = false
        this.activeFormId = null
        this.hasUnsavedChanges = false
        this.fields = []
        this.steps = []
        
        console.log('🧹 Session nettoyée')
        this.showInfo('Session terminée')
      } catch (error) {
        console.error('❌ Erreur nettoyage session:', error)
      }
    },

    // === GESTION DES ÉTAPES ===
    setActiveStep(index: number): void {
      if (index >= 0 && index < this.steps.length) {
        this.activeStepIndex = index
        this.clearSelection()
      }
    },

    isStepCompleted(stepIndex: number): boolean {
      return stepIndex < this.activeStepIndex
    },

    clearSelection(): void {
      this.selectedFieldId = null
      this.activeCornerFieldId = null
      this.resizePreview = null
    },

    // === GESTION DES CHAMPS ===
    /**
     * Ajouter un nouveau champ depuis FieldList
     */
    onAddField(fieldTemplate: Partial<StepFormField>): void {
      if (!this.activeStep) return
      
      const newField: StepFormField = {
        id: this.generateFieldId(),
        formId: this.currentFormId,
        name: fieldTemplate.name || `field_${Date.now()}`,
        label: fieldTemplate.label || 'Nouveau champ',
        type: fieldTemplate.type || 'text',
        stepId: this.activeStep.id,
        order: this.getNextFieldOrder(),
        width: fieldTemplate.width || 'full',
        validation: {
          required: fieldTemplate.validation?.required || false,
          ...fieldTemplate.validation
        },
        placeholder: fieldTemplate.placeholder,
        helpText: fieldTemplate.helpText,
        defaultValue: fieldTemplate.defaultValue,
        disabled: fieldTemplate.disabled || false,
        readonly: fieldTemplate.readonly || false,
        options: fieldTemplate.options || []
      }      // Ajouter le champ à la liste
      const updatedFields = [...this.fields, newField]
      this.$emit('field-add', newField)
      this.$emit('field-update', updatedFields)
      
      // Sélectionner le nouveau champ
      this.selectedFieldId = newField.id      // Notification de succès
      this.showToast('success', 'Nouveau champ', `"${newField.label}" a été ajouté au formulaire`)    },

    /**
     * Sélectionner un champ
     */
    selectField(fieldId: string): void {
      this.selectedFieldId = fieldId
    },/**
     * Éditer un champ (double-clic ou bouton)
     */    editField(fieldId: string): void {
      console.log('=== DEBUT editField ===')
      const field = this.fields.find((f: StepFormField) => f.id === fieldId)
      console.log('Field trouvé:', field)
      
      if (!field) {
        console.error('Champ non trouvé')
        return
      }
      
      console.log('Tentative d\'ouverture du dialog...')
        try {        // Utilisation du nouveau FieldEditorModal
        this.$dialog.open(FieldEditorModal, {
          props: {
            header: `Éditer le champ : ${field.label}`,
            style: {
              width: '90vw',
              maxWidth: '800px'
            },
            breakpoints: {
              '960px': '95vw',
              '640px': '100vw'
            },
            modal: true,
            closable: true,
            draggable: false,
            resizable: false
          },
          data: {
            field: { ...field },
            mode: 'edit'
          },
          onClose: (options: any) => {
            console.log('Dialog fermé avec options:', options)
            const data = options?.data
            if (data) {
              console.log('Données reçues:', data)
              this.handleFieldSaved(data)
            }
          }
        })
        console.log('FieldEditorModal.open appelé avec succès (Option API)')
      } catch (error) {
        console.error('Erreur lors de l\'ouverture:', error)
      }
    },/**
     * Gérer la sauvegarde d'un champ modifié
     */
    handleFieldSaved(updatedField: StepFormField): void {
      if (!updatedField) return
      
      const fieldIndex = this.fields.findIndex((f: StepFormField) => f.id === updatedField.id)
      
      if (fieldIndex !== -1) {
        const updatedFields = [...this.fields]
        updatedFields[fieldIndex] = updatedField
        this.$emit('field-update', updatedFields)
        
        // Notification de succès
        this.showToast('success', 'Succès', `Le champ "${updatedField.label}" a été mis à jour`)
      }
    },

    // /**
    //  * Ouvrir l'éditeur de champ (méthode publique pour compatibilité)
    //  */
    // async openFieldEditor(fieldId: string): Promise<void> {
    //   await this.editField(fieldId)
    // },

    /**
     * Obtenir le libellé d'un type de champ
     */
    getFieldTypeLabel(type: string): string {
      const labels: Record<string, string> = {
        text: 'Texte',
        email: 'Email',
        password: 'Mot de passe',
        number: 'Nombre',
        tel: 'Téléphone',
        url: 'URL',
        textarea: 'Zone de texte',
        select: 'Liste déroulante',
        multiselect: 'Liste multiple',
        radio: 'Boutons radio',
        checkbox: 'Cases à cocher',
        file: 'Fichier',
        date: 'Date',
        'datetime-local': 'Date et heure',
        range: 'Plage',
        switch: 'Interrupteur'
      }
      return labels[type] || type
    },    /**
     * Supprimer un champ
     */
    async deleteField(fieldId: string): Promise<void> {
      const field = this.fields.find((f: StepFormField) => f.id === fieldId)
      const fieldLabel = field?.label || 'le champ'
      
      const updatedFields = this.fields.filter((f: StepFormField) => f.id !== fieldId)
      this.$emit('field-delete', fieldId)
      this.$emit('field-update', updatedFields)
      
      if (this.selectedFieldId === fieldId) {
        this.clearSelection()
      }      // Notification de succès
      this.showToast('info', 'Suppression', `${fieldLabel} a été supprimé`)
    },

    /**
     * Dupliquer un champ
     */
    async duplicateField(fieldId: string): Promise<void> {
      const originalField = this.fields.find((f: StepFormField) => f.id === fieldId)
      if (!originalField) return

      const duplicatedField: StepFormField = {
        ...originalField,
        id: this.generateFieldId(),
        name: `${originalField.name}_copy`,
        label: `${originalField.label} (copie)`,
        order: this.getNextFieldOrder()
      }

      const updatedFields = [...this.fields, duplicatedField]
      this.$emit('field-duplicate', duplicatedField)
      this.$emit('field-update', updatedFields)
      
      this.selectedFieldId = duplicatedField.id

      // Notification de succès
      this.showToast('success', 'Duplication', `"${duplicatedField.label}" a été créé`)
    },

    // === UTILITAIRES ===
    generateFieldId(): string {
      return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    getNextFieldOrder(): number {
      const maxOrder = Math.max(...this.currentStepFields.map((f: StepFormField) => f.order || 0), 0)
      return maxOrder + 1
    },

    getFieldWidthValue(field: StepFormField): number {
      const width = field.width || 'full'
      return this.widthValues[width as keyof typeof this.widthValues]
    },

    getEffectiveFieldWidth(field: StepFormField): 'full' | 'half' | 'third' {
      return field.width || 'full'
    },

    getFieldClasses(field: StepFormField) {
      return [
        'field-item',
        `field-width--${this.getEffectiveFieldWidth(field)}`,
        {
          'field-selected': this.selectedFieldId === field.id,
          'field-corner-active': this.activeCornerFieldId === field.id,
          'field-resizing': this.resizePreview?.fieldId === field.id,
          'field-affected': this.isFieldAffectedByResize(field)
        }
      ]
    },    isFieldAffectedByResize(field: StepFormField): boolean {
      if (!this.resizePreview || !this.resizePreview.isResizing) return false
      
      // Le champ en cours de redimensionnement n'est pas "affecté" mais "actif"
      if (this.resizePreview.fieldId === field.id) return false
      
      const resizingFieldIndex = this.currentStepFields.findIndex((f: StepFormField) => f.id === this.resizePreview!.fieldId)
      const currentFieldIndex = this.currentStepFields.findIndex((f: StepFormField) => f.id === field.id)
      
      // Calculer la distance et l'impact potentiel
      const distance = Math.abs(resizingFieldIndex - currentFieldIndex)
      
      // Les champs dans la même ligne ou les lignes adjacentes sont affectés
      return distance <= 2 && distance > 0
    },

    getPreviewWidth(field: StepFormField): 'full' | 'half' | 'third' | null {
      if (this.resizePreview?.fieldId === field.id && this.resizePreview.currentWidth) {
        return this.resizePreview.currentWidth
      }
      return null
    },

    calculateMaxAdditionalFields(currentRowWidth: number): number {
      const remainingWidth = 100 - currentRowWidth
      const minFieldWidth = 33
      return Math.floor(remainingWidth / minFieldWidth)
    },

    canRowAcceptDraggedField(row: FieldRow): boolean {
      if (!this.dragState.draggedField) return false
      
      const draggedFieldWidth = this.getFieldWidthValue(this.dragState.draggedField)
      const availableSpace = 100 - row.totalWidth
      
      return draggedFieldWidth <= availableSpace || this.smartAlignment
    },

    // === INTERFACE UTILISATEUR ===
    toggleGridOverlay(): void {
      this.showGridOverlay = !this.showGridOverlay
    },

    toggleSmartAlignment(): void {
      this.smartAlignment = !this.smartAlignment
    },

    // === DRAG & DROP ===
    onDropInRow(rowIndex: number, position: 'start' | 'end' | 'between', fieldIndex?: number): void {
      if (this.dragState.draggedField) {
        // Logique de drop dans une ligne spécifique
        this.smartRepositionField(
          this.dragState.draggedField.id,
          rowIndex,
          position,
          fieldIndex
        )
      }
    },

    onDropNewRow(): void {
      if (this.dragState.draggedField) {
        // Créer une nouvelle ligne avec le champ
        const newRowIndex = this.intelligentRows.length
        this.smartRepositionField(
          this.dragState.draggedField.id,
          newRowIndex,
          'start'
        )
      }
    },    onFieldDragStart(event: any): void {
      this.isDragging = true
      this.dragState.isDragging = true
      // Ajouter une classe au body pour indiquer le drag
      document.body.classList.add('is-dragging')
      
      // Accès sécurisé aux données de l'élément draggé
      const draggedElement = event.item?.__vue__?.$data || event.item?.element || event.item?._underlying_vm_
      if (draggedElement) {
        this.dragState.draggedField = draggedElement
      }
      this.dragState.sourceComponent = 'existing-field'
    },

    onFieldDragEnd(): void {
      this.isDragging = false
      this.dragState.isDragging = false
      this.dragState.draggedField = null
      this.dragState.sourceComponent = null
      // Retirer la classe du body
      document.body.classList.remove('is-dragging')
    },

    /**
     * Gérer l'ajout d'un champ via drag & drop depuis FieldList
     */
    onFieldAdded(event: any): void {
      console.log('onFieldAdded called with event:', event)
      if (event.added) {
        const newFieldTemplate = event.added.element
        console.log('Adding new field from template:', newFieldTemplate)
        
        // Vérifier si c'est un template (pas encore un champ complet)
        if (newFieldTemplate.type && !newFieldTemplate.id) {
          try {
            const newField = this.createFieldFromTemplate(newFieldTemplate)
            console.log('Created new field from template in row:', newField)
            
            // Le champ a déjà été ajouté à la ligne par vuedraggable
            // Il faut juste mettre à jour l'ordre des champs
            this.updateFieldsFromRows()
            
            // Sélectionner le nouveau champ
            this.selectedFieldId = newField.id
            
            // Émettre les événements
            this.$emit('field-add', newField)
            
            console.log('Field successfully added to row') // Debug log
          } catch (error) {
            console.error('Error creating field from template in row:', error)
          }
        } else {
          // C'est déjà un champ complet, juste mettre à jour l'ordre
          console.log('Moving existing field:', newFieldTemplate)
          this.updateFieldsFromRows()
        }
      }
    },

    /**
     * Gérer les changements dans une ligne de champs
     */
    onRowFieldsChange(rowIndex: number, event: any): void {
      console.log('onRowFieldsChange called for row', rowIndex, 'with event:', event)
      
      // Mettre à jour les champs depuis les lignes
      this.updateFieldsFromRows()
    },

    /**
     * Mettre à jour les champs depuis les lignes intelligentes
     */
    updateFieldsFromRows(): void {
      const allFields: StepFormField[] = []
      let order = 0
      
      for (const row of this.intelligentRows) {
        for (const field of row.fields) {
          field.order = order++
          allFields.push(field)
        }
      }
      
      this.$emit('field-update', allFields)
    },

    /**
     * Handle field added to empty zone
     */
    onFieldAddedToEmpty(event: any): void {
      console.log('=== onFieldAddedToEmpty START ===') // Debug log
      console.log('Event:', event) // Debug log
      
      // Check for different event structures
      let addedElement = null
      
      if (event.added) {
        addedElement = event.added.element
        console.log('Found event.added.element:', addedElement) // Debug log
      } else if (event instanceof CustomEvent && event.detail) {
        if (event.detail.added) {
          addedElement = event.detail.added.element
          console.log('Found CustomEvent detail.added.element:', addedElement) // Debug log
        } else if (event.detail.element) {
          addedElement = event.detail.element
          console.log('Found CustomEvent detail.element:', addedElement) // Debug log
        }
      }
      
      if (addedElement && addedElement.type && !addedElement.id) {
        try {
          const newField = this.createFieldFromTemplate(addedElement)
          console.log('Created new field:', newField) // Debug log
          
          // Ajouter le champ à la liste principale
          this.$emit('field-add', newField)
          this.$emit('field-update', [newField])
          
          // Sélectionner le nouveau champ
          this.selectedFieldId = newField.id
          
          // Vider la zone de drop temporaire
          this.emptyDropZone = []
          
          console.log('Field successfully added to form') // Debug log
        } catch (error) {
          console.error('Error creating field from template:', error)
        }
      }
      console.log('=== onFieldAddedToEmpty END ===') // Debug log
    },

    /**
     * Handle empty zone model change (backup handler)
     */
    onEmptyZoneChange(event: any): void {
      console.log('onEmptyZoneChange called with event:', event) // Debug log
      
      // Check if new items were added
      if (this.emptyDropZone.length > 0) {
        console.log('Items in empty drop zone:', this.emptyDropZone) // Debug log
        
        // Process the last added item
        const latestItem = this.emptyDropZone[this.emptyDropZone.length - 1]
        console.log('Processing latest item from change event:', latestItem) // Debug log
        
        if (latestItem && latestItem.type && !latestItem.id) {
          try {
            const newField = this.createFieldFromTemplate(latestItem)
            console.log('Created new field from change event:', newField) // Debug log
            
            // Ajouter le champ à la liste principale
            this.$emit('field-add', newField)
            this.$emit('field-update', [newField])
            
            // Sélectionner le nouveau champ
            this.selectedFieldId = newField.id
            
            // Vider la zone de drop temporaire
            this.emptyDropZone = []
            
            console.log('Field successfully added from change event') // Debug log
          } catch (error) {
            console.error('Error creating field from template in change event:', error)
          }
        }
      }
    },

    /**
     * Handle field dropped in new field zone
     */
    onNewFieldDropped(event: any): void {
      console.log('=== onNewFieldDropped START ===') // Debug log
      console.log('Event:', event) // Debug log
      
      // Check for different event structures
      let addedElement = null
      
      if (event.added) {
        addedElement = event.added.element
        console.log('Found event.added.element:', addedElement) // Debug log
      } else if (event.element) {
        addedElement = event.element
        console.log('Found event.element:', addedElement) // Debug log
      } else if (event instanceof CustomEvent && event.detail) {
        if (event.detail.added) {
          addedElement = event.detail.added.element
          console.log('Found CustomEvent detail.added.element:', addedElement) // Debug log
        } else if (event.detail.element) {
          addedElement = event.detail.element
          console.log('Found CustomEvent detail.element:', addedElement) // Debug log
        }
      }
      
      if (addedElement && addedElement.type && !addedElement.id) {
        try {
          const newField = this.createFieldFromTemplate(addedElement)
          console.log('Created new field from permanent drop zone:', newField) // Debug log
          
          // Ajouter le champ à la fin de la liste
          const updatedFields = [...this.fields, newField]
          this.$emit('field-add', newField)
          this.$emit('field-update', updatedFields)
          
          // Sélectionner le nouveau champ
          this.selectedFieldId = newField.id
          
          // Vider la zone de drop temporaire
          this.newFieldDropZone = []
          
          console.log('Field successfully added to new line') // Debug log
        } catch (error) {
          console.error('Error creating field from template in permanent zone:', error)
        }
      }
      console.log('=== onNewFieldDropped END ===') // Debug log
    },

    /**
     * Handle new field zone model change
     */
    onNewFieldChange(event: any): void {
      console.log('onNewFieldChange called with event:', event) // Debug log
      
      // Check if new items were added
      if (this.newFieldDropZone.length > 0) {
        console.log('Items in new field drop zone:', this.newFieldDropZone) // Debug log
        
        // Process the last added item
        const latestItem = this.newFieldDropZone[this.newFieldDropZone.length - 1]
        console.log('Processing latest item from new field change event:', latestItem) // Debug log
        
        if (latestItem && latestItem.type && !latestItem.id) {
          try {
            const newField = this.createFieldFromTemplate(latestItem)
            console.log('Created new field from new field change event:', newField) // Debug log
            
            // Ajouter le champ à la fin de la liste
            const updatedFields = [...this.fields, newField]
            this.$emit('field-add', newField)
            this.$emit('field-update', updatedFields)
            
            // Sélectionner le nouveau champ
            this.selectedFieldId = newField.id
            
            // Vider la zone de drop temporaire
            this.newFieldDropZone = []
            
            console.log('Field successfully added from new field change event') // Debug log
          } catch (error) {
            console.error('Error creating field from template in new field change event:', error)
          }
        }
      }
    },

    /**
     * Create a complete StepFormField from a FieldTemplate
     */
    createFieldFromTemplate(template: any): StepFormField {
      if (!this.activeStep) {
        throw new Error('No active step available')
      }
      
      return {
        id: this.generateFieldId(),
        formId: this.currentFormId,
        stepId: this.activeStep.id,
        type: template.type,
        name: template.name || `field_${Date.now()}`,
        label: template.label,
        placeholder: template.defaultProps?.placeholder || '',
        helpText: template.defaultProps?.helpText || '',
        defaultValue: template.defaultProps?.defaultValue,
        validation: template.defaultProps?.validation || { required: false },
        options: template.defaultProps?.options || [],
        order: this.getNextFieldOrder(),
        width: 'full',
        disabled: false,
        readonly: false
      }
    },

    smartRepositionField(fieldId: string, targetRowIndex: number, position: string, fieldIndex?: number): void {
      // Logique de repositionnement intelligent
      const updatedFields = [...this.currentStepFields]
      const sourceIndex = updatedFields.findIndex((f: StepFormField) => f.id === fieldId)
      
      if (sourceIndex !== -1) {
        const field = updatedFields.splice(sourceIndex, 1)[0]
        
        // Calculer la nouvelle position
        let insertIndex = 0
        if (position === 'end') {
          insertIndex = updatedFields.length
        } else if (position === 'between' && fieldIndex !== undefined) {
          insertIndex = fieldIndex + 1
        }
        
        updatedFields.splice(insertIndex, 0, field)
        this.updateFieldsOrder(updatedFields)
      }
    },    // === REDIMENSIONNEMENT ===
    onFieldResizeStart(data: any): void {
      this.activeCornerFieldId = data.field.id
      const width = (data.field.width || 'full') as 'third' | 'half' | 'full'
      const startWidth = (data.startWidth || data.field.width || 'full') as 'third' | 'half' | 'full'
      
      this.resizePreview = {
        fieldId: data.field.id,
        widthLabel: this.widthLabels[width],
        widthPercentage: this.widthValues[width],
        currentWidth: width,
        startWidth: startWidth,
        deltaX: 0,
        steps: 0,
        isResizing: true
      }
      this.showGridOverlay = true
      
      console.log('🎯 Début du redimensionnement:', {
        field: data.field.name,
        startWidth: startWidth,
        currentWidth: width
      })
    },    onFieldResize(data: any): void {
      if (data.field && data.width) {
        const width = data.width as 'third' | 'half' | 'full'
        const startWidth = (this.resizePreview?.startWidth || data.field.width || 'full') as 'third' | 'half' | 'full'
        const deltaX = data.deltaX || 0
        const steps = data.steps || 0
        
        this.resizePreview = {
          fieldId: data.field.id,
          widthLabel: this.widthLabels[width],
          widthPercentage: this.widthValues[width],
          currentWidth: width,
          startWidth: startWidth,
          deltaX: deltaX,
          steps: steps,
          isResizing: true
        }
        
        // Forcer la réactivité Vue pour les changements en temps réel
        this.$forceUpdate()

        this.$emit('field-resize-preview', {
          field: data.field,
          width: data.width,
          widthLabel: this.widthLabels[width],
          widthPercentage: this.widthValues[width],
          deltaX: deltaX,
          steps: steps,
          startWidth: startWidth
        })
        
        console.log('📏 Redimensionnement en cours:', {
          field: data.field.name,
          fromWidth: startWidth,
          toWidth: width,
          deltaX: deltaX,
          steps: steps
        })
      }
    },    onFieldResizeEnd(data: any): void {
      const finalWidth = data.width || this.resizePreview?.currentWidth
      
      if (this.resizePreview && data.field && finalWidth) {
        console.log('✅ Fin du redimensionnement:', {
          field: data.field.name,
          startWidth: this.resizePreview.startWidth,
          finalWidth: finalWidth,
          totalSteps: this.resizePreview.steps,
          totalDeltaX: this.resizePreview.deltaX
        })
        
        // Appliquer le nouveau width
        const updatedField = { ...data.field, width: finalWidth }
        const fieldIndex = this.fields.findIndex((f: StepFormField) => f.id === data.field.id)
        
        if (fieldIndex !== -1) {
          const updatedFields = [...this.fields]
          updatedFields[fieldIndex] = updatedField
          this.$emit('field-update', updatedFields)
          
          this.$emit('field-resized', {
            field: data.field,
            oldWidth: this.resizePreview.startWidth || data.field.width,
            newWidth: finalWidth,
            deltaX: this.resizePreview.deltaX,
            steps: this.resizePreview.steps
          })
        }
      }
      
      this.activeCornerFieldId = null
      this.resizePreview = null
      this.showGridOverlay = false
      
      // Forcer la réactivité Vue après redimensionnement
      this.$forceUpdate()
    },

    // === GESTION DES DONNÉES ===
    updateFieldsOrder(reorderedFields: StepFormField[]): void {
      const fieldsWithOrder = reorderedFields.map((field: StepFormField, index: number) => ({
        ...field,
        order: index
      }))
      
      this.$emit('field-update', fieldsWithOrder)
    },

    getFieldValue(fieldId: string): any {
      return this.formState?.data?.[fieldId] || ''
    },

    getFieldError(fieldId: string): string | null {
      const error = this.formState?.errors?.[fieldId]
      if (Array.isArray(error)) {
        return error.length > 0 ? error[0] : null
      }
      return error || null
    },

    onFieldInput(fieldId: string, value: any): void {
      this.$emit('field-input', { fieldId, value })
    },

    onFieldBlur(fieldId: string): void {
      this.$emit('field-blur', { fieldId })
    },    // === HANDLERS POUR LES ÉVÉNEMENTS ===
    handleFieldInput(fieldId: string, eventOrValue: Event | any): void {
      let value: any
      
      if (eventOrValue && typeof eventOrValue === 'object' && 'target' in eventOrValue) {
        // C'est un événement
        const target = eventOrValue.target as HTMLInputElement
        value = target.value
      } else {
        // C'est une valeur directe
        value = eventOrValue
      }
      
      // Mettre à jour la valeur
      this.onFieldInput(fieldId, value)
      
      // Émettre l'événement pour les parents
      this.$emit('field-input', { fieldId, value })
      
      // Valider le champ si nécessaire
      this.validateField(fieldId, value)
    },

    handleFieldChange(fieldId: string, event: Event): void {
      const target = event.target as HTMLInputElement
      this.onFieldInput(fieldId, target.value)
    },

    handleFieldBlur(fieldId: string): void {
      this.onFieldBlur(fieldId)
    },

    // Méthodes manquantes pour la gestion des événements de formulaire
    handleFileChange(fieldId: string, event: Event): void {
      const target = event.target as HTMLInputElement
      const files = target.files
      if (files) {
        const fileArray = Array.from(files)
        this.onFieldInput(fieldId, fileArray)
      }
    },

    handleCheckboxChange(fieldId: string, optionValue: string, event: Event): void {
      const target = event.target as HTMLInputElement
      const currentValue = this.getFieldValue(fieldId) || []
      let newValue: string[]
      
      if (target.checked) {
        newValue = [...currentValue, optionValue]
      } else {
        newValue = currentValue.filter((value: string) => value !== optionValue)
      }
      
      this.onFieldInput(fieldId, newValue)
    },

    handleSingleCheckboxChange(fieldId: string, event: Event): void {
      const target = event.target as HTMLInputElement
      this.onFieldInput(fieldId, target.checked)
    },

    // Méthodes de navigation pour le mode preview
    canNavigateToStep(stepIndex: number): boolean {
      // Permettre la navigation vers les étapes précédentes ou la suivante si valide
      return stepIndex <= this.activeStepIndex || 
             (stepIndex === this.activeStepIndex + 1 && this.isCurrentStepValid)
    },

    previousStep(): void {
      if (!this.isFirstStep) {
        this.setActiveStep(this.activeStepIndex - 1)
      }
    },

    nextStep(): void {
      if (!this.isLastStep && this.isCurrentStepValid) {
        this.setActiveStep(this.activeStepIndex + 1)
      }
    },

    onFormSubmit(): void {
      if (this.isCurrentStepValid) {
        const formData = this.collectFormData()
        this.$emit('submit', formData)
      }
    },

    collectFormData(): Record<string, any> {
      const data: Record<string, any> = {}
      
      for (const field of this.fields) {
        const value = this.getFieldValue(field.id)
        if (value !== undefined && value !== null && value !== '') {
          data[field.name] = value
        }
      }
      
      return data
    },

    // === GESTION DU DÉFILEMENT ===
    
    /**
     * Initialiser la gestion des indicateurs de défilement
     */
    initScrollIndicators(): void {
      this.$nextTick(() => {
        const container = this.$el.querySelector('.intelligent-rows-container')
        if (container) {
          this.updateScrollIndicators(container)
          container.addEventListener('scroll', () => this.updateScrollIndicators(container))
        }
      })
    },    /**
     * Mettre à jour les indicateurs de défilement
     */
    updateScrollIndicators(container: Element): void {
      const hasScroll = container.scrollHeight > container.clientHeight
      
      if (hasScroll) {
        container.classList.add('has-scroll')
      } else {
        container.classList.remove('has-scroll')
      }
    },    /**
     * Obtenir les classes CSS pour les champs en mode preview
     */
    getPreviewFieldClasses(field: StepFormField): (string | Record<string, boolean>)[] {
      const classes: (string | Record<string, boolean>)[] = [
        'field-item',
        `field-width--${this.getEffectiveFieldWidth(field)}`
      ]
      
      const conditionalClasses: Record<string, boolean> = {}
      const error = this.getFieldError(field.id)
      if (error) {
        conditionalClasses['field-error'] = true
      }
      if (field.disabled) {
        conditionalClasses['field-disabled'] = true
      }
      if (field.readonly) {
        conditionalClasses['field-readonly'] = true
      }
      
      if (Object.keys(conditionalClasses).length > 0) {
        classes.push(conditionalClasses)
      }
      
      return classes
    },    /**
     * Gérer le focus sur un champ en mode preview
     */
    handleFieldFocus(fieldId: string, event: Event): void {
      this.$emit('field-focus', { fieldId, event })
    },

    /**
     * Valider un champ spécifique
     */
    validateField(fieldId: string, value: any): void {
      const field = this.fields.find((f: StepFormField) => f.id === fieldId)
      if (!field || !field.validation) return

      const errors: string[] = []

      // Validation required
      if (field.validation.required) {
        if (value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0)) {
          errors.push(`${field.label} est obligatoire`)
        }
      }

      // Validation pour les champs texte
      if (value && typeof value === 'string') {
        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors.push(`${field.label} doit contenir au moins ${field.validation.minLength} caractères`)
        }
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors.push(`${field.label} ne peut pas dépasser ${field.validation.maxLength} caractères`)
        }
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
          errors.push(`${field.label} n'a pas le format requis`)
        }
      }

      // Validation pour les champs numériques
      if (value && (field.type === 'number' || field.type === 'range')) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value
        if (field.validation.min !== undefined && numValue < field.validation.min) {
          errors.push(`${field.label} doit être supérieur ou égal à ${field.validation.min}`)
        }
        if (field.validation.max !== undefined && numValue > field.validation.max) {
          errors.push(`${field.label} doit être inférieur ou égal à ${field.validation.max}`)
        }
      }

      // Validation email
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          errors.push(`${field.label} doit être une adresse email valide`)
        }
      }

      // Sauvegarder les erreurs
      if (errors.length > 0) {
        this.setFieldError(fieldId, errors[0])
      } else {
        this.clearFieldError(fieldId)
      }
    },

    /**
     * Définir une erreur pour un champ
     */
    setFieldError(fieldId: string, error: string): void {
      // Adapter selon votre système de gestion d'état
      if (this.$store && this.$store.commit) {
        this.$store.commit('form/setFieldError', { fieldId, error })
      }
    },    /**
     * Effacer l'erreur d'un champ
     */
    clearFieldError(fieldId: string): void {
      // Adapter selon votre système de gestion d'état
      if (this.$store && this.$store.commit) {
        this.$store.commit('form/clearFieldError', fieldId)
      }
    }
  }
}
</script>

<style scoped >
@import url('./FormBuilder.css');
</style>