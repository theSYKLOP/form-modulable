<!--
  FunctionList.vue - Liste des fonctions applicables aux champs de formulaire
  
  @description Affiche une liste de fonctions que l'utilisateur peut glisser-déposer
  sur les champs pour ajouter des fonctionnalités (API, validation, etc.)
  
  @example
  <FunctionList @function-dropped="onFunctionDropped" />
-->
<template>
  <div class="function-list">
    <!-- Header -->
    <div class="function-list-header">
      <div class="header-content">
        <h3 class="function-list-title">
          <Icon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
          Fonctions
        </h3>
        <p class="function-list-description">
          Glissez les fonctions vers les champs pour les configurer
        </p>
      </div>
    </div>

    <!-- Contenu scrollable -->
    <div class="function-list-content">
      <!-- Catégorie API -->
      <div class="function-category">
        <button
          @click="toggleCategory('api')"
          class="category-header"
          :class="{ 'category-header--collapsed': !categoriesExpanded.api }"
        >
          <Icon 
            name="i-heroicons-chevron-down" 
            class="category-icon"
            :class="{ 'rotate-180': categoriesExpanded.api }"
          />
          <Icon name="i-heroicons-globe-alt" class="w-4 h-4" />
          <span class="category-title">API & Données</span>
          <span class="category-count">{{ apiFunctions.length }}</span>
        </button>

        <div v-show="categoriesExpanded.api" class="category-content">
          <draggable
            v-model="apiFunctions"
            :group="{ name: 'functions', pull: 'clone', put: false }"
            :sort="false"
            class="function-template-list"
            item-key="id"
            @end="onFunctionDrop"
          >
            <template #item="{ element }">
              <div 
                class="function-template-item"
                :data-function-id="element.id"
                @click="previewFunction(element)"
              >
                <div class="function-template-icon">
                  <Icon :name="element.icon" class="w-5 h-5" />
                </div>
                <div class="function-template-info">
                  <h5 class="function-template-title">{{ element.title }}</h5>
                  <p class="function-template-description">{{ element.description }}</p>
                  <div class="function-template-tags">
                    <span 
                      v-for="tag in element.tags" 
                      :key="tag"
                      class="function-tag"
                      :class="getTagColor(tag)"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div class="function-template-actions">
                  <Icon name="i-heroicons-information-circle" class="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Catégorie Validation (pour l'avenir) -->
      <div class="function-category">
        <button
          @click="toggleCategory('validation')"
          class="category-header"
          :class="{ 'category-header--collapsed': !categoriesExpanded.validation }"
        >
          <Icon 
            name="i-heroicons-chevron-down" 
            class="category-icon"
            :class="{ 'rotate-180': categoriesExpanded.validation }"
          />
          <Icon name="i-heroicons-shield-check" class="w-4 h-4" />
          <span class="category-title">Validation</span>
          <span class="category-count">0</span>
        </button>

        <div v-show="categoriesExpanded.validation" class="category-content">
          <div class="function-template-list">
            <div class="function-template-item function-template-item--disabled">
              <div class="function-template-icon">
                <Icon name="i-heroicons-check-circle" class="w-5 h-5" />
              </div>
              <div class="function-template-info">
                <h5 class="function-template-title">Validation personnalisée</h5>
                <p class="function-template-description">Bientôt disponible</p>
                <div class="function-template-tags">
                  <span class="function-tag function-tag--coming-soon">Prochainement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Catégorie Logique (pour l'avenir) -->
      <div class="function-category">
        <button
          @click="toggleCategory('logic')"
          class="category-header"
          :class="{ 'category-header--collapsed': !categoriesExpanded.logic }"
        >
          <Icon 
            name="i-heroicons-chevron-down" 
            class="category-icon"
            :class="{ 'rotate-180': categoriesExpanded.logic }"
          />
          <Icon name="i-heroicons-bolt" class="w-4 h-4" />
          <span class="category-title">Logique</span>
          <span class="category-count">0</span>
        </button>

        <div v-show="categoriesExpanded.logic" class="category-content">
          <div class="function-template-list">
            <div class="function-template-item function-template-item--disabled">
              <div class="function-template-icon">
                <Icon name="i-heroicons-puzzle-piece" class="w-5 h-5" />
              </div>
              <div class="function-template-info">
                <h5 class="function-template-title">Logique conditionnelle</h5>
                <p class="function-template-description">Bientôt disponible</p>
                <div class="function-template-tags">
                  <span class="function-tag function-tag--coming-soon">Prochainement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions en bas -->
    <div class="function-list-actions">
      <button class="function-list-action-btn" disabled>
        <Icon name="i-heroicons-plus" class="w-4 h-4" />
        Créer une fonction
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable'
import type { ApiConfig } from '~/types/form'

interface FunctionTemplate {
  id: string
  type: 'api-route' | 'validation' | 'logic'
  title: string
  description: string
  icon: string
  tags: string[]
  config: Partial<ApiConfig> | any
  targetTypes?: string[] // Types de champs compatibles
}

export default {
  name: 'FunctionList',
  components: {
    draggable
  },
  emits: ['function-dropped', 'preview-function'],
  data() {
    return {
      categoriesExpanded: {
        api: true,
        validation: false,
        logic: false
      },
      apiFunctions: [
        {
          id: 'api-dynamic-options',
          type: 'api-route',
          title: 'Options dynamiques',
          description: 'Charger les options depuis une API pour les champs select/multiselect',
          icon: 'i-heroicons-arrow-path',
          tags: ['GET', 'Select', 'Multiselect'],
          targetTypes: ['select', 'multiselect', 'radio', 'checkbox'],
          config: {
            method: 'GET',
            endpoint: '/api/options',
            headers: {},
            params: {}
          }
        },
        {
          id: 'api-validation',
          type: 'api-route', 
          title: 'Validation en temps réel',
          description: 'Valider les données via API (unicité email, vérification code, etc.)',
          icon: 'i-heroicons-shield-check',
          tags: ['POST', 'Validation', 'Temps réel'],
          targetTypes: ['text', 'email', 'tel', 'number'],
          config: {
            method: 'POST',
            endpoint: '/api/validate',
            headers: {},
            params: {}
          }
        },
        {
          id: 'api-autocomplete',
          type: 'api-route',
          title: 'Autocomplétion',
          description: 'Recherche et autocomplétion via API pour les champs texte',
          icon: 'i-heroicons-magnifying-glass',
          tags: ['GET', 'Search', 'Autocomplete'],
          targetTypes: ['text', 'email', 'tel'],
          config: {
            method: 'GET',
            endpoint: '/api/search',
            headers: {},
            params: {
              q: '${search_term}',
              limit: 10
            }
          }
        },
        {
          id: 'api-dependent-field',
          type: 'api-route',
          title: 'Champ dépendant',
          description: 'Charger des données basées sur d\'autres champs du formulaire',
          icon: 'i-heroicons-link',
          tags: ['GET', 'Dépendant', 'Cascade'],
          targetTypes: ['select', 'multiselect'],
          config: {
            method: 'GET',
            endpoint: '/api/dependent',
            headers: {},
            params: {
              parent_value: '${parent_field}'
            }
          }
        }
      ] as FunctionTemplate[]
    }
  },
  methods: {    toggleCategory(category: string) {
      if (category in this.categoriesExpanded) {
        this.categoriesExpanded[category as keyof typeof this.categoriesExpanded] = !this.categoriesExpanded[category as keyof typeof this.categoriesExpanded]
      }
    },
    onFunctionDrop(event: any) {
      // Émission de l'événement pour le parent
      this.$emit('function-dropped', {
        functionTemplate: event.item.__vue__?.element || event.from.children[event.oldIndex].__vue__?.element,
        event
      })
    },
    previewFunction(functionTemplate: FunctionTemplate) {
      this.$emit('preview-function', functionTemplate)
    },
    getTagColor(tag: string): string {
      const colorMap: Record<string, string> = {
        'GET': 'function-tag--get',
        'POST': 'function-tag--post',
        'PUT': 'function-tag--put',
        'DELETE': 'function-tag--delete',
        'Select': 'function-tag--field',
        'Multiselect': 'function-tag--field',
        'Validation': 'function-tag--validation',
        'Search': 'function-tag--feature',
        'Autocomplete': 'function-tag--feature',
        'Temps réel': 'function-tag--feature',
        'Dépendant': 'function-tag--logic',
        'Cascade': 'function-tag--logic'
      }
      return colorMap[tag] || 'function-tag--default'
    }
  }
}
</script>

<style scoped>
/* Structure principale */
.function-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
}

