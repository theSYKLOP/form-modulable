<template>
  <div class="form-builder-page">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <Icon name="i-heroicons-arrow-path" class="animate-spin text-blue-600" />
      <span>Chargement du constructeur...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <Icon name="i-heroicons-exclamation-triangle" class="text-red-600" />
      <span>{{ error }}</span>
      <button @click="retry" class="btn-retry">Réessayer</button>
    </div>

    <!-- Builder interface -->
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <!-- Breadcrumb -->
          <div class="breadcrumb">
            <NuxtLink to="/admin/formulaires" class="breadcrumb-link">
              <Icon name="i-heroicons-arrow-left" />
              Formulaires
            </NuxtLink>
            <Icon name="i-heroicons-chevron-right" class="breadcrumb-separator" />
            <span class="breadcrumb-current">{{ formConfig?.title || 'Nouveau formulaire' }}</span>
          </div>
          
          <h1 class="page-title">
            <Icon name="i-heroicons-document-text" />
            {{ formConfig?.title || 'Constructeur de formulaire' }}
          </h1>
          
          <!-- Save status -->
          <div class="save-status">
            <span v-if="isSaving" class="status-saving">
              <Icon name="i-heroicons-arrow-path" class="animate-spin" />
              Sauvegarde...
            </span>
            <span v-else-if="hasUnsavedChanges" class="status-unsaved">
              <Icon name="i-heroicons-exclamation-circle" />
              Modifications non sauvegardées
            </span>
            <span v-else-if="lastSavedAt" class="status-saved">
              <Icon name="i-heroicons-check-circle" />
              Sauvegardé {{ formatRelativeTime(lastSavedAt) }}
            </span>
          </div>
        </div>
        
        <div class="header-actions">
          <!-- Bouton nouveau formulaire -->
          <button @click="createNew" class="new-btn">
            <Icon name="i-heroicons-document-plus" />
            Nouveau
          </button>
          
          <!-- Indicateur de sauvegarde automatique -->
          <div class="auto-save-indicator">
            <Icon name="i-heroicons-cloud" />
            <span class="auto-save-text">Sauvegarde auto</span>
          </div>
          
          <button @click="saveForm" class="save-btn" :disabled="isSaving || !hasUnsavedChanges">
            <Icon name="i-heroicons-cloud-arrow-up" />
            {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
          <button @click="previewForm" class="preview-btn" :class="{ active: isPreviewMode }">
            <Icon :name="isPreviewMode ? 'i-heroicons-pencil-square' : 'i-heroicons-eye'" />
            {{ isPreviewMode ? 'Édition' : 'Aperçu' }}
          </button>
        </div>
      </div>

      <!-- 🔧 Conteneur principal avec debug -->
      <div class="main-content">
        <!-- Debug des conditions -->
        <div v-if="true" class="debug-banner">
          <span>Mode: {{ isPreviewMode ? 'PREVIEW' : 'EDIT' }}</span>
          <span>|</span>
          <span>FormConfig: {{ formConfig ? 'EXISTS' : 'NULL' }}</span>
          <span>|</span>
          <span>ActiveStep: {{ activeStep ? 'EXISTS' : 'NULL' }}</span>
          <span>|</span>
          <span>PreviewConfig: {{ getPreviewFormConfig ? 'EXISTS' : 'NULL' }}</span>
        </div>

        <!-- Mode Édition -->
        <FormCanvas 
          v-show="!isPreviewMode && formConfig && activeStep" 
          :form-config="formConfig"
          :active-step-index="activeStepIndex"
          :active-step="activeStep"
          :selected-field-id="selectedFieldId"
          @update-step-title="updateStepTitle"
          @update-step="updateStep"
          @add-step="addStep"
          @delete-step="deleteStep"
          @add-field="addField"
          @update-field="updateField"
          @delete-field="deleteField"
          @duplicate-field="duplicateField"
          @select-field="(fieldId) => selectedFieldId = fieldId"
          @step-click="(index: number) => activeStepIndex = index"
        />

        <!-- Mode Prévisualisation -->
        <FormPreview 
          v-show="isPreviewMode"
          :form-config="getPreviewFormConfig"
        />
        
        <!-- Message si rien ne s'affiche -->
        <div v-show="!isPreviewMode && (!formConfig || !activeStep)" class="no-config-placeholder">
          <div class="placeholder-content">
            <Icon name="i-heroicons-document-text" class="placeholder-icon" />
            <h3>Initialisation du formulaire...</h3>
            <p>Le constructeur de formulaire est en cours de préparation.</p>
            <button @click="forceInit" class="init-btn">
              <Icon name="i-heroicons-refresh" />
              Réessayer l'initialisation
            </button>
          </div>
        </div>
      </div>

      <!-- Success message -->
      <div v-if="showSuccess" class="success-message">
        <Icon name="i-heroicons-check-circle" />
        Formulaire sauvegardé !
      </div>

      <!-- Modal de confirmation pour nouveau formulaire -->
      <div v-if="showNewConfirm" class="modal-overlay" @click="cancelNew">
        <div class="confirm-modal" @click.stop>
          <div class="confirm-header">
            <Icon name="i-heroicons-exclamation-triangle" class="warning-icon" />
            <h3>Créer un nouveau formulaire</h3>
          </div>
          <div class="confirm-body">
            <p>Voulez-vous créer un nouveau formulaire ?</p>
            <p class="warning-text">Vos modifications actuelles seront effacées du brouillon.</p>
          </div>
          <div class="confirm-footer">
            <button @click="cancelNew" class="cancel-btn">
              Annuler
            </button>
            <button @click="confirmNew" class="confirm-btn">
              <Icon name="i-heroicons-document-plus" />
              Créer nouveau
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import FormCanvas from './components/FormCanvas.vue'
import FormPreview from './components/FormPreview.vue'
import { useFormBuilder } from './composables/useFormBuilder'

// Configuration de la page
definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()

// États du builder depuis le composable
const {
  formConfig,
  isSaving,
  hasUnsavedChanges,
  lastSavedAt,
  initializeFormBuilder,
  loadForm,
  saveToDatabase,
  createNewForm,
  checkUnsavedChanges,
  clearLocalStorage,
  activeStepIndex,
  activeStep,
  selectedFieldId,
  addStep,
  deleteStep,
  updateStepTitle,
  updateStep,
  addField,
  updateField,
  deleteField,
  duplicateField,
  getPreviewFormConfig, // 🆕 Import de la version normalisée
} = useFormBuilder()

// États locaux
const isLoading = ref(false)
const error = ref<string | null>(null)
const showSuccess = ref(false)
const showNewConfirm = ref(false)
const isPreviewMode = ref(false)

// Fonction de sauvegarde définitive
const saveForm = async () => {
  try {
    await saveToDatabase()
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur de sauvegarde:', error)
  }
}

// Fonction pour créer un nouveau formulaire
const createNew = () => {
  showNewConfirm.value = true
}

const confirmNew = async () => {
  try {
    const newFormId = await createNewForm()
    showNewConfirm.value = false
    // Rediriger vers le nouveau formulaire
    await router.push(`/form?id=${newFormId}`)
  } catch (error) {
    console.error('Erreur création formulaire:', error)
  }
}

const cancelNew = () => {
  showNewConfirm.value = false
}

const previewForm = () => {
  // Basculer en mode prévisualisation
  isPreviewMode.value = !isPreviewMode.value
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
  const formId = route.query.id as string
  await loadFormSafely(formId)
}

const loadFormSafely = async (formId?: string) => {
  try {
    isLoading.value = true
    error.value = null
    
    console.log('🔍 loadFormSafely called with formId:', formId)
    
    if (!formId || formId === 'new') {
      // Créer un nouveau formulaire ou initialiser depuis localStorage
      console.log('📝 Initializing new form...')
      const newFormId = await initializeFormBuilder()
      console.log('✅ Form initialized with ID:', newFormId)
      
      if (newFormId && (!formId || formId === 'new')) {
        await router.replace(`/form?id=${newFormId}`)
      }
    } else {
      // Charger un formulaire existant
      console.log('📥 Loading existing form:', formId)
      await loadForm(formId)
      console.log('✅ Form loaded successfully')
    }
    
    // Vérifier que formConfig est bien défini
    if (!formConfig.value) {
      console.warn('⚠️ formConfig is still null after initialization')
      throw new Error('Échec de l\'initialisation du formulaire')
    }
    
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement du formulaire'
    console.error('❌ Erreur initialisation:', err)
  } finally {
    isLoading.value = false
  }
}

// Fonction pour forcer l'initialisation
const forceInit = async () => {
  console.log('🔄 Force init triggered')
  const formId = route.query.id as string
  await loadFormSafely(formId)
}

// Fonctions de debugging
const debugLocalStorage = () => {
  const draftData = localStorage.getItem('form-builder-draft')
  console.log('🗄️ localStorage draft:', draftData)
  if (draftData) {
    try {
      const parsed = JSON.parse(draftData)
      console.log('📋 Parsed data:', parsed)
    } catch (e) {
      console.error('❌ Error parsing localStorage:', e)
    }
  }
}

const debugFormConfig = () => {
  console.log('🔧 Current formConfig:', formConfig.value)
  console.log('🔧 Current activeStepIndex:', activeStepIndex.value)
  console.log('🔧 Current activeStep:', activeStep.value)
}

// 🔧 Ajouter un debug pour voir les valeurs
watch(() => isPreviewMode.value, (newValue) => {
  console.log('🔧 isPreviewMode changed:', newValue)
  console.log('🔧 formConfig exists:', !!formConfig.value)
  console.log('🔧 getPreviewFormConfig exists:', !!getPreviewFormConfig.value)
  console.log('🔧 getPreviewFormConfig value:', getPreviewFormConfig.value)
})

// Initialisation
onMounted(async () => {
  const formId = route.query.id as string
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
.form-builder-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* Loading et Error states */
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

/* Debug et placeholder styles */
.debug-panel {
  padding: 1rem 2rem;
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 0.5rem;
  margin: 1rem 2rem;
}

.debug-panel h3 {
  margin: 0 0 1rem 0;
  color: #0c4a6e;
  font-size: 1.1rem;
}

.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border-radius: 0.25rem;
  border: 1px solid #e0f2fe;
}

.debug-item strong {
  color: #075985;
}

.text-green { color: #059669; }
.text-red { color: #dc2626; }
.text-blue { color: #2563eb; }

.debug-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.debug-info {
  padding: 1rem 2rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  margin: 1rem 2rem;
}

.debug-btn,
.init-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  transition: background 0.2s;
}

.debug-btn:hover,
.init-btn:hover {
  background: #2563eb;
}

.no-config-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.placeholder-content {
  text-align: center;
  max-width: 400px;
}

.placeholder-icon {
  width: 4rem;
  height: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.placeholder-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.placeholder-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.init-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0;
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-retry:hover {
  background: #2563eb;
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
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

.breadcrumb-separator {
  width: 1rem;
  height: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.breadcrumb-current {
  color: white;
  font-weight: 500;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.page-title svg {
  width: 1.75rem;
  height: 1.75rem;
}

/* Save status */
.save-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-saving,
.status-unsaved,
.status-saved {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.status-saving {
  background: rgba(59, 130, 246, 0.2);
}

.status-unsaved {
  background: rgba(245, 158, 11, 0.2);
}

.status-saved {
  background: rgba(16, 185, 129, 0.2);
}

/* Header actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auto-save-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.auto-save-text {
  font-weight: 500;
}

/* Buttons */
.save-btn,
.preview-btn,
.new-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.new-btn {
  background: rgba(245, 158, 11, 0.9);
  color: white;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.new-btn:hover {
  background: rgba(217, 119, 6, 0.9);
  transform: translateY(-1px);
}

.save-btn {
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.save-btn:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.9);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.preview-btn {
  background: rgba(16, 185, 129, 0.9);
  color: white;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.preview-btn:hover {
  background: rgba(5, 150, 105, 0.9);
  transform: translateY(-1px);
}

.preview-btn.active {
  background: rgba(59, 130, 246, 0.9);
  border-color: rgba(59, 130, 246, 0.3);
}

.preview-btn.active:hover {
  background: rgba(37, 99, 235, 0.9);
}

/* Success message */
.success-message {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #10b981;
  color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

/* Modal de confirmation */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.confirm-modal {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 450px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.warning-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #f59e0b;
}

.confirm-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.confirm-body {
  padding: 1.5rem;
}

.confirm-body p {
  margin: 0 0 0.5rem 0;
  color: #374151;
  line-height: 1.5;
}

.warning-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #fafbfc;
}

.cancel-btn {
  padding: 0.75rem 1.25rem;
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

.confirm-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: #f59e0b;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
}

/* Animations */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.95) translateY(-10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .auto-save-indicator {
    order: -1;
    align-self: flex-start;
  }
}

/* 🔧 Styles pour le debug */
.debug-conditions {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.75rem;
  text-align: left;
}

.debug-conditions p {
  margin: 0.25rem 0;
  color: #0c4a6e;
}

.main-content {
  flex: 1;
  position: relative;
}

.debug-banner {
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-family: monospace;
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>