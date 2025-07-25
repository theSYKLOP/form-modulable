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
          <div v-if="authStore.user" class="auth-info">
            <span class="text-sm text-green-600 font-medium">
              ✓ Connecté en tant que {{ authStore.user.firstName || authStore.user.email }}
            </span>
          </div>
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
            class="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
            :class="{ 'ring-2 ring-yellow-400 ring-opacity-30': favorites.includes(form.id) }"
          >
            <!-- Header avec badge de statut -->
            <div class="relative p-6 pb-4">
              <!-- Badge de statut -->
              <div class="flex justify-between items-start mb-4">
                <span v-if="form.isNew" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Nouveau
                </span>
                <span v-else-if="form.isUpdated" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <div class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                  Mis à jour
                </span>
                <div v-else></div>
                
                <!-- Bouton favoris -->
                <button
                  @click.stop="toggleFavorite(form.id)"
                  class="p-2 rounded-lg transition-colors"
                  :class="favorites.includes(form.id) 
                    ? 'text-yellow-500 hover:bg-yellow-50' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'"
                >
                  <Icon name="heroicons:heart" class="w-5 h-5" :class="{ 'fill-current': favorites.includes(form.id) }" />
                </button>
              </div>

              <!-- Icône et titre -->
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Icon :name="form.icon || 'heroicons:document-text'" class="w-6 h-6 text-blue-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {{ form.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                    {{ form.description || 'Aucune description' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Stats du formulaire -->
            <div class="px-6 pb-4">
              <div class="flex justify-between text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  <Icon name="heroicons:clock" class="w-4 h-4" />
                  ~{{ form.estimatedTime || 5 }} min
                </span>
                <span v-if="form.stepsCount && form.stepsCount > 1" class="flex items-center gap-1">
                  <Icon name="heroicons:queue-list" class="w-4 h-4" />
                  {{ form.stepsCount }} étapes
                </span>
                <span v-if="form.template?.category || form.category" class="flex items-center gap-1">
                  <Icon name="heroicons:tag" class="w-4 h-4" />
                  {{ form.template?.category || form.category }}
                </span>
              </div>
            </div>

            <!-- Indicateur de progression si brouillon existant -->
            <div v-if="authStore.isAuthenticated && getDraftCount(form.id) > 0" class="px-6 pb-4">
              <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-orange-700">
                    <Icon name="heroicons:clock" class="w-4 h-4 inline mr-1" />
                    En cours ({{ getDraftCount(form.id) }} brouillon{{ getDraftCount(form.id) > 1 ? 's' : '' }})
                  </span>
                  <span class="text-xs text-orange-600">Non terminé</span>
                </div>
                <div class="mt-2 bg-orange-200 rounded-full h-1.5">
                  <div class="bg-orange-500 h-1.5 rounded-full" style="width: 65%"></div>
                </div>
              </div>
            </div>

            <!-- Footer avec actions -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div class="flex justify-between items-center">
                <div class="text-xs text-gray-500">
                  Créé {{ form.createdAt ? formatDate(form.createdAt) : 'Date inconnue' }}
                </div>
                
                <!-- Boutons d'action -->
                <div class="flex items-center gap-2">
                  <button 
                    v-if="authStore.isAuthenticated && getDraftCount(form.id) > 0"
                    @click.stop="loadDraft(form.id)"
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                  >
                    <Icon name="heroicons:document-duplicate" class="w-4 h-4 mr-1" />
                    Continuer
                  </button>
                  
                  <button 
                    @click.stop="selectForm(form)"
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Icon name="heroicons:play" class="w-4 h-4 mr-1" />
                    {{ getDraftCount(form.id) > 0 ? 'Recommencer' : 'Commencer' }}
                  </button>
                </div>
              </div>
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
            <span class="form-category">{{ selectedForm.template?.category || selectedForm.category || 'Formulaire' }}</span>
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
  stepsCount?: number
  fieldsCount?: number
  submissionsCount?: number
  user?: any
  template?: any
}

// Meta de la page avec authentification requise
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

