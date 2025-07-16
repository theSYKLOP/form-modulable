<template>
  <div class="form-builder-page">
    <div class="page-header">
      <h1>Constructeur de formulaires</h1>
      <div class="header-actions">
        <button @click="saveForm" class="save-btn" :disabled="loading">
          <Icon name="i-heroicons-cloud-arrow-up" />
          Sauvegarder
        </button>
        <button @click="previewForm" class="preview-btn">
          <Icon name="i-heroicons-eye" />
          Aperçu
        </button>
      </div>
    </div>

    <FormCanvas />

    <!-- Loading -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <Icon name="i-heroicons-arrow-path" class="animate-spin" />
        Sauvegarde en cours...
      </div>
    </div>

    <!-- Success message -->
    <div v-if="showSuccess" class="success-message">
      <Icon name="i-heroicons-check-circle" />
      Formulaire sauvegardé !
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormCanvas from './components/FormCanvas.vue'
import { useFormBuilder } from './composables/useFormBuilder'

const { formConfig, saveForm: saveFormConfig } = useFormBuilder()

const loading = ref(false)
const showSuccess = ref(false)

const saveForm = async () => {
  loading.value = true
  try {
    await saveFormConfig()
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Erreur de sauvegarde:', error)
  } finally {
    loading.value = false
  }
}

const previewForm = () => {
  // Ouvrir l'aperçu dans un nouvel onglet
  const previewUrl = `/form/preview?config=${encodeURIComponent(JSON.stringify(formConfig.value))}`
  window.open(previewUrl, '_blank')
}
</script>

<style scoped>
.form-builder-page {
  min-height: 100vh;
  background: #f8fafc;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.save-btn,
.preview-btn {
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
}

.save-btn {
  background: #3b82f6;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preview-btn {
  background: #10b981;
  color: white;
}

.preview-btn:hover {
  background: #059669;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 0.5rem;
  color: #374151;
}

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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

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
</style>