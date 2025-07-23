<template>
  <div class="operations-page">
    <!-- En-tête de la page -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Centre d'opérations</h1>
          <p class="page-description">
            Accédez et soumettez vos formulaires en quelques clics
          </p>
        </div>
        <div class="header-actions">
          <button @click="refreshForms" class="refresh-btn" :disabled="loading">
            <Icon 
              name="heroicons:arrow-path" 
              class="w-4 h-4"
              :class="{ 'animate-spin': loading }"
            />
            Actualiser
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="main-content">
      <!-- Sélection de formulaire -->
      <div v-if="!selectedForm" class="form-selection">
        <!-- Barre de recherche et filtres -->
        <div class="search-section">
          <div class="search-bar">
            <Icon name="heroicons:magnifying-glass" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un formulaire..."
              class="search-input"
            />
          </div>
          
          <div class="filters">
            <select v-model="categoryFilter" class="filter-select">
              <option value="">Toutes les catégories</option>
              <option 
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
            
            <button
              @click="toggleFavorites"
              class="filter-btn"
              :class="{ active: showFavoritesOnly }"
            >
              <Icon name="heroicons:heart" class="w-4 h-4" />
              Favoris
            </button>
          </div>
        </div>

        <!-- Liste des formulaires -->
        <div v-if="loading" class="loading-grid">
          <div v-for="i in 6" :key="i" class="form-card-skeleton">
            <div class="skeleton-header"></div>
            <div class="skeleton-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
            <div class="skeleton-footer"></div>
          </div>
        </div>

        <div v-else-if="filteredForms.length === 0" class="empty-state">
          <Icon name="heroicons:document-text" class="empty-icon" />
          <h3 class="empty-title">Aucun formulaire trouvé</h3>
          <p class="empty-description">
            {{ searchQuery || categoryFilter ? 'Essayez de modifier vos critères de recherche' : 'Aucun formulaire n\'est disponible pour le moment' }}
          </p>
          <button v-if="searchQuery || categoryFilter" @click="clearFilters" class="clear-filters-btn">
            Effacer les filtres
          </button>
        </div>

        <div v-else class="forms-grid">
          <div
            v-for="form in paginatedForms"
            :key="form.id"
            @click="selectForm(form)"
            class="form-card"
            :class="{ 'favorited': favorites.includes(form.id) }"
          >
            <!-- Badge de statut -->
            <div v-if="form.isNew" class="status-badge new">
              Nouveau
            </div>
            <div v-else-if="form.isUpdated" class="status-badge updated">
              Mis à jour
            </div>

            <!-- En-tête de la carte -->
            <div class="card-header">
              <div class="form-icon">
                <Icon :name="form.icon || 'heroicons:document-text'" class="w-6 h-6" />
              </div>
              <button
                @click.stop="toggleFavorite(form.id)"
                class="favorite-btn"
                :class="{ active: favorites.includes(form.id) }"
              >
                <Icon name="heroicons:heart" class="w-4 h-4" />
              </button>
            </div>

            <!-- Contenu de la carte -->
            <div class="card-content">
              <h3 class="form-title">{{ form.title }}</h3>
              <p class="form-description">{{ form.description }}</p>
              
              <div class="form-meta">
                <div class="meta-item">
                  <Icon name="heroicons:clock" class="w-4 h-4" />
                  <span>~{{ form.estimatedTime || 5 }} min</span>
                </div>
                <div v-if="form.category" class="meta-item">
                  <Icon name="heroicons:tag" class="w-4 h-4" />
                  <span>{{ form.category }}</span>
                </div>
                <div v-if="form.steps.length > 1" class="meta-item">
                  <Icon name="heroicons:bars-3" class="w-4 h-4" />
                  <span>{{ form.steps.length }} étapes</span>
                </div>
              </div>
            </div>

            <!-- Actions de la carte -->
            <div class="card-actions">
              <button class="action-btn primary">
                <Icon name="heroicons:play" class="w-4 h-4" />
                Commencer
              </button>
              <button 
                v-if="getDraftCount(form.id) > 0"
                @click.stop="loadDraft(form.id)"
                class="action-btn secondary"
              >
                <Icon name="heroicons:document-duplicate" class="w-4 h-4" />
                Brouillon ({{ getDraftCount(form.id) }})
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
            Précédent
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              class="page-btn"
              :class="{ active: page === currentPage }"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Suivant
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Affichage du formulaire sélectionné -->
      <div v-else class="form-display">
        <div class="form-navigation">
          <button @click="goBackToSelection" class="back-btn">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            Retour à la sélection
          </button>
          
          <div class="form-info">
            <span class="form-category">{{ selectedForm.category }}</span>
            <h2 class="current-form-title">{{ selectedForm.title }}</h2>
          </div>
        </div>

        <!-- Composant FormRenderer -->
        <FormRenderer
          :form-config="selectedForm"
          :show-progress="true"
          :allow-save-as-draft="true"
          @form-submitted="handleFormSubmitted"
          @form-saved="handleFormSaved"
          @step-changed="handleStepChanged"
          @error="handleFormError"
          class="form-renderer-container"
        />
      </div>
    </div>

    <!-- Toast notifications -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <Icon 
          :name="toast.type === 'success' ? 'heroicons:check-circle' : 'heroicons:exclamation-triangle'"
          class="w-5 h-5"
        />
        <span>{{ toast.message }}</span>
        <button @click="hideToast" class="toast-close">
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { FormConfig } from '~/types/form'
import FormRenderer from '~/components/FormRenderer.vue'
import { useAuthStore } from '~/stores/auth'

