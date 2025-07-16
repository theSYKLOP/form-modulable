<!--
  FieldList.vue - Sidebar component for displaying available field templates and functions
  
  @description Displays a searchable list of field templates and functions that can be dragged
  or clicked to add to the form. Includes toggle between fields and functions view.
  
  @example
  <FieldList @add-field="onAddField" @open-function-modal="onOpenFunctionModal" />
-->
<template>
  <div class="field-list">    <!-- Toggle Mode Button -->
    <div class="field-list-mode-toggle">
      <button
        @click="toggleMode"
        class="mode-toggle-btn"
        :class="{ 'mode-toggle-btn--functions': currentMode === 'functions' }"
      >
        <div class="mode-toggle-indicator">
          <Icon
            :name="currentMode === 'fields' ? 'i-heroicons-rectangle-stack' : 'i-heroicons-wrench-screwdriver'"
            class="mode-toggle-icon"
          />
        </div>
        <div class="mode-toggle-content">
          <span class="mode-toggle-title">
            {{ currentMode === 'fields' ? 'Champs' : 'Fonctions' }}
          </span>
          <span class="mode-toggle-subtitle">
            {{ currentMode === 'fields' ? 'Basculer vers les fonctions' : 'Basculer vers les champs' }}
          </span>
        </div>
        <Icon name="i-heroicons-arrow-path" class="mode-toggle-switch-icon" />
      </button>
    </div>

    <!-- Search input -->
    <div class="field-list-search">
      <div class="relative">
        <Icon
          name="i-heroicons-magnifying-glass"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
        />
        <input
          v-model="search"
          type="text"
          :placeholder="currentMode === 'fields' ? 'Rechercher un champ...' : 'Rechercher une fonction...'"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <button
          v-if="search"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Icon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
      </div>
    </div>    <!-- Loading state -->
    <div v-if="loading" class="field-list-loading">
      <Icon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-blue-600 mx-auto" />
      <p class="text-sm text-gray-600 text-center mt-2">
        {{ currentMode === 'fields' ? 'Chargement des champs...' : 'Chargement des fonctions...' }}
      </p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="field-list-error">
      <Icon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-500 mx-auto" />
      <p class="text-sm text-red-600 text-center mt-2">{{ error }}</p>
      <button
        @click="retryLoad"
        class="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Réessayer
      </button>
    </div>

    <!-- Content based on current mode -->
    <div v-else class="field-list-content">
      <!-- Fields view -->
      <div v-if="currentMode === 'fields'" class="fields-view">
        <div
          v-for="(categoryTemplates, category) in groupedTemplates"
          :key="category"
          class="field-category"
        >
          <!-- Category header -->
          <button
            @click="toggleCategory(category)"
            class="field-category-header"
            :class="{ 'field-category-header--collapsed': collapsedCategories.includes(category) }"
          >
            <Icon
              name="i-heroicons-chevron-down"
              class="field-category-icon"
              :class="{ 'rotate-180': !collapsedCategories.includes(category) }"
            />
            <span class="field-category-title">{{ category }}</span>
            <span class="field-category-count">({{ categoryTemplates.length }})</span>
          </button>

          <!-- Category content -->
          <div
            v-if="!collapsedCategories.includes(category)"
            class="field-category-content"
          >
            <!-- Draggable field list -->
            <draggable
              :list="categoryTemplates"
              :group="{ name: 'form-fields', pull: 'clone', put: false }"
              :clone="cloneTemplate"
              :sort="false"
              item-key="type"
              class="field-template-list"
              @start="onDragStart"
              @end="onDragEnd"
            >
              <template #item="{ element: template }">
                <div
                  class="field-template-item"
                  :class="{ 'field-template-item--dragging': isDragging }"
                >
                  <!-- Template icon -->
                  <div class="field-template-icon">
                    <Icon
                      :name="template.icon || 'i-heroicons-rectangle-stack'"
                      class="w-5 h-5 text-gray-600"
                    />
                  </div>

                  <!-- Template info -->
                  <div class="field-template-info">
                    <h4 class="field-template-title">{{ template.label }}</h4>
                    <p class="field-template-description">{{ getTemplateDescription(template) }}</p>
                  </div>

                  <!-- Add button -->
                  <button
                    @click.stop="addField(template)"
                    class="field-template-add-btn"
                    :title="`Ajouter ${template.label}`"
                  >
                    <Icon name="i-heroicons-plus" class="w-4 h-4" />
                  </button>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <!-- No results message for fields -->
        <div v-if="Object.keys(groupedTemplates).length === 0" class="field-list-empty">
          <Icon name="i-heroicons-inbox" class="w-12 h-12 text-gray-400 mx-auto" />
          <p class="text-sm text-gray-600 text-center mt-3">
            {{ search ? 'Aucun champ trouvé' : 'Aucun champ disponible' }}
          </p>
          <button
            v-if="search"
            @click="clearSearch"
            class="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Effacer la recherche
          </button>
        </div>
      </div>

      <!-- Functions view -->
      <div v-else-if="currentMode === 'functions'" class="functions-view">
        <FunctionList
          :search="search"
          @function-dropped="onFunctionDropped"
        />
      </div>
    </div>    <!-- Quick actions -->
    <div class="field-list-actions">
      <button
        v-if="currentMode === 'fields'"
        @click="expandAllCategories"
        class="field-list-action-btn"
      >
        <Icon name="i-heroicons-chevron-double-down" class="w-4 h-4 mr-2" />
        Tout développer
      </button>
      <button
        v-if="currentMode === 'fields'"
        @click="collapseAllCategories"
        class="field-list-action-btn"
      >
        <Icon name="i-heroicons-chevron-double-up" class="w-4 h-4 mr-2" />
        Tout réduire
      </button>
      <button
        v-if="currentMode === 'functions'"
        @click="clearSearch"
        class="field-list-action-btn"
      >
        <Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
        Réinitialiser la recherche
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import type { FieldTemplate } from '~/types/form'
import draggable from 'vuedraggable'
import FunctionList from './FunctionList.vue'

