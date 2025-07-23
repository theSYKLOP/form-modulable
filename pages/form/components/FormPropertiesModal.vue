<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <h3 class="modal-title">
          <Icon name="heroicons:cog-6-tooth" class="title-icon" />
          Propriétés du formulaire
        </h3>
        <button @click="closeModal" class="close-button">
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Icône du formulaire -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="heroicons:photo" class="label-icon" />
            Icône du formulaire
          </label>
          <div class="icon-selector">
            <div class="current-icon-display">
              <Icon :name="localFormData.icon" class="current-icon" />
              <span class="current-icon-name">{{ localFormData.icon }}</span>
            </div>
            <div class="icon-grid">
              <button
                v-for="iconOption in iconOptions"
                :key="iconOption.name"
                @click="selectIcon(iconOption.name)"
                class="icon-option"
                :class="{ active: localFormData.icon === iconOption.name }"
                :title="iconOption.label"
              >
                <Icon :name="iconOption.name" class="icon-preview" />
              </button>
            </div>
          </div>
        </div>

        <!-- Titre du formulaire -->
        <div class="form-group">
          <label for="form-title" class="form-label">
            <Icon name="heroicons:tag" class="label-icon" />
            Titre du formulaire
          </label>
          <input
            id="form-title"
            v-model="localFormData.title"
            type="text"
            class="form-input"
            placeholder="Entrez le titre du formulaire"
            maxlength="100"
          />
          <div class="input-help">
            {{ localFormData.title.length }}/100 caractères
          </div>
        </div>

        <!-- Description du formulaire -->
        <div class="form-group">
          <label for="form-description" class="form-label">
            <Icon name="heroicons:document-text" class="label-icon" />
            Description du formulaire
          </label>
          <textarea
            id="form-description"
            v-model="localFormData.description"
            class="form-textarea"
            placeholder="Décrivez brièvement votre formulaire (optionnel)"
            rows="3"
            maxlength="500"
          ></textarea>
          <div class="input-help">
            {{ (localFormData.description || '').length }}/500 caractères
          </div>
        </div>

        <!-- Aperçu -->
        <div class="form-group">
          <label class="form-label">
            <Icon name="heroicons:eye" class="label-icon" />
            Aperçu
          </label>
          <div class="preview-card">
            <div class="preview-header">
              <Icon :name="localFormData.icon" class="preview-icon" />
              <div class="preview-content">
                <h4 class="preview-title">{{ localFormData.title || 'Titre du formulaire' }}</h4>
                <p class="preview-description">
                  {{ localFormData.description || 'Description du formulaire' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="closeModal" class="cancel-button">
          Annuler
        </button>
        <button @click="saveChanges" class="save-button" :disabled="!isFormValid">
          <Icon name="heroicons:check" class="w-4 h-4" />
          Sauvegarder
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface FormData {
  title: string
  description: string
  icon: string
}

interface Props {
  isOpen: boolean
  formData: FormData
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: FormData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Données locales pour l'édition
const localFormData = ref<FormData>({
  title: '',
  description: '',
  icon: 'heroicons:document-text'
})

// Options d'icônes populaires
const iconOptions = [
  { name: 'heroicons:document-text', label: 'Document' },
  { name: 'heroicons:clipboard-document-list', label: 'Formulaire' },
  { name: 'heroicons:pencil-square', label: 'Édition' },
  { name: 'heroicons:user', label: 'Utilisateur' },
  { name: 'heroicons:users', label: 'Utilisateurs' },
  { name: 'heroicons:building-office', label: 'Bureau' },
  { name: 'heroicons:envelope', label: 'Email' },
  { name: 'heroicons:phone', label: 'Téléphone' },
  { name: 'heroicons:calendar', label: 'Calendrier' },
  { name: 'heroicons:clock', label: 'Horloge' },
  { name: 'heroicons:map-pin', label: 'Localisation' },
  { name: 'heroicons:heart', label: 'Cœur' },
  { name: 'heroicons:star', label: 'Étoile' },
  { name: 'heroicons:gift', label: 'Cadeau' },
  { name: 'heroicons:shopping-cart', label: 'Panier' },
  { name: 'heroicons:credit-card', label: 'Carte de crédit' },
  { name: 'heroicons:banknotes', label: 'Argent' },
  { name: 'heroicons:academic-cap', label: 'Éducation' },
  { name: 'heroicons:beaker', label: 'Recherche' },
  { name: 'heroicons:chart-bar', label: 'Graphique' },
  { name: 'heroicons:cog-6-tooth', label: 'Paramètres' },
  { name: 'heroicons:shield-check', label: 'Sécurité' },
  { name: 'heroicons:key', label: 'Clé' },
  { name: 'heroicons:globe-alt', label: 'Globe' }
]

// Validation du formulaire
const isFormValid = computed(() => {
  return localFormData.value.title.trim().length > 0
})

// Fonctions
const selectIcon = (iconName: string) => {
  localFormData.value.icon = iconName
}

const closeModal = () => {
  emit('close')
}

const saveChanges = () => {
  if (isFormValid.value) {
    emit('save', { ...localFormData.value })
    closeModal()
  }
}

// Watcher pour synchroniser les données
watch(() => props.formData, (newData) => {
  if (newData) {
    localFormData.value = {
      title: newData.title || '',
      description: newData.description || '',
      icon: newData.icon || 'heroicons:document-text'
    }
  }
}, { immediate: true, deep: true })

// Écouter la touche Échap pour fermer
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

// Ajouter/supprimer l'écouteur d'événement
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
    // Empêcher le défilement en arrière-plan
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
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

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.title-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f3f4f6;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.label-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  ring: 2px;
  ring-color: #3b82f6;
  ring-opacity: 0.1;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.input-help {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

/* Sélecteur d'icônes */
.icon-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-icon-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.current-icon {
  width: 2rem;
  height: 2rem;
  color: #3b82f6;
}

.current-icon-name {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: #6b7280;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-option:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.icon-option.active {
  border-color: #3b82f6;
  background: #dbeafe;
  ring: 2px;
  ring-color: #3b82f6;
  ring-opacity: 0.2;
}

.icon-preview {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.icon-option.active .icon-preview {
  color: #3b82f6;
}

/* Aperçu */
.preview-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.preview-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
}

.preview-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.preview-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.cancel-button,
.save-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-button {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.cancel-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
  color: white;
}

.save-button:hover:not(:disabled) {
  background: #2563eb;
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 0.5rem;
  }
  
  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
  }
  
  .icon-option {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
