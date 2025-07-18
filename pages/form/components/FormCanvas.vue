<template>
  <div class="form-canvas">
    <!-- Navigation des étapes -->
    <StepNavigation 
      v-if="props.formConfig?.steps"
      :steps="props.formConfig.steps"
      :active-index="props.activeStepIndex"
      @stepClick="(index: number) => emit('step-click', index)"
      @stepAdd="() => emit('add-step')"
      @stepDelete="(stepId: string) => emit('delete-step', stepId)"
      @stepEdit="openModal('step', $event)"
    />

    <!-- Zone de création -->
    <div class="canvas-area">
      <div v-if="props.activeStep" class="step-container">
        <div class="step-header">
          <h2 class="step-title">{{ props.activeStep.title }}</h2>
          <p v-if="props.activeStep.description" class="step-description">
            {{ props.activeStep.description }}
          </p>
        </div>

        <!-- Champs de l'étape -->
        <div class="fields-container">
          <!-- État vide avec design amélioré -->
          <div v-if="props.activeStep.fields.length === 0" class="empty-step">
            <div class="empty-content">
              <div class="empty-icon-container">
                <Icon name="i-heroicons-document-plus" class="empty-icon" />
              </div>
              <h3 class="empty-title">Commencez par ajouter un champ</h3>
              <p class="empty-description">
                Créez votre premier champ pour construire votre formulaire
              </p>
              <button 
                @click="openFieldModal()"
                class="add-field-btn primary"
              >
                <Icon name="i-heroicons-plus" class="btn-icon" />
                Ajouter un champ
              </button>
            </div>
          </div>

          <!-- Grille des champs avec support des largeurs -->
          <div v-else class="fields-grid">
            <!-- Organisation des champs en rangées selon leur largeur -->
            <div class="fields-row">
              <div
                v-for="(field, fieldIndex) in sortedFields"
                :key="field.id"
                :class="['field-container', field.width || 'full']"
              >
                <div
                  class="field-wrapper"
                  :class="{ 
                    'selected': props.selectedFieldId === field.id,
                    'hover': hoveredFieldId === field.id 
                  }"
                  @click="selectField(field.id)"
                  @dblclick="editField(field)"
                  @mouseenter="hoveredFieldId = field.id"
                  @mouseleave="hoveredFieldId = null"
                >
                  <!-- Boutons d'action du champ -->
                  <div 
                    v-if="props.selectedFieldId === field.id || hoveredFieldId === field.id" 
                    class="field-actions"
                  >
                    <button 
                      @click.stop="editField(field)"
                      class="field-action-btn edit"
                      title="Modifier le champ (double-clic)"
                    >
                      <Icon name="i-heroicons-pencil" />
                    </button>
                    <button 
                      @click.stop="() => emit('duplicate-field', field.id)"
                      class="field-action-btn duplicate"
                      title="Dupliquer le champ"
                    >
                      <Icon name="i-heroicons-document-duplicate" />
                    </button>
                    <button 
                      @click.stop="confirmDeleteField(field)"
                      class="field-action-btn delete"
                      title="Supprimer le champ"
                    >
                      <Icon name="i-heroicons-trash" />
                    </button>
                  </div>

                  <!-- Indicateur de sélection -->
                  <div 
                    v-if="props.selectedFieldId === field.id" 
                    class="selection-indicator"
                  >
                    <Icon name="i-heroicons-cursor-arrow-rays" />
                  </div>

                  <!-- 🆕 En-tête du champ avec label et description -->
                  <div class="field-header">
                    <div class="field-label-section">
                      <h4 class="field-label">
                        {{ field.label || 'Sans label' }}
                        <span v-if="field.required" class="required-indicator">*</span>
                      </h4>
                      <p v-if="field.placeholder" class="field-description">
                        {{ field.placeholder }}
                      </p>
                    </div>
                    
                    <!-- Badge du type de champ -->
                    <div class="field-type-badge">
                      <Icon :name="getFieldTypeIcon(field.type)" class="field-type-icon" />
                      <span class="field-type-text">{{ getFieldTypeLabel(field.type) }}</span>
                    </div>
                  </div>

                  <!-- 🆕 Contenu du champ avec FieldRenderer -->
                  <div class="field-content">
                    <FieldRenderer 
                      :field="field"
                      :is-builder="true"
                      @update="handleFieldUpdate(field.id, $event)"
                    />
                  </div>

                  <!-- 🆕 Informations supplémentaires du champ -->
                  <div v-if="hasFieldDetails(field)" class="field-details">
                    <!-- <div v-if="field.placeholder" class="field-detail">
                      <Icon name="i-heroicons-chat-bubble-left-ellipsis" class="detail-icon" />
                      <span class="detail-text">Placeholder: "{{ field.placeholder }}"</span>
                    </div> -->
                    <div v-if="field.defaultValue" class="field-detail">
                      <Icon name="i-heroicons-document-text" class="detail-icon" />
                      <span class="detail-text">Valeur par défaut: "{{ field.defaultValue }}"</span>
                    </div>
                    <div v-if="field.validation?.min || field.validation?.max" class="field-detail">
                      <Icon name="i-heroicons-scale" class="detail-icon" />
                      <span class="detail-text">
                        Limites: {{ field.validation?.min || 0 }} - {{ field.validation?.max || '∞' }}
                      </span>
                    </div>
                    <div v-if="field.validation?.pattern" class="field-detail">
                      <Icon name="i-heroicons-shield-check" class="detail-icon" />
                      <span class="detail-text">Format validé</span>
                    </div>
                  </div>
                </div>
                
                <!-- Bouton + entre les champs avec animation -->
                <div 
                  v-if="fieldIndex < sortedFields.length - 1"
                  class="field-divider"
                  @mouseenter="showAddButton($event)"
                  @mouseleave="hideAddButton($event)"
                >
                  <div class="divider-line"></div>
                  <button 
                    class="add-field-between"
                    @click="openFieldModalAtPosition(field.order + 1)"
                    title="Insérer un champ ici"
                  >
                    <Icon name="i-heroicons-plus" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bouton + en fin d'étape avec design amélioré -->
          <div 
            v-if="props.activeStep.fields.length > 0"
            class="add-field-end"
            @mouseenter="showAddButton($event)"
            @mouseleave="hideAddButton($event)"
          >
            <div class="end-divider-line"></div>
            <button 
              class="add-field-btn secondary"
              @click="openFieldModal()"
            >
              <Icon name="i-heroicons-plus" class="btn-icon" />
              Ajouter un champ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <FieldModal 
      :isOpen="isModalOpen"
      :type="modalType"
      :field="editingField"
      :insert-position="insertPosition"
      @close="closeModal"
      @addField="handleAddField"
      @updateField="handleUpdateField"
    />
    
    <!-- Modal pour les étapes -->
    <StepModal 
      v-if="modalType === 'step'"
      :isOpen="isModalOpen"
      :step="editingStep"
      @close="closeModal"
      @save="handleUpdateStep"
    />

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-header">
          <Icon name="i-heroicons-exclamation-triangle" class="warning-icon" />
          <h3>Supprimer le champ</h3>
        </div>
        <div class="delete-modal-body">
          <p>Êtes-vous sûr de vouloir supprimer le champ <strong>"{{ fieldToDelete?.label }}"</strong> ?</p>
          <p class="warning-text">Cette action est irréversible.</p>
        </div>
        <div class="delete-modal-footer">
          <button @click="cancelDelete" class="cancel-btn">
            Annuler
          </button>
          <button @click="confirmDelete" class="delete-btn">
            <Icon name="i-heroicons-trash" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import StepNavigation from './StepNavigation.vue'