// Store d'authentification
const authStore = useAuthStore()

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
    .map(form => form.template?.category || form.category)
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
      (form.template?.category && form.template.category.toLowerCase().includes(query)) ||
      (form.category && form.category.toLowerCase().includes(query))
    )
  }

  // Filtre par catégorie
  if (categoryFilter.value) {
    filtered = filtered.filter(form => (form.template?.category || form.category) === categoryFilter.value)
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
    // ✅ Vérifier l'authentification avant de charger
    if (!authStore.isAuthenticated || !authStore.token) {
      showToast('error', 'Vous devez être connecté pour accéder aux formulaires')
      await navigateTo('/auth?form=login&redirect=/operations')
      return
    }

    console.log('🔄 Chargement des formulaires pour utilisateur authentifié...')
    
    const response = await fetch('/api/form?isPublished=true', {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 401) {
      console.warn('🔒 Token invalide - redirection vers login')
      showToast('error', 'Session expirée - veuillez vous reconnecter')
      await navigateTo('/auth?form=login&redirect=/operations')
      return
    }
    
    const data = await response.json()
    
    if (data.success && data.data?.forms) {
      forms.value = data.data.forms.map((form: any) => ({
        ...form,
        isNew: isFormNew(form.createdAt),
        isUpdated: isFormUpdated(form.updatedAt, form.createdAt)
      } as FormWithOperationData))
      
      console.log('✅ Formulaires publiés chargés pour utilisateur authentifié:', forms.value.length)
    } else {
      console.error('❌ Réponse API invalide:', data)
      showToast('error', data.message || 'Format de réponse inattendu')
    }
  } catch (error: any) {
    console.error('❌ Erreur chargement formulaires:', error)
    showToast('error', 'Erreur lors du chargement des formulaires')
  } finally {
    loading.value = false
  }
}

const refreshForms = () => {
  loadForms()
}