/* Header */
.function-list-header {
  flex-shrink: 0;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.function-list-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.function-list-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

/* Contenu scrollable */
.function-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Custom scrollbar */
.function-list-content::-webkit-scrollbar {
  width: 8px;
}

.function-list-content::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.function-list-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
  transition: background 0.2s;
}

.function-list-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Catégories */
.function-category {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  text-align: left;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-header:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.category-header--collapsed {
  margin-bottom: 0;
}

.category-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
  transition: transform 0.2s;
}

.category-icon.rotate-180 {
  transform: rotate(180deg);
}

.category-title {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.category-header:hover .category-title {
  color: #1f2937;
}

.category-count {
  font-size: 0.75rem;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
}

.category-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0.5rem;
}

/* Liste des fonctions */
.function-template-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.function-template-item {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: move;
  transition: all 0.2s;
}

.function-template-item:hover:not(.function-template-item--disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
  background: #f8fafc;
}

.function-template-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.function-template-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 0.5rem;
  margin-right: 0.75rem;
  transition: transform 0.2s;
}

.function-template-item:hover .function-template-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.function-template-info {
  flex: 1;
  min-width: 0;
}

.function-template-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.function-template-item:hover .function-template-title {
  color: #3b82f6;
}

.function-template-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.function-template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.function-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

.function-tag--get {
  background: #dcfce7;
  color: #166534;
}

.function-tag--post {
  background: #dbeafe;
  color: #1e40af;
}

.function-tag--put {
  background: #fed7aa;
  color: #c2410c;
}

.function-tag--delete {
  background: #fecaca;
  color: #991b1b;
}

.function-tag--field {
  background: #e9d5ff;
  color: #7c2d12;
}

.function-tag--validation {
  background: #fef3c7;
  color: #92400e;
}

.function-tag--feature {
  background: #cffafe;
  color: #155e75;
}

.function-tag--logic {
  background: #c7d2fe;
  color: #3730a3;
}

.function-tag--coming-soon {
  background: #f3f4f6;
  color: #6b7280;
}

.function-tag--default {
  background: #f3f4f6;
  color: #374151;
}

.function-template-actions {
  flex-shrink: 0;
  margin-left: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.function-template-item:hover .function-template-actions {
  opacity: 1;
}

/* Actions en bas */
.function-list-actions {
  flex-shrink: 0;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

.function-list-action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .function-list-header {
    padding: 0.75rem;
  }
  
  .function-list-content {
    padding: 0.75rem;
  }
  
  .function-template-item {
    padding: 0.5rem;
  }
  
  .function-template-icon {
    width: 2rem;
    height: 2rem;
    margin-right: 0.5rem;
  }
}

/* Animation de drag */
.function-template-item:active {
  transform: scale(1.05) rotate(1deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* Animation pour les catégories */
.category-content {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
