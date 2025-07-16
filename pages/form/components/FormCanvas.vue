<template>
  <div class="form-canvas">
    <!-- Navigation des étapes -->
    <StepNavigation 
      :steps="formConfig.steps"
      :active-index="activeStepIndex"
      @stepClick="activeStepIndex = $event"
      @stepAdd="addStep"
      @stepDelete="deleteStep"
      @stepEdit="openModal('step', $event)"
    />

    <!-- Zone de création -->
    <div class="canvas-area">
      <div v-if="activeStep" class="step-container">
        <div class="step-header">
          <h2 class="step-title">{{ activeStep.title }}</h2>
          <p v-if="activeStep.description" class="step-description">
            {{ activeStep.description }}
          </p>
        </div>

        <!-- Champs de l'étape -->
        <div class="fields-container">
          <!-- État vide avec design amélioré -->
          <div v-if="activeStep.fields.length === 0" class="empty-step">
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

          <!-- Grille des champs -->
          <div v-else class="fields-grid">
            <div 
              v-for="field in sortedFields" 
              :key="field.id"
              class="field-wrapper"
              :class="{ 'selected': selectedFieldId === field.id }"
              @click="selectedFieldId = field.id"
            >
              <FieldRenderer 
                :field="field"
                :is-builder="true"
                @update="updateField(field.id, $event)"
                @delete="deleteField(field.id)"
                @duplicate="duplicateField(field.id)"
              />
              
              <!-- Bouton + entre les champs avec animation -->
              <div 
                v-if="field.order < activeStep.fields.length - 1"
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

          <!-- Bouton + en fin d'étape avec design amélioré -->
          <div 
            v-if="activeStep.fields.length > 0"
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
      :is-open="isModalOpen"
      :type="modalType"
      :editing-step-id="editingStepId"
      :insert-position="insertPosition"
      @close="closeModal"
      @add-field="handleAddField"
      @update-step="handleUpdateStep"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFormBuilder } from '../composables/useFormBuilder'
import StepNavigation from './StepNavigation.vue'
import FieldRenderer from './FieldRenderer.vue'
import FieldModal from './FieldModal.vue'

const {
  formConfig,
  activeStepIndex,
  selectedFieldId,
  activeStep,
  addStep,
  deleteStep,
  updateStepTitle,
  addField,
  updateField,
  deleteField,
  duplicateField
} = useFormBuilder()

// État local pour le modal - TOUJOURS local au composant
const isModalOpen = ref(false)
const modalType = ref<'step' | 'field'>('field')
const editingStepId = ref<string | null>(null)
const insertPosition = ref<number | null>(null)

const sortedFields = computed(() => {
  return activeStep.value?.fields.sort((a, b) => a.order - b.order) || []
})

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
  editingStepId.value = stepId || null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingStepId.value = null
  insertPosition.value = null
}

// Fonction pour ouvrir le modal de champ
const openFieldModal = () => {
  insertPosition.value = null
  openModal('field')
}

// Fonction pour ouvrir le modal à une position spécifique
const openFieldModalAtPosition = (position: number) => {
  insertPosition.value = position
  openModal('field')
}

// Fonction pour gérer l'ajout d'un champ
const handleAddField = (field: any) => {
  if (insertPosition.value !== null) {
    // Ajouter le champ à la position spécifiée
    addFieldAtPosition(field, insertPosition.value)
    insertPosition.value = null
  } else {
    // Ajouter le champ à la fin
    addField(field)
  }
  closeModal()
}

// Fonction pour ajouter un champ à une position spécifique
const addFieldAtPosition = (field: any, position: number) => {
  if (!activeStep.value) return
  
  const newField = {
    ...field,
    id: `field_${Date.now()}`,
    stepId: activeStep.value.id,
    order: position
  }
  
  // Décaler les champs suivants
  activeStep.value.fields.forEach(f => {
    if (f.order >= position) {
      f.order += 1
    }
  })
  
  // Ajouter le nouveau champ
  activeStep.value.fields.push(newField)
  
  // Réordonner
  activeStep.value.fields.sort((a, b) => a.order - b.order)
  activeStep.value.fields.forEach((f, index) => {
    f.order = index
  })
  
  selectedFieldId.value = newField.id
}

// Fonction pour gérer la modification d'étape
const handleUpdateStep = (stepId: string, title: string) => {
  updateStepTitle(stepId, title)
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

/* Grille des champs */
.fields-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-wrapper {
  position: relative;
  padding: 1.5rem;
  border: 2px solid transparent;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.field-wrapper:hover {
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

/* Diviseurs entre champs */
.field-divider {
  position: relative;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.5rem 0;
}

.divider-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
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
}

/* Accessibilité */
.add-field-btn:focus,
.add-field-between:focus {
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