// Interface étendue pour les opérations
interface FormWithOperationData extends FormConfig {
  category?: string
  estimatedTime?: number
  isNew?: boolean
  isUpdated?: boolean
  createdAt?: string
  updatedAt?: string
  draftData?: any
}

// Meta de la page
definePageMeta({
  layout: 'default'
})

// Head de la page
useHead({
  title: 'Centre d\'opérations - Formulaires',
  meta: [
    { name: 'description', content: 'Accédez et soumettez vos formulaires rapidement et facilement' }
  ]
})

// État principal
const loading = ref(false)
const forms = ref<FormWithOperationData[]>([])
const selectedForm = ref<FormWithOperationData | null>(null)
const favorites = ref<string[]>([])
const drafts = ref<Record<string, number>>({})

// Filtres et recherche
const searchQuery = ref('')
const categoryFilter = ref('')
const showFavoritesOnly = ref(false)
const currentPage = ref(1)
const itemsPerPage = 12

// Toast notifications
const toast = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  message: ''
})

// Computed
const categories = computed(() => {
  const cats = forms.value
    .map(form => form.category)
    .filter((cat): cat is string => Boolean(cat))
    .filter((cat, index, arr) => arr.indexOf(cat) === index)
  return cats.sort()
})

const filteredForms = computed(() => {
  let filtered = forms.value

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(form =>
      form.title.toLowerCase().includes(query) ||
      (form.description && form.description.toLowerCase().includes(query)) ||
      (form.category && form.category.toLowerCase().includes(query))
    )
  }

  // Filtre par catégorie
  if (categoryFilter.value) {
    filtered = filtered.filter(form => form.category === categoryFilter.value)
  }

  // Filtre par favoris
  if (showFavoritesOnly.value) {
    filtered = filtered.filter(form => favorites.value.includes(form.id))
  }

  // Tri par favoris d'abord, puis par titre
  return filtered.sort((a, b) => {
    const aFav = favorites.value.includes(a.id)
    const bFav = favorites.value.includes(b.id)
    
    if (aFav && !bFav) return -1
    if (!aFav && bFav) return 1
    
    return a.title.localeCompare(b.title)
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredForms.value.length / itemsPerPage)
})

const paginatedForms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredForms.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Fonctions
const loadForms = async () => {
  loading.value = true
  
  try {
    const response = await fetch('/api/form?isPublished=true')
    const data = await response.json()
    
    if (data.success) {
      forms.value = data.data.map((form: any) => ({
        ...form,
        isNew: isFormNew(form.createdAt),
        isUpdated: isFormUpdated(form.updatedAt, form.createdAt)
      } as FormWithOperationData))
    }
  } catch (error: any) {
    showToast('error', 'Erreur lors du chargement des formulaires')
  } finally {
    loading.value = false
  }
}