const selectForm = async (form: FormWithOperationData) => {
  console.log('📋 Sélection du formulaire:', form.id)
  
  try {
    // ✅ Vérifier l'authentification
    if (!authStore.isAuthenticated || !authStore.token) {
      showToast('error', 'Vous devez être connecté pour accéder aux formulaires')
      await navigateTo('/auth?form=login&redirect=/operations')
      return
    }

    // Charger les données complètes du formulaire avec steps et fields
    const response = await fetch(`/api/form/${form.id}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 401) {
      showToast('error', 'Session expirée - veuillez vous reconnecter')
      await navigateTo('/auth?form=login&redirect=/operations')
      return
    }
    
    const data = await response.json()
    
    if (data.success && data.data) {
      // Utiliser les données complètes du formulaire
      selectedForm.value = {
        ...form,
        ...data.data
      } as FormWithOperationData
      console.log('✅ Données complètes du formulaire chargées:', selectedForm.value)
    } else {
      // Fallback avec données de base si l'API échoue
      selectedForm.value = {
        ...form,
        steps: [{
          id: 'step-1',
          title: form.title,
          description: form.description || '',
          order: 1,
          fields: []
        }]
      } as FormWithOperationData
      console.warn('⚠️ Utilisation des données de base du formulaire')
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement du formulaire:', error)
    // Fallback en cas d'erreur
    selectedForm.value = {
      ...form,
      steps: [{
        id: 'step-1',
        title: form.title,
        description: form.description || '',
        order: 1,
        fields: []
      }]
    } as FormWithOperationData
  }
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
    if (!authStore.isAuthenticated || !authStore.token) {
      console.log('🔒 Utilisateur non connecté - pas de brouillons à charger')
      return // Pas d'authentification, pas de brouillons
    }

    console.log('🔄 Tentative de chargement des brouillons...')
    
    const response = await fetch('/api/form-drafts', {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && Array.isArray(data.data)) {
        drafts.value = data.data.reduce((acc: Record<string, number>, draft: any) => {
          acc[draft.formId] = (acc[draft.formId] || 0) + 1
          return acc
        }, {})
        console.log('✅ Brouillons chargés:', drafts.value)
      } else {
        console.warn('⚠️ Réponse API inattendue pour les brouillons:', data)
      }
    } else if (response.status === 401) {
      console.log('🔒 Token invalide ou expiré - pas de brouillons')
      // Ne pas traiter comme une erreur
    } else if (response.status === 404) {
      console.log('🔍 API form-drafts non trouvée - brouillons désactivés')
      // Ne pas traiter comme une erreur
    } else {
      console.warn(`⚠️ Erreur ${response.status} lors du chargement des brouillons`)
    }
  } catch (error) {
    // Ignorer les erreurs de chargement des brouillons
    console.warn('⚠️ Impossible de charger les brouillons:', error)
  }
}

const getDraftCount = (formId: string): number => {
  return drafts.value[formId] || 0
}

const loadDraft = async (formId: string) => {
  try {
    // Vérifier l'authentification avant d'essayer de charger
    if (!authStore.isAuthenticated || !authStore.token) {
      showToast('error', 'Vous devez être connecté pour accéder aux brouillons')
      return
    }

    const response = await fetch(`/api/form-drafts/${formId}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        const form = forms.value.find(f => f.id === formId)
        if (form) {
          // Charger d'abord les données complètes du formulaire
          await selectForm(form)
          
          // Puis ajouter les données du brouillon
          if (selectedForm.value) {
            selectedForm.value.draftData = data.data
            console.log('✅ Brouillon chargé pour le formulaire:', formId)
          }
        }
      }
    } else if (response.status === 401) {
      showToast('error', 'Session expirée - veuillez vous reconnecter')
    } else {
      showToast('error', 'Erreur lors du chargement du brouillon')
    }
  } catch (error: any) {
    console.error('❌ Erreur loadDraft:', error)
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
  
  if (diffInDays < 1) {
    return 'aujourd\'hui'
  } else if (diffInDays < 7) {
    return `il y a ${Math.floor(diffInDays)} jour${Math.floor(diffInDays) > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    })
  }
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
onMounted(async () => {
  // ✅ Vérification d'authentification obligatoire
  if (!authStore.isAuthenticated || !authStore.token) {
    console.log('🔒 Utilisateur non authentifié - redirection vers login')
    await navigateTo('/auth?form=login&redirect=/operations')
    return
  }

  console.log('✅ Utilisateur authentifié - chargement de la page operations')
  
  // Charger d'abord les formulaires
  await loadForms()
  
  // Charger les favoris depuis localStorage
  loadFavorites()
  
  // Charger les brouillons pour l'utilisateur connecté
  console.log('🔍 État authentification:', authStore.isAuthenticated, authStore.token)
  console.log('✅ Utilisateur connecté - chargement des brouillons')
  loadDrafts()
})
</script>

<style scoped>
.operations-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

/* En-tête de la page */
.page-header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 1rem;
}

.header-content {
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.page-description {
  color: #4b5563;
  margin-top: 0.25rem;
}

.auth-info {
  margin-top: 0.5rem;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #1d4ed8;
}

/* Contenu principal */
.main-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Section de recherche */
.search-section {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
}

.search-input:focus {
  box-shadow: 0 0 0 2px #3b82f6;
  border-color: #3b82f6;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
}

.filter-select:focus {
  box-shadow: 0 0 0 2px #3b82f6;
  border-color: #3b82f6;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  transition: background-color 0.2s;
}

.filter-btn:hover {
  background-color: #f9fafb;
}

.filter-btn.active {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

/* Classes utilitaires */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Grille des formulaires */
.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Loading grid pour les squelettes */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Squelettes de chargement */
.form-card-skeleton {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton-header {
  width: 3rem;
  height: 3rem;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.skeleton-line {
  height: 1rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
}

.skeleton-line.short {
  width: 66.666667%;
}

.skeleton-footer {
  height: 2rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
}

/* État vide */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-description {
  color: #4b5563;
  margin-bottom: 1.5rem;
  max-width: 28rem;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-filters-btn:hover {
  background-color: #1d4ed8;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f9fafb;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  background-color: #f9fafb;
}

.page-btn.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* Navigation du formulaire */
.form-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #4b5563;
  background-color: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.form-info {
  flex: 1;
}

.form-category {
  font-size: 0.875rem;
  color: #2563eb;
  font-weight: 500;
}

.current-form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.form-renderer-container {
  max-width: none;
}

/* Toast notifications */
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  max-width: 28rem;
}

.toast.success {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.toast.error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.toast-close {
  padding: 0.25rem;
  border-radius: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toast-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Transitions */
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .search-section {
    gap: 0.75rem;
  }
  
  .filters {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .forms-grid {
    grid-template-columns: 1fr;
  }
  
  .form-navigation {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}
</style>