import FieldRenderer from './FieldRenderer.vue'
import FieldModal from './FieldModal.vue'
import StepModal from './StepModal.vue'
import type { FormConfig, FormStep, FormField, FormFieldData } from '../../../types/form'

// Props reçus du parent
interface Props {
  formConfig: FormConfig
  activeStepIndex: number
  activeStep: FormStep
  selectedFieldId: string | null
}

const props = defineProps<Props>()

// Émissions vers le parent
const emit = defineEmits<{
  'update-step-title': [stepId: string, title: string]
  'add-step': []
  'delete-step': [stepId: string]
  'add-field': [field: FormField]
  'update-field': [fieldId: string, data: Partial<FormField>]
  'delete-field': [fieldId: string]
  'duplicate-field': [fieldId: string]
  'select-field': [fieldId: string | null]
  'step-click': [index: number]
}>()

// État local uniquement pour l'UI du composant
const isModalOpen = ref(false)
const modalType = ref<'step' | 'field'>('field')
const editingStepId = ref<string | null>(null)
const editingStep = ref<any>(null)
const editingField = ref<FormField | null>(null)
const insertPosition = ref<number | null>(null)

// État pour les interactions UI
const hoveredFieldId = ref<string | null>(null)
const showDeleteModal = ref(false)
const fieldToDelete = ref<FormField | null>(null)