const refreshForms = () => {
  loadForms()
}

const selectForm = (form: FormWithOperationData) => {
  selectedForm.value = form
}

const goBackToSelection = () => {
  selectedForm.value = null
}

// Gestion des favoris
const loadFavorites = () => {
  const saved = localStorage.getItem('form-favorites')
  if (saved) {
    favorites.value = JSON.parse(saved)
  }
}

const saveFavorites = () => {
  localStorage.setItem('form-favorites', JSON.stringify(favorites.value))
}

const toggleFavorite = (formId: string) => {
  const index = favorites.value.indexOf(formId)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(formId)
  }
  saveFavorites()
}

const toggleFavorites = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value
}

// Gestion des brouillons
const loadDrafts = async () => {
  try {
    // Vérifier d'abord si l'utilisateur est connecté
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return // Pas d'authentification, pas de brouillons
    }

    const response = await fetch('/api/form-drafts', {
      credentials: 'include' // Important pour envoyer les cookies
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && Array.isArray(data.data)) {
        drafts.value = data.data.reduce((acc: Record<string, number>, draft: any) => {
          acc[draft.formId] = (acc[draft.formId] || 0) + 1
          return acc
        }, {})
      }
    }
  } catch (error) {
    // Ignorer les erreurs de chargement des brouillons
    console.warn('Impossible de charger les brouillons:', error)
  }
}

const getDraftCount = (formId: string): number => {
  return drafts.value[formId] || 0
}

const loadDraft = async (formId: string) => {
  try {
    const response = await fetch(`/api/form-drafts/${formId}`, {
      credentials: 'include'
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        const form = forms.value.find(f => f.id === formId)
        if (form) {
          // Charger le formulaire avec les données du brouillon
          selectedForm.value = { 
            ...form, 
            draftData: data.data 
          } as FormWithOperationData
        }
      }
    } else {
      showToast('error', 'Erreur lors du chargement du brouillon')
    }
  } catch (error: any) {
    showToast('error', 'Erreur lors du chargement du brouillon')
  }
}

// Filtres et pagination
const clearFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  showFavoritesOnly.value = false
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Gestionnaires d'événements du FormRenderer
const handleFormSubmitted = (data: Record<string, any>) => {
  showToast('success', 'Formulaire soumis avec succès !')
  
  // Retourner à la sélection après un délai
  setTimeout(() => {
    goBackToSelection()
  }, 2000)
}

const handleFormSaved = (data: Record<string, any>) => {
  showToast('success', 'Brouillon sauvegardé')
  loadDrafts() // Recharger les compteurs de brouillons
}

const handleStepChanged = (stepIndex: number, step: any) => {
  // Optionnel : suivre la progression
}

const handleFormError = (error: string) => {
  showToast('error', error)
}

// Utilitaires
const isFormNew = (createdAt: string): boolean => {
  const created = new Date(createdAt)
  const now = new Date()
  const diffInDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24)
  return diffInDays <= 7
}

const isFormUpdated = (updatedAt: string, createdAt: string): boolean => {
  const updated = new Date(updatedAt)
  const created = new Date(createdAt)
  const diffInHours = (updated.getTime() - created.getTime()) / (1000 * 3600)
  return diffInHours > 1 // Considéré comme mis à jour si modifié plus d'1h après création
}

// Toast
const showToast = (type: 'success' | 'error', message: string) => {
  toast.value = { show: true, type, message }
  
  setTimeout(() => {
    hideToast()
  }, 5000)
}

const hideToast = () => {
  toast.value.show = false
}

// Watchers
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

watch([searchQuery, categoryFilter, showFavoritesOnly], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadForms()
  loadFavorites()
  loadDrafts()
})
</script>

<style scoped>
.operations-page {
  @apply min-h-screen bg-gray-50;
}

/* En-tête de la page */
.page-header {
  @apply bg-white border-b border-gray-200 px-4 py-6;
}

.header-content {
  @apply max-w-7xl mx-auto flex justify-between items-center;
}

.page-title {
  @apply text-2xl font-bold text-gray-900;
}

.page-description {
  @apply text-gray-600 mt-1;
}

.refresh-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
}

