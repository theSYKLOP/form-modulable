<template>
  <div class="form-builder-page">
    <!-- Header optimisé -->
    <div class="page-header">
      <div class="title-section">
        <h1 class="page-title">
          <input 
            v-if="isEditingTitle"
            ref="titleInput"
            v-model="editableTitle"
            @blur="debouncedSaveTitle"
            @keydown.enter="debouncedSaveTitle"
            class="title-input"
          />
          <span 
            v-else
            @dblclick="startEditTitle"
            class="title-text"
          >
            {{ formConfig?.title || 'Constructeur de formulaire' }}
          </span>
        </h1>
      </div>
      
      <!-- Actions optimisées -->
      <div class="header-actions">
        <button 
          @click="debouncedSave"
          :disabled="isSaving"
          class="btn-save"
        >
          {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder' }}
        </button>
      </div>
    </div>

    <!-- Contenu principal avec lazy loading conditionnel -->
    <div class="main-content">
      <div v-if="isFormReady" class="builder-content">
        <!-- Mode construction -->
        <div v-if="!isPreviewMode" class="builder-mode">
          <LazyFormCanvas 
            v-if="showCanvas"
            :form-config="formConfig"
            @field-select="onFieldSelect"
          />
          <LazyStepNavigation 
            v-if="showStepNavigation"
            :steps="formConfig.steps"
            @step-change="onStepChange"
          />
        </div>
        
        <!-- Mode prévisualisation -->
        <LazyFormPreview 
          v-else-if="isPreviewMode && previewFormConfig"
          :form-config="previewFormConfig"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePerformance } from '~/composables/core/usePerformance'
import { useFormBuilder } from './composables/useFormBuilder'

// ✅ Intégration des optimisations
const { 
  lazyComponent, 
  useOptimizedDebounce, 
  measurePerformance,
  useMemoryCache
} = usePerformance();

// ✅ Composants lazy conditionnels
const LazyFormCanvas = lazyComponent(() => import('./components/FormCanvas.vue'));
const LazyStepNavigation = lazyComponent(() => import('./components/StepNavigation.vue'));
const LazyFormPreview = lazyComponent(() => import('./components/FormPreview.vue'));

// ✅ Cache pour les brouillons
const draftCache = useMemoryCache('form-draft', 60000); // 1 minute

// États existants du FormBuilder
const { 
  formConfig, 
  saveToDatabase, 
  loadForm,
  isSaving,
  // ... autres exports
} = useFormBuilder();

// États de l'interface
const isEditingTitle = ref(false);
const editableTitle = ref('');
const showCanvas = ref(false);
const showStepNavigation = ref(false);

// ✅ Variables manquantes pour le template
const route = useRoute();
const isFormReady = computed(() => !!formConfig.value);
const isPreviewMode = ref(false);
const previewFormConfig = computed(() => formConfig.value);

// ✅ Fonctions manquantes pour le template
const onFieldSelect = (field) => {
  console.log('Field selected:', field);
};

const onStepChange = (step) => {
  console.log('Step changed:', step);
};

const startEditTitle = () => {
  isEditingTitle.value = true;
  editableTitle.value = formConfig.value?.title || '';
  nextTick(() => {
    const input = document.querySelector('.title-input');
    if (input) input.focus();
  });
};

// ✅ Sauvegarde optimisée avec debounce
const debouncedSave = useOptimizedDebounce(async () => {
  await measurePerformance('Form Save', async () => {
    await saveToDatabase();
  });
}, 1000); // 1 seconde de délai

// ✅ Sauvegarde du titre optimisée
const debouncedSaveTitle = useOptimizedDebounce(async () => {
  if (editableTitle.value.trim()) {
    formConfig.value.title = editableTitle.value.trim();
    isEditingTitle.value = false;
    
    // Sauvegarder en brouillon immédiatement
    draftCache.set(formConfig.value);
    
    // Puis sauvegarder en base avec délai
    await debouncedSave();
  }
}, 500);

// ✅ Chargement conditionnel des composants
watch(() => formConfig.value, (newConfig) => {
  if (newConfig) {
    // Charger les composants seulement quand nécessaire
    nextTick(() => {
      showCanvas.value = !isPreviewMode.value;
      showStepNavigation.value = newConfig.steps?.length > 1;
    });
  }
});

// ✅ Chargement optimisé du formulaire
onMounted(async () => {
  const formId = route.query.id;
  
  if (formId && formId !== 'new') {
    await measurePerformance('Form Load', async () => {
      await loadForm(formId);
    });
  }
});

// Reste de votre code...
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

.title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.page-title svg {
  width: 1.75rem;
  height: 1.75rem;
}

.title-text {
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  border: 2px solid transparent;
  position: relative;
}

.title-text:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.title-text:hover::before {
  content: "✏️";
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  font-size: 0.875rem;
  opacity: 0.8;
}

.title-text:hover::after {
  content: "Double-cliquez pour modifier";
  position: absolute;
  bottom: -1.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: normal;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  backdrop-filter: blur(5px);
}

.title-input {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: white;
  outline: none;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  min-width: 300px;
}

.title-input:focus {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
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

.new-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.new-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #9ca3af;
}

.new-btn:disabled:hover {
  background: #9ca3af;
  transform: none;
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