const sortedFields = computed(() => {
  return props.activeStep?.fields.sort((a, b) => a.order - b.order) || []
})

// 🆕 Fonction pour obtenir l'icône du type de champ
const getFieldTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'INPUT': 'i-heroicons-pencil-square',
    'TEXTAREA': 'i-heroicons-document-text',
    'SELECT': 'i-heroicons-chevron-down',
    'RADIO': 'i-heroicons-radio',
    'CHECKBOX': 'i-heroicons-check-circle',
    'EMAIL': 'i-heroicons-at-symbol',
    'PASSWORD': 'i-heroicons-lock-closed',
    'NUMBER': 'i-heroicons-hashtag',
    'DATE': 'i-heroicons-calendar-days',
    'TIME': 'i-heroicons-clock',
    'FILE': 'i-heroicons-document-arrow-up',
    'TEL': 'i-heroicons-phone',
    'URL': 'i-heroicons-link',
    'RATING': 'i-heroicons-star',
    'SLIDER': 'i-heroicons-adjustments-horizontal'
  }
  return icons[type] || 'i-heroicons-question-mark-circle'
}

// 🆕 Fonction pour obtenir le label du type de champ
const getFieldTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'INPUT': 'Texte',
    'TEXTAREA': 'Zone de texte',
    'SELECT': 'Liste déroulante',
    'RADIO': 'Boutons radio',
    'CHECKBOX': 'Cases à cocher',
    'EMAIL': 'Email',
    'PASSWORD': 'Mot de passe',
    'NUMBER': 'Nombre',
    'DATE': 'Date',
    'TIME': 'Heure',
    'FILE': 'Fichier',
    'TEL': 'Téléphone',
    'URL': 'URL',
    'RATING': 'Notation',
    'SLIDER': 'Curseur'
  }
  return labels[type] || type
}

// 🆕 Fonction pour vérifier si un champ a des détails à afficher
const hasFieldDetails = (field: FormField) => {
  return field.placeholder || 
         field.defaultValue || 
         field.validation?.min || 
         field.validation?.max || 
         field.validation?.pattern
}

// Fonction pour sélectionner un champ (simple clic)
const selectField = (fieldId: string) => {
  const newSelectedId = props.selectedFieldId === fieldId ? null : fieldId
  emit('select-field', newSelectedId)
}

const showAddButton = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const button = target.querySelector('.add-field-between, .add-field-btn')
  if (button) {
    button.classList.add('visible')
  }
}

const hideAddButton = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const button = target.querySelector('.add-field-between, .add-field-btn')
  if (button) {
    button.classList.remove('visible')
  }
}

// Fonctions pour gérer le modal
const openModal = (type: 'step' | 'field', stepId?: string) => {
  modalType.value = type
  
  if (type === 'step' && stepId && props.formConfig) {
    editingStepId.value = stepId
    editingStep.value = props.formConfig.steps.find(s => s.id === stepId)
  } else {
    editingStepId.value = null
    editingStep.value = null
    editingField.value = null
  }
  
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingStepId.value = null
  editingStep.value = null
  editingField.value = null
  insertPosition.value = null
}

// Fonction pour ouvrir le modal de champ
const openFieldModal = () => {
  insertPosition.value = null
  editingField.value = null
  openModal('field')
}