/* Contenu principal */
.main-content {
  @apply max-w-7xl mx-auto px-4 py-8;
}

/* Section de recherche */
.search-section {
  @apply mb-8 space-y-4;
}

.search-bar {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.filters {
  @apply flex gap-4 flex-wrap;
}

.filter-select {
  @apply px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.filter-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}

.filter-btn.active {
  @apply bg-blue-50 border-blue-300 text-blue-700;
}

/* Grille des formulaires */
.forms-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.loading-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

/* Cartes de formulaire */
.form-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-blue-300 relative;
}

.form-card.favorited {
  @apply ring-2 ring-yellow-200;
}

.status-badge {
  @apply absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full;
}

.status-badge.new {
  @apply bg-green-100 text-green-700;
}

.status-badge.updated {
  @apply bg-blue-100 text-blue-700;
}

.card-header {
  @apply flex justify-between items-start mb-4;
}

.form-icon {
  @apply w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600;
}

.favorite-btn {
  @apply p-2 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-gray-50 transition-colors;
}

.favorite-btn.active {
  @apply text-yellow-500;
}

.card-content {
  @apply mb-6;
}

.form-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.form-description {
  @apply text-gray-600 text-sm mb-4 line-clamp-3;
}

.form-meta {
  @apply space-y-2;
}

.meta-item {
  @apply flex items-center gap-2 text-sm text-gray-500;
}

.card-actions {
  @apply flex gap-2;
}

.action-btn {
  @apply inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors;
}

.action-btn.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.action-btn.secondary {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}

/* Squelettes de chargement */
.form-card-skeleton {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse;
}

.skeleton-header {
  @apply w-12 h-12 bg-gray-200 rounded-lg mb-4;
}

.skeleton-content {
  @apply space-y-3 mb-6;
}

.skeleton-line {
  @apply h-4 bg-gray-200 rounded;
}

.skeleton-line.short {
  @apply w-2/3;
}

.skeleton-footer {
  @apply h-8 bg-gray-200 rounded;
}

/* État vide */
.empty-state {
  @apply col-span-full flex flex-col items-center justify-center py-16 text-center;
}

.empty-icon {
  @apply w-16 h-16 text-gray-400 mb-4;
}

.empty-title {
  @apply text-xl font-medium text-gray-900 mb-2;
}

.empty-description {
  @apply text-gray-600 mb-6 max-w-md;
}

.clear-filters-btn {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
}

/* Pagination */
.pagination {
  @apply flex items-center justify-center gap-2 mt-8;
}

.pagination-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.page-numbers {
  @apply flex gap-1;
}

.page-btn {
  @apply w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}

.page-btn.active {
  @apply bg-blue-600 text-white border-blue-600;
}

/* Navigation du formulaire */
.form-navigation {
  @apply flex items-center gap-4 mb-8 pb-4 border-b border-gray-200;
}

.back-btn {
  @apply inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors;
}

.form-info {
  @apply flex-1;
}

.form-category {
  @apply text-sm text-blue-600 font-medium;
}

.current-form-title {
  @apply text-xl font-semibold text-gray-900;
}

.form-renderer-container {
  @apply max-w-none;
}

/* Toast notifications */
.toast {
  @apply fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md;
}

.toast.success {
  @apply bg-green-50 text-green-700 border border-green-200;
}

.toast.error {
  @apply bg-red-50 text-red-700 border border-red-200;
}

.toast-close {
  @apply p-1 rounded-lg hover:bg-black hover:bg-opacity-10 transition-colors;
}

/* Transitions */
.toast-enter-active, .toast-leave-active {
  @apply transition-all duration-300;
}

.toast-enter-from {
  @apply opacity-0 transform translate-x-full;
}

.toast-leave-to {
  @apply opacity-0 transform translate-x-full;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    @apply flex-col gap-4 items-start;
  }
  
  .search-section {
    @apply space-y-3;
  }
  
  .filters {
    @apply flex-col gap-2;
  }
  
  .forms-grid {
    @apply grid-cols-1;
  }
  
  .form-navigation {
    @apply flex-col gap-2 items-start;
  }
  
  .pagination {
    @apply flex-wrap;
  }
}
</style>
