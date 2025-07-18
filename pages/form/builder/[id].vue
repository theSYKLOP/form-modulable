<template>
  <div class="form-builder">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin text-blue-600" />
      <span>Chargement du constructeur...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-600" />
      <span>{{ error }}</span>
      <button @click="retry" class="btn btn-primary">Réessayer</button>
    </div>

    <!-- Builder interface -->
    <template v-else-if="formConfig">
      <!-- Header Premium avec breadcrumb -->
      <div class="builder-header">
        <div class="header-left">
          <div class="breadcrumb">
            <NuxtLink to="/admin/formulaires" class="breadcrumb-link">
              <Icon name="heroicons:arrow-left" class="w-4 h-4" />
              Formulaires
            </NuxtLink>
            <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
            <span class="breadcrumb-current">{{ formConfig.title || 'Nouveau formulaire' }}</span>
          </div>
          
          <div class="header-title-section">
            <h1 class="builder-title">
              <Icon name="heroicons:document-text" class="title-icon" />
              {{ formConfig.title || 'Constructeur de formulaire' }}
            </h1>
            <div class="save-status">
              <span v-if="isSaving" class="status-item saving">
                <Icon name="heroicons:arrow-path" class="animate-spin" />
                Sauvegarde en cours...
              </span>
              <span v-else-if="hasUnsavedChanges" class="status-item unsaved">
                <Icon name="heroicons:exclamation-triangle" />
                Modifications non sauvegardées
              </span>
              <span v-else-if="lastSavedAt" class="status-item saved">
                <Icon name="heroicons:check-circle" />
                Sauvegardé {{ formatRelativeTime(lastSavedAt) }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button 
            @click="togglePreview"
            class="btn btn-secondary"
            :class="{ active: showPreview }"
          >
            <Icon name="heroicons:eye" />
            {{ showPreview ? 'Masquer' : 'Aperçu' }}
          </button>
          
          <button 
            @click="saveForm"
            :disabled="isSaving || !hasUnsavedChanges"
            class="btn btn-primary"
          >
            <Icon name="heroicons:cloud-arrow-up" />
            {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
      </div>

      <!-- Navigation par onglets moderne -->
      <div class="tabs-navigation">
        <div class="tabs-container">
          <div class="tabs-nav">
            <button 
              v-for="(step, index) in formConfig.steps || []"
              :key="step.id"
              @click="activeStepIndex = index"
              class="tab-btn"
              :class="{ active: activeStepIndex === index }"
            >
              <div class="tab-indicator"></div>
              <div class="tab-content">
                <div class="tab-number">{{ index + 1 }}</div>
                <div class="tab-info">
                  <span class="tab-title">{{ step.title }}</span>
                  <span class="tab-meta">{{ step.fields?.length || 0 }} champs</span>
                </div>
              </div>
              
              <div class="tab-actions">
                <button 
                  @click.stop="editStep(step)"
                  class="tab-action-btn"
                  title="Modifier l'étape"
                >
                  <Icon name="heroicons:pencil" />
                </button>
                <button 
                  v-if="(formConfig.steps?.length || 0) > 1"
                  @click.stop="deleteStep(step.id)"
                  class="tab-action-btn delete"
                  title="Supprimer l'étape"
                >
                  <Icon name="heroicons:trash" />
                </button>
              </div>
            </button>
            
            <button 
              @click="addStep"
              class="tab-btn add-tab"
              title="Ajouter une étape"
            >
              <Icon name="heroicons:plus-circle" class="add-icon" />
              <span>Nouvelle étape</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Corps principal -->
      <div class="builder-body">
        <!-- Sidebar gauche -->
        <div class="builder-sidebar" :class="{ 'sidebar-open': sidebarOpen }">
          <div class="sidebar-header">
            <h2 class="sidebar-title">
              <Icon name="heroicons:squares-plus" />
              Boîte à outils
            </h2>
            <button 
              @click="sidebarOpen = false"
              class="sidebar-close lg:hidden"
            >
              <Icon name="heroicons:x-mark" />
            </button>
          </div>

          <div class="sidebar-sections">
            <!-- Types de champs -->
            <div class="sidebar-section">
              <h3 class="section-title">
                <Icon name="heroicons:puzzle-piece" />
                Types de champs
              </h3>
              <div class="field-types-grid">
                <button 
                  v-for="fieldType in fieldTypes"
                  :key="fieldType.type"
                  @click="addFieldQuick(fieldType)"
                  class="field-type-btn"
                  :title="fieldType.description"
                >
                  <Icon :name="fieldType.icon" class="field-type-icon" />
                  <span class="field-type-label">{{ fieldType.label }}</span>
                </button>
              </div>
            </div>

            <!-- Paramètres du formulaire -->
            <div class="sidebar-section">
              <h3 class="section-title">
                <Icon name="heroicons:cog-6-tooth" />
                Paramètres
              </h3>
              <div class="form-settings">
                <div class="setting-item">
                  <label class="setting-label">Titre du formulaire</label>
                  <input 
                    v-model="formConfig.title"
                    class="setting-input"
                    placeholder="Nom du formulaire"
                  />
                </div>
                <div class="setting-item">
                  <label class="setting-label">Description</label>
                  <textarea 
                    v-model="formConfig.description"
                    class="setting-textarea"
                    placeholder="Description du formulaire"
                    rows="3"
                  />
                </div>
                <div class="setting-item">
                  <label class="setting-label">Mode</label>
                  <select v-model="formConfig.mode" class="setting-select">
                    <option value="EDIT">Édition</option>
                    <option value="PREVIEW">Aperçu</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Zone principale -->
        <div class="builder-main">
          <!-- Bouton sidebar mobile -->
          <button 
            @click="sidebarOpen = true"
            class="sidebar-toggle lg:hidden"
          >
            <Icon name="heroicons:bars-3" />
          </button>

          <!-- Contenu de l'étape active -->
          <div class="step-workspace">
            <div v-if="activeStep" class="step-editor">
              <div class="step-header">
                <div class="step-title-section">
                  <h2 class="step-title">
                    <Icon name="heroicons:document-text" />
                    {{ activeStep.title }}
                  </h2>
                  <p v-if="activeStep.description" class="step-description">
                    {{ activeStep.description }}
                  </p>
                </div>
                <button 
                  @click="editStep(activeStep)"
                  class="btn btn-ghost"
                >
                  <Icon name="heroicons:pencil" />
                  Modifier
                </button>
              </div>

              <!-- Zone de construction des champs -->
              <div class="fields-builder">
                <!-- État vide -->
                <div v-if="(activeStep.fields?.length || 0) === 0" class="empty-step">
                  <div class="empty-illustration">
                    <div class="empty-icon-wrapper">
                      <Icon name="heroicons:document-plus" class="empty-icon" />
                    </div>
                    <h3 class="empty-title">Commencez par ajouter des champs</h3>
                    <p class="empty-description">
                      Utilisez la boîte à outils pour ajouter des champs à votre formulaire
                    </p>
                    <div class="empty-actions">
                      <button 
                        @click="addFieldQuick(fieldTypes[0])"
                        class="btn btn-primary"
                      >
                        <Icon name="heroicons:plus" />
                        Ajouter un champ texte
                      </button>
                      <button 
                        @click="showFieldModal = true"
                        class="btn btn-secondary"
                      >
                        <Icon name="heroicons:squares-plus" />
                        Tous les types
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Liste des champs -->
                <div v-else class="fields-list">
                  <TransitionGroup name="field-list" tag="div">
                    <div 
                      v-for="(field, fieldIndex) in sortedFields"
                      :key="field.id"
                      class="field-item"
                      :class="{ 'field-selected': selectedFieldId === field.id }"
                    >
                      <div class="field-wrapper">
                        <div class="field-drag-handle">
                          <Icon name="heroicons:bars-3" />
                        </div>
                        
                        <div class="field-content" @click="selectField(field.id)">
                          <FieldRenderer 
                            :field="field"
                            :is-builder="true"
                            @update="updateField(field.id, $event)"
                            @delete="deleteField(field.id)"
                            @duplicate="duplicateField(field.id)"
                            @edit="editField(field)"
                          />
                        </div>
                      </div>

                      <!-- Séparateur avec bouton d'ajout -->
                      <div 
                        v-if="fieldIndex < sortedFields.length - 1"
                        class="field-separator"
                      >
                        <div class="separator-line"></div>
                        <button 
                          class="separator-add-btn"
                          @click="addFieldAtPosition(fieldIndex + 1)"
                          title="Insérer un champ ici"
                        >
                          <Icon name="heroicons:plus" />
                        </button>
                      </div>
                    </div>
                  </TransitionGroup>

                  <!-- Bouton d'ajout en fin -->
                  <div class="add-field-end">
                    <button 
                      @click="addFieldAtEnd"
                      class="btn btn-dashed btn-large"
                    >
                      <Icon name="heroicons:plus" />
                      Ajouter un champ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panneau de prévisualisation -->
        <div v-if="showPreview" class="preview-panel">
          <div class="preview-header">
            <h3 class="preview-title">
              <Icon name="heroicons:eye" />
              Aperçu du formulaire
            </h3>
            <button @click="showPreview = false" class="preview-close">
              <Icon name="heroicons:x-mark" />
            </button>
          </div>
          <div class="preview-content">
            <FormPreview :form-config="formConfig" />
          </div>
        </div>
      </div>
    </template>

    <!-- Overlay mobile -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-overlay lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Modals -->
    <StepModal 
      v-model:open="showStepModal"
      :step="editingStep"
      @save="handleStepSave"
    />
    
    <FieldModal 
      :isOpen="showFieldModal"
      :field="editingField"
      :insert-position="insertPosition"
      @save="handleFieldSave"
      @close="showFieldModal = false"
    />
    
    <StepModal
      :isOpen="showStepModal"
      :step="editingStep"
      @save="handleStepSave"
      @close="showStepModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useFormBuilder } from '../composables/useFormBuilder'
import FieldRenderer from '../components/FieldRenderer.vue'
import FormPreview from '../components/FormPreview.vue'
import StepModal from '../components/StepModal.vue'
import FieldModal from '../components/FieldModal.vue'
import { useFieldTypes } from '../composables/useFieldTypes'

// Configuration de la page
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()

// États du builder
const {
  formConfig,
  isSaving,
  hasUnsavedChanges,
  lastSavedAt,
  initializeFormBuilder,
  loadForm,
  saveToDatabase,
  checkUnsavedChanges,
  clearLocalStorage,
  addStep,
  deleteStep,
  addField,
  updateField,
  deleteField,
  duplicateField
} = useFormBuilder()

// États locaux
const isLoading = ref(false)
const error = ref<string | null>(null)
const activeStepIndex = ref(0)
const selectedFieldId = ref<string | null>(null)
const showPreview = ref(false)
const showStepModal = ref(false)
const showFieldModal = ref(false)
const editingStep = ref(null)
const editingField = ref(null)
const insertPosition = ref<number | null>(null)
const sidebarOpen = ref(false)

// Types de champs depuis le composable
const { fieldTypes } = useFieldTypes()

// Computed
const activeStep = computed(() => {
  return formConfig.value?.steps?.[activeStepIndex.value]
})

const sortedFields = computed(() => {
  return activeStep.value?.fields?.sort((a, b) => a.order - b.order) || []
})

// Méthodes
const selectField = (fieldId: string) => {
  selectedFieldId.value = fieldId
}

const addFieldQuick = (fieldType: any) => {
  const field = {
    type: fieldType.type,
    label: fieldType.label,
    placeholder: `Saisissez ${fieldType.label.toLowerCase()}...`,
    required: false,
    validation: {}
  }
  
  addField(field)
}

const addFieldAtPosition = (position: number) => {
  insertPosition.value = position
  showFieldModal.value = true
}

const addFieldAtEnd = () => {
  insertPosition.value = null
  showFieldModal.value = true
}

const editStep = (step: any) => {
  editingStep.value = step
  showStepModal.value = true
}

const editField = (field: any) => {
  editingField.value = field
  showFieldModal.value = true
}

const handleStepSave = (stepData: any) => {
  if (stepData.id) {
    // Mise à jour d'une étape existante
    const stepIndex = formConfig.value?.steps?.findIndex(s => s.id === stepData.id)
    if (stepIndex !== -1 && stepIndex !== undefined && formConfig.value?.steps) {
      formConfig.value.steps[stepIndex] = { ...formConfig.value.steps[stepIndex], ...stepData }
    }
  } else {
    // Ajout d'une nouvelle étape
    addStep()
  }
  showStepModal.value = false
  editingStep.value = null
}

const handleFieldSave = (fieldData: any) => {
  showFieldModal.value = false
  editingField.value = null
  insertPosition.value = null
}

const addNewStep = () => {
  editingStep.value = null
  showStepModal.value = true
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const saveForm = async () => {
  try {
    await saveToDatabase()
    // Notification de succès
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
  }
}

const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'à l\'instant'
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return 'il y a plus de 24h'
}

const retry = async () => {
  const formId = route.params.id as string
  await loadFormSafely(formId)
}

const loadFormSafely = async (formId: string) => {
  try {
    isLoading.value = true
    error.value = null
    
    if (formId === 'new') {
      const newFormId = await initializeFormBuilder()
      await router.replace(`/form/builder/${newFormId}`)
    } else {
      await loadForm(formId)
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement du formulaire'
    console.error('Erreur initialisation:', err)
  } finally {
    isLoading.value = false
  }
}

// Initialisation
onMounted(async () => {
  const formId = route.params.id as string
  await loadFormSafely(formId)
})

// Gestion des modifications non sauvegardées
onBeforeUnmount(() => {
  if (checkUnsavedChanges()) {
    const shouldSave = confirm('Vous avez des modifications non sauvegardées. Voulez-vous les sauvegarder ?')
    if (shouldSave) {
      saveForm()
    } else {
      clearLocalStorage()
    }
  }
})
</script>

<style scoped>
/* Styles existants + nouveaux styles pour les états de chargement */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  color: #6b7280;
}

.error-state {
  color: #ef4444;
}

.form-builder {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.builder-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: white;
}

.breadcrumb-current {
  color: white;
  font-weight: 500;
}

.builder-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.title-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.status-item.saving {
  background: rgba(59, 130, 246, 0.2);
}

.status-item.unsaved {
  background: rgba(245, 158, 11, 0.2);
}

.status-item.saved {
  background: rgba(16, 185, 129, 0.2);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-secondary.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* Ajout de styles pour les autres composants */
.tabs-navigation {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tabs-container {
  padding: 0 2rem;
}

.tabs-nav {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem 0;
}

.tab-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  overflow: hidden;
}

.tab-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.tab-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.tab-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(100, 116, 139, 0.1);
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.tab-btn.active .tab-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.tab-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.tab-btn.active .tab-title {
  color: white;
}

.tab-meta {
  font-size: 0.75rem;
  color: #6b7280;
  opacity: 0.8;
}

.tab-btn.active .tab-meta {
  color: rgba(255, 255, 255, 0.8);
}

.builder-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.builder-sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.sidebar-sections {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.field-types-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.field-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.field-type-btn:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
}

.field-type-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
  transition: color 0.2s;
}

.field-type-btn:hover .field-type-icon {
  color: #3b82f6;
}

.field-type-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.builder-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.step-workspace {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.step-editor {
  max-width: 900px;
  margin: 0 auto;
}

.empty-step {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  padding: 2rem;
}

.empty-illustration {
  text-align: center;
  max-width: 500px;
}

.empty-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
}

.empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #3b82f6;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  color: #6b7280;
  font-size: 1rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-item {
  background: white;
  border: 2px solid transparent;
  border-radius: 1rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.field-item:hover {
  border-color: #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.field-item.field-selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
}

.field-content {
  flex: 1;
  cursor: pointer;
}

.btn-dashed {
  background: white;
  border: 2px dashed #d1d5db;
  color: #6b7280;
}

.btn-dashed:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn-ghost {
  background: transparent;
  border-color: transparent;
  color: #6b7280;
}

.btn-ghost:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: #374151;
}

/* Responsive */
@media (max-width: 768px) {
  .builder-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 40;
    transform: translateX(-100%);
  }
  
  .builder-sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .field-types-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs-nav {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tab-btn {
    min-width: auto;
  }
  
  .step-workspace {
    padding: 1rem;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