// Fonction pour ouvrir le modal à une position spécifique
const openFieldModalAtPosition = (position: number) => {
  insertPosition.value = position
  editingField.value = null
  openModal('field')
}

// Fonction wrapper pour gérer les mises à jour de champs
const handleFieldUpdate = (fieldId: string, value: string) => {
  // Convertir la string en objet partiel FormField
  emit('update-field', fieldId, { defaultValue: value } as Partial<FormField>)
}

// Fonction pour éditer un champ existant (double-clic)
const editField = (field: FormField) => {
  editingField.value = field
  insertPosition.value = null
  modalType.value = 'field'
  isModalOpen.value = true
}

// Fonction pour confirmer la suppression d'un champ
const confirmDeleteField = (field: FormField) => {
  fieldToDelete.value = field
  showDeleteModal.value = true
}

// Fonction pour annuler la suppression
const cancelDelete = () => {
  showDeleteModal.value = false
  fieldToDelete.value = null
}

// Fonction pour confirmer et effectuer la suppression
const confirmDelete = () => {
  if (fieldToDelete.value) {
    emit('delete-field', fieldToDelete.value.id)
    showDeleteModal.value = false
    fieldToDelete.value = null
  }
}

// Fonction pour ajouter un nouveau champ
const handleAddField = (fieldData: Partial<FormFieldData>) => {
  console.log('🚀 Adding field:', fieldData)
  
  if (insertPosition.value !== null) {
    // Mode insertion - create complete FormField object
    const newField: FormField = {
      id: `field_${Date.now()}`,
      stepId: props.activeStep?.id || '',
      order: insertPosition.value,
      ...fieldData
    } as FormField
    
    addFieldAtPosition(newField, insertPosition.value)
  } else {
    // Mode ajout normal
    const newField: FormField = {
      id: `field_${Date.now()}`,
      stepId: props.activeStep?.id || '',
      order: props.activeStep?.fields.length || 0,
      ...fieldData
    } as FormField
    
    emit('add-field', newField)
    emit('select-field', newField.id)
  }
  
  closeModal()
}

const handleUpdateField = (fieldId: string, fieldData: Partial<FormFieldData>) => {
  console.log('🔄 Updating field:', fieldId, fieldData)
  emit('update-field', fieldId, fieldData as Partial<FormField>)
  closeModal()
}

// Fonction pour ajouter un champ à une position spécifique
const addFieldAtPosition = (fieldData: FormField, position: number) => {
  if (!props.activeStep) return
  
  const newField: FormField = {
    ...fieldData,
    id: `field_${Date.now()}`,
    stepId: props.activeStep.id,
    order: position
  }
  
  // Décaler les champs suivants
  props.activeStep.fields.forEach(f => {
    if (f.order >= position) {
      f.order += 1
    }
  })
  
  // Ajouter le nouveau champ
  props.activeStep.fields.push(newField)
  
  // Réordonner
  props.activeStep.fields.sort((a, b) => a.order - b.order)
  props.activeStep.fields.forEach((f, index) => {
    f.order = index
  })
  
  emit('select-field', newField.id)
}

// Fonction pour gérer la modification d'étape
const handleUpdateStep = (stepData: { title: string; description?: string }) => {
  if (editingStepId.value) {
    emit('update-step-title', editingStepId.value, stepData.title)
    // Vous pouvez aussi mettre à jour la description si nécessaire
  }
  closeModal()
}
</script>

<style scoped>
.form-canvas {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
}

.canvas-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.step-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-height: 600px;
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
  font-size: 0.95rem;
}

.fields-container {
  position: relative;
  min-height: 400px;
}

/* État vide amélioré */
.empty-step {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #d1d5db;
  transition: all 0.3s ease;
}