/**
 * FieldList - Sidebar component for field templates and functions
 * 
 * @component
 * @example
 * <FieldList @add-field="onAddField" @open-function-modal="onOpenFunctionModal" />
 */
export default {
  name: 'FieldList',

  components: {
    draggable,
    FunctionList
  },

  emits: ['add-field', 'open-function-modal'],

  data() {
    return {
      /** Search query */
      search: '' as string,
      /** Collapsed categories */
      collapsedCategories: [] as string[],
      /** Drag state */
      isDragging: false as boolean,
      /** Current view mode: 'fields' or 'functions' */
      currentMode: 'fields' as 'fields' | 'functions'
    }
  },

  computed: {
    /**
     * Field templates from Vuex store
     */
    templates(): FieldTemplate[] {
      return this.$store.state.fields.templates || []
    },

    /**
     * Loading state from store
     */
    loading(): boolean {
      return this.$store.state.fields.loading
    },

    /**
     * Error state from store
     */
    error(): string | null {
      return this.$store.state.fields.error
    },

    /**
     * Filtered templates based on search
     */
    filteredTemplates(): FieldTemplate[] {
      if (!this.search) return this.templates

      const query = this.search.toLowerCase()
      return this.templates.filter(template =>
        template.label.toLowerCase().includes(query) ||
        template.name.toLowerCase().includes(query) ||
        template.type.toLowerCase().includes(query)
      )
    },

    /**
     * Templates grouped by category
     */
    groupedTemplates(): Record<string, FieldTemplate[]> {
      const categories = {
        'Saisie': ['text', 'email', 'password', 'number', 'tel', 'url', 'textarea'],
        'Sélection': ['select', 'radio', 'checkbox'],
        'Date et heure': ['date', 'datetime-local'],
        'Fichiers': ['file'],
        'Contrôles': ['switch', 'range']
      }

      const result: Record<string, FieldTemplate[]> = {}

      for (const [category, types] of Object.entries(categories)) {
        const categoryTemplates = this.filteredTemplates.filter(template =>
          types.includes(template.type)
        )
        
        if (categoryTemplates.length > 0) {
          result[category] = categoryTemplates
        }
      }

      return result
    }
  },

  mounted() {
    this.loadTemplates()
  },

  methods: {
    // === GESTION DES TEMPLATES DE CHAMPS (API) ===
    
    /**
     * Charger les templates de champs depuis l'API
     */
    async loadFieldTemplates(): Promise<void> {
      try {
        this.loading = true
        this.error = null
        
        const response = await $fetch('/api/field-templates')
        if (response.success && response.data.templates) {
          this.$emit('templates-loaded', response.data.templates)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des templates:', error)
        this.error = 'Impossible de charger les templates de champs'
      } finally {
        this.loading = false
      }
    },

    /**
     * Charger les champs existants d'un formulaire
     */
    async loadFormFields(formId: string): Promise<void> {
      try {
        const response = await $fetch(`/api/forms/${formId}/fields`)
        if (response.success && response.data.fields) {
          this.$emit('fields-loaded', response.data.fields)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des champs:', error)
      }
    },

    /**
     * Load field templates (méthode existante mise à jour)
     */
    async loadTemplates(): Promise<void> {
      try {
        // Utiliser la nouvelle méthode API
        await this.loadFieldTemplates()
        
        // Fallback vers le store si nécessaire
        if (!this.loading && this.error) {
          await this.$store.dispatch('fields/loadTemplates')
        }
      } catch (error) {
        console.error('Failed to load field templates:', error)
      }
    },

    /**
     * Retry loading templates
     */
    async retryLoad(): Promise<void> {
      await this.loadTemplates()
    },    /**
     * Add field to form
     */
    addField(template: FieldTemplate): void {
      this.$emit('add-field', template)
    },

    /**
     * Toggle between fields and functions view
     */
    toggleMode(): void {
      this.currentMode = this.currentMode === 'fields' ? 'functions' : 'fields'
      // Clear search when switching modes
      this.search = ''
    },

    /**
     * Handle function dropped from FunctionList
     */
    onFunctionDropped(functionData: any): void {
      // Emit event to parent (FormBuilder) to open the function configuration modal
      this.$emit('open-function-modal', functionData)
    },/**
     * Clone template for dragging
     */
    cloneTemplate(template: FieldTemplate): FieldTemplate {
      console.log('Cloning template:', template) // Debug log
      return {
        ...template,
        // On garde le template tel quel pour FieldList
        // La conversion en StepFormField se fera dans FormBuilder
      }
    },

    /**
     * Handle drag start
     */
    onDragStart(): void {
      console.log('Drag start in FieldList') // Debug log
      this.isDragging = true
    },

    /**
     * Handle drag end
     */
    onDragEnd(): void {
      console.log('Drag end in FieldList') // Debug log
      this.isDragging = false
    },

    /**
     * Clear search input
     */
    clearSearch(): void {
      this.search = ''
    },

    /**
     * Toggle category collapse state
     */
    toggleCategory(category: string): void {
      const index = this.collapsedCategories.indexOf(category)
      if (index > -1) {
        this.collapsedCategories.splice(index, 1)
      } else {
        this.collapsedCategories.push(category)
      }
    },

    /**
     * Expand all categories
     */
    expandAllCategories(): void {
      this.collapsedCategories = []
    },

    /**
     * Collapse all categories
     */
    collapseAllCategories(): void {
      this.collapsedCategories = Object.keys(this.groupedTemplates)
    },

    /**
     * Get template description
     */
    getTemplateDescription(template: FieldTemplate): string {
      const descriptions: Record<string, string> = {
        'text': 'Champ de saisie libre',
        'email': 'Adresse email avec validation',
        'password': 'Mot de passe masqué',
        'number': 'Valeur numérique',
        'tel': 'Numéro de téléphone',
        'url': 'Adresse web avec validation',
        'textarea': 'Zone de texte multiligne',
        'select': 'Menu déroulant',
        'radio': 'Choix unique parmi plusieurs options',
        'checkbox': 'Choix multiple ou simple',
        'date': 'Sélecteur de date',
        'datetime-local': 'Date et heure',
        'file': 'Téléchargement de fichier',
        'switch': 'Interrupteur on/off',
        'range': 'Curseur de valeur'
      }

      return descriptions[template.type] || template.type
    }
  }
}
</script>

<style scoped>
.field-list {
  display: flex;
  flex-direction: column;
  height: 100%; /* CRITIQUE: Occupe toute la hauteur disponible */
  overflow: hidden; /* CRITIQUE: Empêche le débordement du container */
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Mode Toggle - Bouton de basculement moderne */
.field-list-mode-toggle {
  flex-shrink: 0;
  padding: 1.25rem 1.25rem 0 1.25rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 0.75rem 0.75rem 0 0;
}

.mode-toggle-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #ffffff 100%);
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.mode-toggle-btn:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%);
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.mode-toggle-btn--functions {
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border-color: #16a34a;
}

.mode-toggle-btn--functions:hover {
  background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
  border-color: #15803d;
}

.mode-toggle-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-radius: 0.5rem;
  margin-right: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.mode-toggle-btn--functions .mode-toggle-indicator {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
}

.mode-toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-toggle-btn:hover .mode-toggle-icon {
  transform: scale(1.1);
}

.mode-toggle-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.mode-toggle-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.mode-toggle-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.2;
  margin-top: 0.125rem;
}

.mode-toggle-switch-icon {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-toggle-btn:hover .mode-toggle-switch-icon {
  color: #6b7280;
  transform: rotate(90deg);
}

/* Search - Barre de recherche moderne */
.field-list-search {
  flex-shrink: 0; /* CRITIQUE: Empêche la compression */
  padding: 1.25rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 2px solid #e5e7eb;
  border-radius: 0.75rem 0.75rem 0 0;
  position: sticky; /* CRITIQUE: Reste fixe en haut */
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Loading and error states */
.field-list-loading,
.field-list-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

/* Content - Zone scrollable optimisée */
.field-list-content {
      flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 55vh;
    min-height: 0;
    padding: 1rem 1.25rem;
    position: relative;
}

/* Custom scrollbar moderne */
.field-list-content::-webkit-scrollbar {
  width: 8px;
}

.field-list-content::-webkit-scrollbar-track {
  background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 4px;
  margin: 0.5rem 0;
}

.field-list-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #3b82f6 0%, #1e40af 100%);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.field-list-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
  transform: scale(1.1);
}

/* Support Firefox */
.field-list-content {
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 #f1f5f9;
}

/* Categories */
.field-category {
  margin-bottom: 1rem;
}

.field-category-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  text-align: left;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.field-category-header:hover {
  background-color: #e5e7eb;
}

.field-category-header--collapsed {
  margin-bottom: 0;
}

.field-category-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  color: #6b7280;
  transition: transform 0.2s;
}

.field-category-icon.rotate-180 {
  transform: rotate(180deg);
}

.field-category-title {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field-category-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.field-category-content {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Template items */
.field-template-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-template-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.field-template-item:hover {
  border-color: #93c5fd;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.field-template-item:hover .field-template-add-btn {
  opacity: 1;
}

.field-template-item--dragging {
  opacity: 0.5;
}

.field-template-icon {
  flex-shrink: 0;
  margin-right: 0.75rem;
}

.field-template-info {
  flex: 1;
  min-width: 0;
}

.field-template-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-template-description {
  font-size: 0.75rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-template-add-btn {
  flex-shrink: 0;
  margin-left: 0.5rem;
  padding: 0.25rem;
  color: #9ca3af;
  border-radius: 0.25rem;
  opacity: 0;
  transition: all 0.2s;
  border: none;
  background: none;
  cursor: pointer;
}

.field-template-add-btn:hover {
  color: #2563eb;
  background-color: #eff6ff;
}

/* Empty state */
.field-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

/* Actions - Design moderne et fixe en bas */
.field-list-actions {
  flex-shrink: 0;
    margin-top: auto;
    padding: 1.25rem;
    width: 320px;
    border-top: 2px solid #e5e7eb;
    border-radius: 0 0 0.75rem 0.75rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    display: flex
;
    flex-direction: column;
    gap: 0.75rem;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 10;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08), 0 -2px 6px rgba(0, 0, 0, 0.04);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.field-list-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 48px; /* Touch target accessible */
  text-decoration: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Effet shimmer au hover */
.field-list-action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.12) 50%, 
    transparent 100%
  );
  transition: left 0.6s ease;
}

.field-list-action-btn:hover {
  color: #1f2937;
  background: linear-gradient(135deg, #dbeafe 0%, #ffffff 100%);
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 
    0 6px 16px rgba(59, 130, 246, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.field-list-action-btn:hover::before {
  left: 100%;
}

.field-list-action-btn:hover .w-4 {
  transform: scale(1.1);
  color: #3b82f6;
}

.field-list-action-btn:active {
  transform: translateY(-1px);
  box-shadow: 
    0 3px 8px rgba(59, 130, 246, 0.2),
    0 1px 4px rgba(0, 0, 0, 0.15);
}

.field-list-action-btn:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 
    0 6px 16px rgba(59, 130, 246, 0.15),
    0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Icônes avec animation */
.field-list-action-btn .w-4 {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #6b7280;
}

/* Variantes de boutons pour différencier */
.field-list-action-btn:first-child {
  background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
  border-color: #d1fae5;
}

.field-list-action-btn:first-child:hover {
  background: linear-gradient(135deg, #dcfce7 0%, #ffffff 100%);
  border-color: #10b981;
  color: #065f46;
}

.field-list-action-btn:first-child:hover .w-4 {
  color: #10b981;
}

.field-list-action-btn:last-child {
  background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%);
  border-color: #fde68a;
}

.field-list-action-btn:last-child:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%);
  border-color: #f59e0b;
  color: #92400e;
}

.field-list-action-btn:last-child:hover .w-4 {
  color: #f59e0b;
}

/* Responsive pour mobile */
@media (max-width: 768px) {
  .field-list-actions {
    padding: 1rem;
    gap: 0.5rem;
  }
  
  .field-list-action-btn {
    padding: 1rem;
    font-size: 1rem;
    min-height: 56px;
  }
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  .field-list-action-btn,
  .field-list-action-btn::before,
  .field-list-action-btn .w-4 {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .field-list-action-btn {
    border-width: 3px;
    border-color: #374151;
  }
  
  .field-list-action-btn:hover {
    border-color: #000000;
    background: #ffffff;
  }
}

</style>

