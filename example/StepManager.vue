<!--
  StepManager.vue - Component for managing form steps
  
  @description Provides interface for creating, editing, and managing form steps.
  Shows existing steps list and modal for adding/editing steps.
  
  @example
  <StepManager @step-added="onStepAdded" />
-->
<template>
  <div class="step-manager">
    <!-- Header with add button -->
    <div class="step-manager-header">
      <h3 class="step-manager-title">Étapes du formulaire</h3>
      <button
        @click="openModal"
        class="step-add-btn"
        title="Ajouter une étape"
      >
        <Icon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
        Ajouter une étape
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="step-manager-loading">
      <Icon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-blue-600 mx-auto" />
      <p class="text-sm text-gray-600 text-center mt-2">Chargement...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="step-manager-error">
      <Icon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-500 mx-auto" />
      <p class="text-sm text-red-600 text-center mt-2">{{ error }}</p>
    </div>

    <!-- Steps list -->
    <div v-else class="step-manager-content">
      <!-- Existing steps -->
      <div v-if="sortedSteps.length > 0" class="steps-list">
        <draggable
          v-model="sortedSteps"
          item-key="id"
          @end="onReorder"
          class="steps-draggable"
        >
          <template #item="{ element: step, index }">
            <div class="step-item">
              <!-- Drag handle -->
              <div class="step-drag-handle">
                <Icon name="i-heroicons-bars-3" class="w-4 h-4 text-gray-400" />
              </div>

              <!-- Step content -->
              <div class="step-content">
                <!-- Step header -->
                <div class="step-header">
                  <div class="step-info">
                    <Icon 
                      :name="step.icon || 'i-heroicons-document-text'" 
                      class="step-icon"
                    />
                    <div>
                      <h4 class="step-title">{{ step.title }}</h4>
                      <p v-if="step.description" class="step-description">
                        {{ step.description }}
                      </p>
                    </div>
                  </div>
                  <div class="step-order">
                    <span class="step-order-number">{{ step.order }}</span>
                  </div>
                </div>

                <!-- Step stats -->
                <div class="step-stats">
                  <span class="step-stat">
                    <Icon name="i-heroicons-rectangle-stack" class="w-3 h-3 mr-1" />
                    {{ getStepFieldCount(step.id) }} champ(s)
                  </span>
                </div>
              </div>

              <!-- Step actions -->
              <div class="step-actions">
                <button
                  @click="editStep(step)"
                  class="step-action-btn step-action-btn--edit"
                  title="Modifier l'étape"
                >
                  <Icon name="i-heroicons-pencil" class="w-4 h-4" />
                </button>
                <button
                  @click="duplicateStep(step)"
                  class="step-action-btn step-action-btn--duplicate"
                  title="Dupliquer l'étape"
                >
                  <Icon name="i-heroicons-document-duplicate" class="w-4 h-4" />
                </button>
                <button
                  @click="deleteStep(step.id)"
                  class="step-action-btn step-action-btn--delete"
                  title="Supprimer l'étape"
                  :disabled="sortedSteps.length === 1"
                >
                  <Icon name="i-heroicons-trash" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Empty state -->
      <div v-else class="steps-empty">
        <Icon name="i-heroicons-clipboard-document-list" class="w-12 h-12 text-gray-400 mx-auto" />
        <h4 class="text-lg font-medium text-gray-900 text-center mt-4">Aucune étape</h4>
        <p class="text-gray-600 text-center mt-2">
          Commencez par créer votre première étape de formulaire.
        </p>
        <button
          @click="openModal"
          class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          <Icon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
          Créer une étape
        </button>
      </div>
    </div>

    <!-- Step editor modal -->
    <div v-if="showModal" class="step-modal-overlay" @click="closeModal">
      <div class="step-modal" @click.stop>
        <!-- Modal header -->
        <div class="step-modal-header">
          <h3 class="step-modal-title">
            {{ isEditing ? 'Modifier l\'étape' : 'Nouvelle étape' }}
          </h3>
          <button
            @click="closeModal"
            class="step-modal-close"
          >
            <Icon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal content -->
        <div class="step-modal-content">
          <form @submit.prevent="saveStep" class="space-y-4">
            <!-- Title -->
            <div class="form-group">
              <label for="step-title" class="form-label">
                Titre de l'étape <span class="text-red-500">*</span>
              </label>
              <input
                id="step-title"
                v-model="draft.title"
                type="text"
                required
                placeholder="Ex: Informations personnelles"
                class="form-input"
              />
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="step-description" class="form-label">
                Description
              </label>
              <textarea
                id="step-description"
                v-model="draft.description"
                rows="3"
                placeholder="Description optionnelle de l'étape..."
                class="form-input"
              />
            </div>

            <!-- Icon -->
            <div class="form-group">
              <label for="step-icon" class="form-label">
                Icône
              </label>
              <div class="step-icon-selector">
                <div class="step-icon-preview">
                  <Icon
                    :name="draft.icon || 'i-heroicons-document-text'"
                    class="w-6 h-6 text-gray-600"
                  />
                </div>
                <select
                  id="step-icon"
                  v-model="draft.icon"
                  class="form-input flex-1"
                >
                  <option value="">Sélectionner une icône...</option>
                  <option value="i-heroicons-document-text">Document</option>
                  <option value="i-heroicons-user">Utilisateur</option>
                  <option value="i-heroicons-building-office">Bureau</option>
                  <option value="i-heroicons-envelope">Enveloppe</option>
                  <option value="i-heroicons-phone">Téléphone</option>
                  <option value="i-heroicons-map-pin">Localisation</option>
                  <option value="i-heroicons-credit-card">Carte de crédit</option>
                  <option value="i-heroicons-calendar">Calendrier</option>
                  <option value="i-heroicons-clock">Horloge</option>
                  <option value="i-heroicons-cog-6-tooth">Paramètres</option>
                  <option value="i-heroicons-check-circle">Validation</option>
                  <option value="i-heroicons-star">Étoile</option>
                </select>
              </div>
            </div>

            <!-- Order -->
            <div class="form-group">
              <label for="step-order" class="form-label">
                Ordre
              </label>
              <input
                id="step-order"
                v-model.number="draft.order"
                type="number"
                min="1"
                :max="maxOrder"
                class="form-input"
              />
              <p class="form-help">
                Position de l'étape dans le formulaire (1 = première étape)
              </p>
            </div>
          </form>
        </div>

        <!-- Modal footer -->
        <div class="step-modal-footer">
          <button
            type="button"
            @click="closeModal"
            class="step-modal-btn step-modal-btn--secondary"
          >
            Annuler
          </button>
          <button
            @click="saveStep"
            :disabled="!canSave"
            class="step-modal-btn step-modal-btn--primary"
          >
            <Icon v-if="saving" name="i-heroicons-arrow-path" class="w-4 h-4 mr-2 animate-spin" />
            {{ isEditing ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteConfirm" class="step-modal-overlay" @click="cancelDelete">
      <div class="step-modal step-modal--small" @click.stop>
        <div class="step-modal-header">
          <h3 class="step-modal-title">Confirmer la suppression</h3>
        </div>
        <div class="step-modal-content">
          <p class="text-gray-700">
            Êtes-vous sûr de vouloir supprimer cette étape ? 
            Cette action est irréversible et supprimera également tous les champs associés.
          </p>
        </div>
        <div class="step-modal-footer">
          <button
            @click="cancelDelete"
            class="step-modal-btn step-modal-btn--secondary"
          >
            Annuler
          </button>
          <button
            @click="confirmDelete"
            class="step-modal-btn step-modal-btn--danger"
          >
            <Icon name="i-heroicons-trash" class="w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { FormStep } from '~/types/form'
import draggable from 'vuedraggable'

/**
 * StepManager - Component for managing form steps
 * 
 * @component
 * @example
 * <StepManager @step-added="onStepAdded" />
 */
export default {
  name: 'StepManager',

  components: {
    draggable
  },

  emits: ['step-added', 'step-updated', 'step-deleted'],

  data() {
    return {
      /** Modal visibility */
      showModal: false as boolean,
      /** Delete confirmation modal */
      showDeleteConfirm: false as boolean,
      /** Step being deleted */
      deletingStepId: null as string | null,
      /** Draft step for editing */
      draft: {} as Partial<FormStep>,
      /** Editing mode */
      isEditing: false as boolean,
      /** Saving state */
      saving: false as boolean
    }
  },

  computed: {
    /**
     * Steps from Vuex store
     */
    steps(): FormStep[] {
      return this.$store.state.form.steps || []
    },    /**
     * Sorted steps by order
     */
    sortedSteps: {
      get(): FormStep[] {
        return [...this.steps].sort((a, b) => a.order - b.order)
      },
      set(value: FormStep[]) {
        // Update the order of each step based on its position in the array
        const reorderedSteps = value.map((step, index) => ({
          ...step,
          order: index + 1
        }))
        
        // Update the steps in the store
        this.$store.commit('form/SET_STEPS', reorderedSteps)
        
        // Persist the changes
        this.$store.dispatch('steps/reorderSteps', reorderedSteps).catch(error => {
          console.error('Failed to reorder steps:', error)
        })
      }
    },

    /**
     * Loading state from store
     */
    loading(): boolean {
      return this.$store.state.steps.loading
    },

    /**
     * Error state from store
     */
    error(): string | null {
      return this.$store.state.steps.error
    },

    /**
     * Form fields
     */
    formFields(): any[] {
      return this.$store.state.form.fields || []
    },

    /**
     * Maximum order for new step
     */
    maxOrder(): number {
      return this.steps.length + 1
    },

    /**
     * Can save step
     */
    canSave(): boolean {
      return Boolean(this.draft.title?.trim()) && !this.saving
    }
  },

  methods: {
    // === GESTION DES ÉTAPES (API) ===
    
    /**
     * Charger les étapes depuis l'API
     */
    async loadSteps(formId: string): Promise<void> {
      try {
        this.loading = true
        this.error = null
        
        const response = await $fetch(`/api/forms/${formId}/steps`)
        if (response.success && response.data.steps) {
          this.$emit('steps-loaded', response.data.steps)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des étapes:', error)
        this.error = 'Impossible de charger les étapes'
      } finally {
        this.loading = false
      }
    },

    /**
     * Créer une nouvelle étape via API
     */
    async createStepAPI(formId: string, stepData: any): Promise<void> {
      try {
        this.saving = true
        
        const response = await $fetch(`/api/forms/${formId}/steps`, {
          method: 'POST',
          body: stepData
        })
        
        if (response.success && response.data.step) {
          this.$emit('step-created', response.data.step)
          // Recharger les étapes pour avoir la liste à jour
          await this.loadSteps(formId)
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'étape:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Mettre à jour une étape via API
     */
    async updateStepAPI(formId: string, stepId: string, stepData: any): Promise<void> {
      try {
        this.saving = true
        
        const response = await $fetch(`/api/forms/${formId}/steps/${stepId}`, {
          method: 'PUT',
          body: stepData
        })
        
        if (response.success && response.data.step) {
          this.$emit('step-updated', response.data.step)
          // Recharger les étapes pour avoir la liste à jour
          await this.loadSteps(formId)
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'étape:', error)
        throw error
      } finally {
        this.saving = false
      }
    },

    /**
     * Supprimer une étape via API
     */
    async deleteStepAPI(formId: string, stepId: string): Promise<void> {
      try {
        const response = await $fetch(`/api/forms/${formId}/steps/${stepId}`, {
          method: 'DELETE'
        })
        
        if (response.success) {
          this.$emit('step-deleted', stepId)
          // Recharger les étapes pour avoir la liste à jour
          await this.loadSteps(formId)
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'étape:', error)
        throw error
      }
    },

    /**
     * Réorganiser les étapes via API
     */
    async reorderStepsAPI(formId: string, stepIds: string[]): Promise<void> {
      try {
        const response = await $fetch(`/api/forms/${formId}/steps/reorder`, {
          method: 'PATCH',
          body: { stepIds }
        })
        
        if (response.success) {
          this.$emit('steps-reordered', response.data.steps)
        }
      } catch (error) {
        console.error('Erreur lors de la réorganisation des étapes:', error)
        throw error
      }
    },

    /**
     * Open modal for new step
     */
    openModal(): void {
      this.isEditing = false
      this.draft = {
        title: '',
        description: '',
        icon: 'i-heroicons-document-text',
        order: this.steps.length + 1
      }
      this.showModal = true
    },

    /**
     * Close modal
     */
    closeModal(): void {
      this.showModal = false
      this.draft = {}
      this.isEditing = false
    },

    /**
     * Edit existing step
     */
    editStep(step: FormStep): void {
      this.isEditing = true
      this.draft = { ...step }
      this.showModal = true
    },

    /**
     * Save step (create or update)
     */
    async saveStep(): Promise<void> {
      if (!this.canSave) return

      try {
        this.saving = true

        const stepData: FormStep = {
          id: this.draft.id || this.generateStepId(),
          formId: this.getCurrentFormId(),
          title: this.draft.title!.trim(),
          description: this.draft.description?.trim() || '',
          order: this.draft.order || this.steps.length + 1,
          icon: this.draft.icon || 'i-heroicons-document-text'
        }

        if (this.isEditing) {
          await this.$store.dispatch('steps/saveStep', stepData)
          this.$emit('step-updated', stepData)
        } else {
          await this.$store.dispatch('steps/saveStep', stepData)
          ;this.$store.commit('form/ADD_STEP', stepData)
          this.$emit('step-added', stepData)
        }

        this.closeModal()
      } catch (error) {
        console.error('Failed to save step:', error)
      } finally {
        this.saving = false
      }
    },

    /**
     * Duplicate step
     */
    async duplicateStep(step: FormStep): Promise<void> {
      const duplicatedStep: FormStep = {
        ...step,
        id: this.generateStepId(),
        title: `${step.title} (Copie)`,
        order: this.steps.length + 1
      }

      try {
        await this.$store.dispatch('steps/saveStep', duplicatedStep)
        ;this.$store.commit('form/ADD_STEP', duplicatedStep)
        this.$emit('step-added', duplicatedStep)
      } catch (error) {
        console.error('Failed to duplicate step:', error)
      }
    },

    /**
     * Delete step
     */
    deleteStep(stepId: string): void {
      this.deletingStepId = stepId
      this.showDeleteConfirm = true
    },

    /**
     * Confirm step deletion
     */
    async confirmDelete(): Promise<void> {
      if (!this.deletingStepId) return

      try {
        await this.$store.dispatch('steps/deleteStep', this.deletingStepId)
        
        // Remove step from form
        const stepIndex = this.steps.findIndex(s => s.id === this.deletingStepId)
        if (stepIndex !== -1) {
          this.$store.commit('form/REMOVE_STEP', stepIndex)
        }

        // Remove associated fields
        const fieldsToRemove = this.formFields.filter(f => f.stepId === this.deletingStepId)
        fieldsToRemove.forEach(field => {
          const fieldIndex = this.formFields.findIndex(f => f.id === field.id)
          if (fieldIndex !== -1) {
            this.$store.commit('form/REMOVE_FIELD', fieldIndex)
          }
        })

        this.$emit('step-deleted', this.deletingStepId)
        this.cancelDelete()
      } catch (error) {
        console.error('Failed to delete step:', error)
      }
    },

    /**
     * Cancel step deletion
     */
    cancelDelete(): void {
      this.showDeleteConfirm = false
      this.deletingStepId = null
    },

    /**
     * Handle steps reorder
     */
    async onReorder(event: any): Promise<void> {
      // Update step orders
      const reorderedSteps = this.sortedSteps.map((step, index) => ({
        ...step,
        order: index + 1
      }))

      try {
        await this.$store.dispatch('steps/reorderSteps', reorderedSteps)
        
        // Update steps in form store
        ;this.$store.commit('form/SET_STEPS', reorderedSteps)
      } catch (error) {
        console.error('Failed to reorder steps:', error)
      }
    },

    /**
     * Get field count for step
     */
    getStepFieldCount(stepId: string): number {
      return this.formFields.filter(field => field.stepId === stepId).length
    },

    /**
     * Generate unique step ID
     */
    generateStepId(): string {
      return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    /**
     * Get current form ID
     */
    getCurrentFormId(): string {
      const config = this.$store.state.form.config
      return config?.id || 'default_form'
    }
  }
}
</script>

<style scoped>
.step-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header */
.step-manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.step-manager-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
}

.step-add-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #2563eb;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.step-add-btn:hover {
  background-color: #1d4ed8;
}

.step-add-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px #2563eb, 0 0 0 4px rgba(37, 99, 235, 0.2);
}

/* Loading and error states */
.step-manager-loading,
.step-manager-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

/* Content */
.step-manager-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.25rem;
}

/* Custom scrollbar for better design consistency */
.step-manager-content::-webkit-scrollbar {
  width: 6px;
}

.step-manager-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.step-manager-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.step-manager-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Steps list */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.steps-draggable {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step-item {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: border-color 0.2s ease-in-out;
}

.step-item:hover {
  border-color: #d1d5db;
}

.step-drag-handle {
  flex-shrink: 0;
  margin-right: 0.75rem;
  cursor: move;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.step-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.step-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.step-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-description {
  font-size: 0.75rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 0.25rem;
}

.step-order {
  flex-shrink: 0;
  margin-left: 0.75rem;
}

.step-order-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  background-color: #f3f4f6;
  border-radius: 50%;
}

.step-stats {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
}

.step-stat {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.step-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.75rem;
}

.step-action-btn {
  padding: 0.25rem;
  color: #9ca3af;
  border-radius: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.step-action-btn:hover {
  color: #6b7280;
}

.step-action-btn--edit:hover {
  color: #2563eb;
  background-color: #eff6ff;
}

.step-action-btn--duplicate:hover {
  color: #059669;
  background-color: #ecfdf5;
}

.step-action-btn--delete:hover {
  color: #dc2626;
  background-color: #fef2f2;
}

.step-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty state */
.steps-empty {
  text-align: center;
  padding: 3rem 0;
}

/* Modal */
.step-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.step-modal {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 28rem;
  width: 100%;
  margin: 0 1rem;
}

.step-modal--small {
  max-width: 24rem;
}

.step-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.step-modal-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
}

.step-modal-close {
  color: #9ca3af;
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
}

.step-modal-close:hover {
  color: #6b7280;
}

.step-modal-content {
  padding: 1.5rem;
}

.step-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.step-modal-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.step-modal-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.step-modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-modal-btn--primary {
  color: #ffffff;
  background-color: #2563eb;
}

.step-modal-btn--primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.step-modal-btn--secondary {
  color: #374151;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
}

.step-modal-btn--secondary:hover:not(:disabled) {
  background-color: #f9fafb;
}

.step-modal-btn--danger {
  color: #ffffff;
  background-color: #dc2626;
}

.step-modal-btn--danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

/* Form elements */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  display: block;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-help {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.step-icon-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.step-icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
}
</style>