.empty-content:hover .empty-icon {
  color: #3b82f6;
  transform: scale(1.1);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

/* Grille des champs - Responsive avec support des largeurs */
.fields-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Container des champs avec gestion des largeurs */
.fields-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

/* Différentes largeurs de champs */
.field-container {
  transition: all 0.3s ease;
  position: relative;
}

.field-container.full {
  width: 100%;
}

.field-container.half {
  width: calc(50% - 0.5rem);
}

.field-container.third {
  width: calc(33.333% - 0.667rem);
}

.field-container.quarter {
  width: calc(25% - 0.75rem);
}

/* Styles responsifs pour les largeurs */
@media (max-width: 768px) {
  .field-container.half, 
  .field-container.third,
  .field-container.quarter {
    width: 100%;
  }
}

.field-wrapper {
  position: relative;
  padding: 1.5rem;
  border: 2px solid transparent;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
  height: 100%;
}

.field-wrapper:hover,
.field-wrapper.hover {
  border-color: #e5e7eb;
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.field-wrapper.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Actions du champ */
.field-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 0.5rem;
  padding: 0.25rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.field-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.field-action-btn.edit {
  background: #eff6ff;
  color: #3b82f6;
}

.field-action-btn.edit:hover {
  background: #3b82f6;
  color: white;
}

.field-action-btn.duplicate {
  background: #f0fdf4;
  color: #16a34a;
}

.field-action-btn.duplicate:hover {
  background: #16a34a;
  color: white;
}

.field-action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

.field-action-btn.delete:hover {
  background: #dc2626;
  color: white;
}

/* Indicateur de sélection */
.selection-indicator {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  z-index: 5;
}

/* 🆕 Styles pour l'en-tête du champ */
.field-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.field-label-section {
  flex: 1;
}

.field-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required-indicator {
  color: #ef4444;
  font-weight: 700;
}

.field-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.field-type-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  flex-shrink: 0;
}

.field-type-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.field-type-text {
  font-weight: 500;
}

/* 🆕 Styles pour le contenu du champ */
.field-content {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

/* 🆕 Styles pour les détails du champ */
.field-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.field-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.detail-icon {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
  flex-shrink: 0;
}

.detail-text {
  line-height: 1.3;
}

/* Diviseurs entre champs */
.field-divider {
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 10;
}

.divider-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 2px;
  background: linear-gradient(to right, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent);
  z-index: 1;
}

.add-field-between {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  color: #6b7280;
}

.add-field-between:hover {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.add-field-between.visible {
  opacity: 1;
  transform: scale(1);
}

/* Boutons d'ajout */
.add-field-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.add-field-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.add-field-btn.primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.add-field-btn.secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.2s ease;
}

.add-field-btn.secondary:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.add-field-btn.secondary.visible {
  opacity: 1;
  transform: translateY(0);
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Zone de fin d'étape */
.add-field-end {
  margin-top: 2rem;
  text-align: center;
  position: relative;
  padding-top: 2rem;
}

.end-divider-line {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 2px;
  background: linear-gradient(to right, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent);
  margin-bottom: 2rem;
}

.add-field-end .add-field-btn {
  opacity: 1;
  transform: translateY(0);
}

.add-field-end:hover .add-field-btn {
  opacity: 1;
  transform: translateY(0);
}

/* Modal de confirmation de suppression */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-modal {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.delete-modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.warning-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #f59e0b;
}

.delete-modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.delete-modal-body {
  padding: 1.5rem;
}

.delete-modal-body p {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.warning-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

.delete-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #fafbfc;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: #dc2626;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #b91c1c;
}

/* Animations au survol */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.empty-content:hover .add-field-btn {
  animation: pulse 2s infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .canvas-area {
    padding: 1rem;
  }
  
  .step-container {
    padding: 1.5rem;
  }
  
  .add-field-between,
  .add-field-btn {
    opacity: 1;
    transform: scale(1);
  }
  
  .empty-step {
    min-height: 300px;
  }
  
  .fields-container {
    min-height: 250px;
  }

  .field-actions {
    position: static;
    margin-top: 0.5rem;
    justify-content: center;
  }

  .field-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .field-type-badge {
    align-self: flex-start;
  }
}

/* Accessibilité */
.add-field-btn:focus,
.add-field-between:focus,
.field-action-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Animation d'entrée pour les nouveaux champs */
.field-wrapper {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>