<template>
  <div class="forms-management">
    <!-- Header avec actions -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">Gestion des formulaires</h1>
          <p class="page-subtitle">{{ totalForms }} formulaire(s) • Page {{ currentPage }} sur {{ totalPages }}</p>
        </div>
        
        <div class="header-actions">
          <!-- Bouton nouveau formulaire -->
          <button 
            @click="createNewForm" 
            class="btn-primary"
            :disabled="loading"
          >
            <Icon name="i-heroicons-document-plus" />
            Nouveau formulaire
          </button>
        </div>
      </div>

      <!-- Barre de recherche et filtres -->
      <div class="search-filters">
        <div class="search-box">
          <Icon name="i-heroicons-magnifying-glass" class="search-icon" />
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher un formulaire..."
            class="search-input"
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch"
            class="clear-search"
          >
            <Icon name="i-heroicons-x-mark" />
          </button>
        </div>

        <div class="filters">
          <select v-model="sortBy" @change="loadForms" class="filter-select">
            <option value="createdAt">Date de création</option>
            <option value="updatedAt">Dernière modification</option>
            <option value="title">Titre</option>
          </select>
          
          <select v-model="sortOrder" @change="loadForms" class="filter-select">
            <option value="desc">Plus récent</option>
            <option value="asc">Plus ancien</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Liste des formulaires -->
    <div class="forms-container">
      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <Icon name="i-heroicons-arrow-path" class="animate-spin" />
        </div>
        <p>Chargement des formulaires...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="forms.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">
          <Icon name="i-heroicons-document-text" />
        </div>
        <h3>{{ searchQuery ? 'Aucun résultat' : 'Aucun formulaire' }}</h3>
        <p>
          {{ searchQuery 
            ? `Aucun formulaire ne correspond à "${searchQuery}"` 
            : 'Commencez par créer votre premier formulaire' 
          }}
        </p>
        <button 
          v-if="!searchQuery" 
          @click="createNewForm" 
          class="btn-primary mt-4"
        >
          <Icon name="i-heroicons-document-plus" />
          Créer un formulaire
        </button>
      </div>

      <!-- Grille des formulaires -->
      <div v-else class="forms-grid">
        <div 
          v-for="form in forms" 
          :key="form.id" 
          class="form-card"
          :class="{ 'deleting': deletingForms.has(form.id) }"
        >
          <!-- Header de la card -->
          <div class="card-header">
            <div class="form-info">
              <h3 class="form-title" :title="form.title">{{ form.title }}</h3>
              <p v-if="form.description" class="form-description" :title="form.description">
                {{ form.description }}
              </p>
            </div>
            
            <div class="card-actions">
              <button
                @click="duplicateForm(form)"
                class="action-btn duplicate-btn"
                :disabled="duplicatingForms.has(form.id)"
                :title="duplicatingForms.has(form.id) ? 'Duplication...' : 'Dupliquer'"
              >
                <Icon 
                  :name="duplicatingForms.has(form.id) ? 'i-heroicons-arrow-path' : 'i-heroicons-document-duplicate'" 
                  :class="{ 'animate-spin': duplicatingForms.has(form.id) }"
                />
              </button>
              
              <button
                @click="deleteForm(form)"
                class="action-btn delete-btn"
                :disabled="deletingForms.has(form.id)"
                :title="deletingForms.has(form.id) ? 'Suppression...' : 'Supprimer'"
              >
                <Icon 
                  :name="deletingForms.has(form.id) ? 'i-heroicons-arrow-path' : 'i-heroicons-trash'" 
                  :class="{ 'animate-spin': deletingForms.has(form.id) }"
                />
              </button>
            </div>
          </div>

          <!-- Stats de la card -->
          <div class="card-stats">
            <div class="stat-item">
              <Icon name="i-heroicons-rectangle-stack" />
              <span>{{ form.stepsCount }} étape(s)</span>
            </div>
            <div class="stat-item">
              <Icon name="i-heroicons-squares-2x2" />
              <span>{{ form.fieldsCount }} champ(s)</span>
            </div>
            <div class="stat-item">
              <Icon name="i-heroicons-view-columns" />
              <span>{{ form.layout }}</span>
            </div>
          </div>

          <!-- Footer de la card -->
          <div class="card-footer">
            <div class="form-dates">
              <p class="date-created">
                <Icon name="i-heroicons-calendar" />
                Créé le {{ formatDate(form.createdAt) }}
              </p>
              <p v-if="form.updatedAt !== form.createdAt" class="date-updated">
                <Icon name="i-heroicons-pencil" />
                Modifié le {{ formatDate(form.updatedAt) }}
              </p>
            </div>
            
            <div class="card-main-actions">
              <button @click="editForm(form)" class="btn-secondary">
                <Icon name="i-heroicons-pencil-square" />
                Modifier
              </button>
              <button @click="previewForm(form)" class="btn-outline">
                <Icon name="i-heroicons-eye" />
                Aperçu
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="forms.length > 0 && totalPages > 1" class="pagination">
        <button
          @click="previousPage"
          :disabled="currentPage <= 1 || loading"
          class="pagination-btn"
        >
          <Icon name="i-heroicons-chevron-left" />
          Précédent
        </button>
        
        <div class="pagination-info">
          <span>Page {{ currentPage }} sur {{ totalPages }}</span>
        </div>
        
        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages || loading"
          class="pagination-btn"
        >
          Suivant
          <Icon name="i-heroicons-chevron-right" />
        </button>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="formToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="confirm-modal delete-modal" @click.stop>
        <div class="modal-header">
          <div class="warning-icon">
            <Icon name="i-heroicons-exclamation-triangle" />
          </div>
          <h3>Supprimer le formulaire</h3>
        </div>
        
        <div class="modal-body">
          <p><strong>{{ formToDelete.title }}</strong></p>
          <p class="warning-text">Cette action est irréversible. Le formulaire et toutes ses données seront définitivement supprimés.</p>
          
          <div class="deletion-stats">
            <div class="stat">
              <Icon name="i-heroicons-rectangle-stack" />
              <span>{{ formToDelete.stepsCount }} étape(s)</span>
            </div>
            <div class="stat">
              <Icon name="i-heroicons-squares-2x2" />
              <span>{{ formToDelete.fieldsCount }} champ(s)</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn-secondary">
            Annuler
          </button>
          <button 
            @click="confirmDelete" 
            class="btn-danger"
            :disabled="deletingForms.has(formToDelete.id)"
          >
            <Icon 
              :name="deletingForms.has(formToDelete.id) ? 'i-heroicons-arrow-path' : 'i-heroicons-trash'" 
              :class="{ 'animate-spin': deletingForms.has(formToDelete.id) }"
            />
            {{ deletingForms.has(formToDelete.id) ? 'Suppression...' : 'Supprimer définitivement' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ✅ Modal de prévisualisation du formulaire -->
    <div v-if="showPreviewModal" class="modal-overlay preview-overlay" @click="closePreviewModal">
      <div class="preview-modal" @click.stop>
        <!-- Header de la modal -->
        <div class="preview-modal-header">
          <div class="preview-header-info">
            <div class="preview-form-title">
              <Icon name="i-heroicons-eye" class="preview-icon" />
              <span>Aperçu du formulaire</span>
            </div>
            <p v-if="previewingForm" class="preview-form-name">{{ previewingForm.title }}</p>
          </div>
          
          <button @click="closePreviewModal" class="preview-close-btn">
            <Icon name="i-heroicons-x-mark" />
          </button>
        </div>

        <!-- Contenu de la modal -->
        <div class="preview-modal-body">
          <!-- État de chargement -->
          <div v-if="loadingPreview" class="preview-loading">
            <div class="loading-spinner">
              <Icon name="i-heroicons-arrow-path" class="animate-spin" />
            </div>
            <p>Chargement du formulaire...</p>
          </div>

          <!-- Composant FormPreview -->
          <div v-else-if="previewFormConfig" class="preview-content-wrapper">
            <FormPreview :form-config="previewFormConfig" />
          </div>

          <!-- État d'erreur -->
          <div v-else class="preview-error">
            <div class="error-icon">
              <Icon name="i-heroicons-exclamation-circle" />
            </div>
            <p>Impossible de charger le formulaire</p>
            <button @click="closePreviewModal" class="btn-secondary">
              Fermer
            </button>
          </div>
        </div>

        <!-- Footer de la modal -->
        <div class="preview-modal-footer" v-if="!loadingPreview && previewFormConfig">
          <div class="preview-stats">
            <div class="stat">
              <Icon name="i-heroicons-rectangle-stack" />
              <span>{{ previewingForm?.stepsCount }} étape(s)</span>
            </div>
            <div class="stat">
              <Icon name="i-heroicons-squares-2x2" />
              <span>{{ previewingForm?.fieldsCount }} champ(s)</span>
            </div>
          </div>
          
          <div class="preview-actions">
            <button @click="editForm(previewingForm!)" class="btn-secondary">
              <Icon name="i-heroicons-pencil-square" />
              Modifier
            </button>
            <button @click="closePreviewModal" class="btn-outline">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div v-if="notification" class="notification" :class="notification.type">
      <Icon :name="getNotificationIcon(notification.type)" />
      <span>{{ notification.message }}</span>
      <button @click="notification = null" class="notification-close">
        <Icon name="i-heroicons-x-mark" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { navigateTo } from '#app'
// ✅ Import du composant FormPreview
import FormPreview from '~/pages/form/components/FormPreview.vue'


// Types (gardés identiques)
interface FormSummary {
  id: string
  title: string
  description: string | null
  layout: string
  spacing: string
  createdAt: string
  updatedAt: string
  stepsCount: number
  fieldsCount: number
}

interface Notification {
  type: 'success' | 'error' | 'warning'
  message: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

interface FormsListResponse {
  forms: FormSummary[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface FormResponse {
  id: string
  title: string
  description: string
  layout: string
  spacing: string
  steps: any[]
}

// Utilitaire pour générer des IDs uniques
const generateId = (prefix: string = '') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Page meta


useHead({
  title: 'Gestion des formulaires - Admin'
})

// État réactif
const loading = ref(false)
const forms = ref<FormSummary[]>([])
const searchQuery = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const currentPage = ref(1)
const totalPages = ref(1)
const totalForms = ref(0)
const itemsPerPage = ref(12)

// États des actions
const deletingForms = ref(new Set<string>())
const duplicatingForms = ref(new Set<string>())
const formToDelete = ref<FormSummary | null>(null)
const notification = ref<Notification | null>(null)

// ✅ État pour la modal de prévisualisation
const showPreviewModal = ref(false)
const previewingForm = ref<FormSummary | null>(null)
const previewFormConfig = ref<any>(null)
const loadingPreview = ref(false)

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadForms()
  }, 300)
}

// Computed
const hasResults = computed(() => forms.value.length > 0)

// Fonctions principales
const loadForms = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: itemsPerPage.value.toString(),
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })

    if (searchQuery.value.trim()) {
      params.append('search', searchQuery.value.trim())
    }

    const response = await $fetch<ApiResponse<FormsListResponse>>(`/api/form?${params}`)
    
    if (response?.success && response.data) {
      forms.value = response.data.forms
      totalPages.value = response.data.pagination.totalPages
      totalForms.value = response.data.pagination.totalCount
    } else {
      throw new Error(response?.message || 'Erreur lors du chargement')
    }
  } catch (error: any) {
    console.error('Erreur chargement formulaires:', error)
    showNotification('error', 'Erreur lors du chargement des formulaires')
    forms.value = []
    totalPages.value = 1
    totalForms.value = 0
  } finally {
    loading.value = false
  }
}

// 🆕 Nouvelle fonction pour créer un formulaire - redirige vers le nouveau système
const createNewForm = async () => {
  try {
    showNotification('success', 'Redirection vers le constructeur...')
    
    // Rediriger vers le constructeur principal pour un nouveau formulaire
    await navigateTo('/form?id=new')
    
  } catch (error: any) {
    console.error('Erreur création formulaire:', error)
    showNotification('error', 'Erreur lors de la redirection')
  }
}

const editForm = async (form: FormSummary) => {
  // Rediriger vers l'éditeur principal avec l'ID du formulaire existant
  await navigateTo(`/form?id=${form.id}`)
}

const previewForm = async (form: FormSummary) => {
  try {
    previewingForm.value = form
    showPreviewModal.value = true
    loadingPreview.value = true
    
    // Charger la configuration complète du formulaire
    const response = await $fetch<ApiResponse<FormResponse>>(`/api/form/${form.id}`)
    
    if (response?.success && response.data) {
      previewFormConfig.value = response.data
    } else {
      throw new Error(response?.message || 'Erreur lors du chargement')
    }
  } catch (error: any) {
    console.error('Erreur chargement formulaire pour preview:', error)
    showNotification('error', 'Erreur lors du chargement du formulaire')
    showPreviewModal.value = false
  } finally {
    loadingPreview.value = false
  }
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  previewingForm.value = null
  previewFormConfig.value = null
  loadingPreview.value = false
}

const duplicateForm = async (form: FormSummary) => {
  if (duplicatingForms.value.has(form.id)) return
  
  duplicatingForms.value.add(form.id)
  try {
    const response = await $fetch<ApiResponse<FormResponse>>(`/api/form/${form.id}/duplicate`, {
      method: 'POST',
      body: {
        title: `${form.title} (Copie)`
      }
    })

    if (response?.success) {
      showNotification('success', 'Formulaire dupliqué avec succès')
      await loadForms() // Recharger la liste
    } else {
      throw new Error(response?.message || 'Erreur lors de la duplication')
    }
  } catch (error: any) {
    console.error('Erreur duplication:', error)
    showNotification('error', 'Erreur lors de la duplication')
  } finally {
    duplicatingForms.value.delete(form.id)
  }
}

const deleteForm = (form: FormSummary) => {
  formToDelete.value = form
}

const cancelDelete = () => {
  formToDelete.value = null
}

const confirmDelete = async () => {
  if (!formToDelete.value || deletingForms.value.has(formToDelete.value.id)) return
  
  const form = formToDelete.value
  deletingForms.value.add(form.id)
  
  try {
    const response = await $fetch<ApiResponse>(`/api/form/${form.id}`, {
      method: 'DELETE'
    })

    if (response?.success) {
      showNotification('success', 'Formulaire supprimé avec succès')
      formToDelete.value = null
      
      // Si on est sur la dernière page et qu'il ne reste qu'un élément, revenir à la page précédente
      if (forms.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }
      
      await loadForms()
    } else {
      throw new Error(response?.message || 'Erreur lors de la suppression')
    }
  } catch (error: any) {
    console.error('Erreur suppression:', error)
    showNotification('error', 'Erreur lors de la suppression')
  } finally {
    deletingForms.value.delete(form.id)
  }
}

// Navigation
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadForms()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadForms()
  }
}

// Utilitaires
const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadForms()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return 'i-heroicons-check-circle'
    case 'error': return 'i-heroicons-x-circle'
    case 'warning': return 'i-heroicons-exclamation-triangle'
    default: return 'i-heroicons-information-circle'
  }
}

// Watchers
watch(currentPage, loadForms)

// Lifecycle
onMounted(() => {
  loadForms()
})
</script>

<style scoped>
.forms-management {
  min-height: 100vh;
  background: #f8fafc;
}

/* Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Recherche et filtres */
.search-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: color 0.2s;
}

.clear-search:hover {
  color: #374151;
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

/* Container principal */
.forms-container {
  padding: 2rem;
}

/* États de chargement et vide */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  color: #d1d5db;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1rem 0;
}

/* Grille des formulaires */
.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Cards des formulaires */
.form-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s;
  height: fit-content;
}

.form-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.form-card.deleting {
  opacity: 0.5;
  pointer-events: none;
}

.card-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.form-info {
  flex: 1;
  min-width: 0;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.duplicate-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.duplicate-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.delete-btn {
  background: #fef2f2;
  color: #ef4444;
}

.delete-btn:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Stats de la card */
.card-stats {
  padding: 0 1.5rem 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6b7280;
  font-size: 0.75rem;
}

.stat-item svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Footer de la card */
.card-footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.form-dates {
  margin-bottom: 1rem;
}

.date-created,
.date-updated {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6b7280;
  font-size: 0.75rem;
  margin: 0 0 0.25rem 0;
}

.date-created svg,
.date-updated svg {
  width: 0.75rem;
  height: 0.75rem;
}

.card-main-actions {
  display: flex;
  gap: 0.75rem;
}

/* Boutons */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  flex: 1;
  justify-content: center;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-outline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  flex: 1;
  justify-content: center;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Modal de prévisualisation */
.preview-overlay {
  z-index: 1100;
}

.preview-modal {
  background: white;
  border-radius: 1rem;
  width: 95vw;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.preview-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.preview-header-info {
  flex: 1;
}

.preview-form-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.preview-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
}

.preview-form-title span {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.preview-form-name {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
  padding-left: 2.25rem;
}

.preview-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s;
}

.preview-close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.preview-close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.preview-modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
  flex: 1;
}

.preview-loading .loading-spinner {
  width: 2rem;
  height: 2rem;
  margin-bottom: 1rem;
  color: #3b82f6;
}

.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
  flex: 1;
}

.preview-error .error-icon {
  width: 3rem;
  height: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.preview-content-wrapper {
  flex: 1;
  overflow: hidden;
  background: #f8fafc;
}

.preview-content-wrapper :deep(.form-preview) {
  height: 100%;
  box-shadow: none;
  border-radius: 0;
}

.preview-content-wrapper :deep(.preview-container) {
  background: transparent;
}

.preview-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.preview-stats {
  display: flex;
  gap: 1.5rem;
}

.preview-stats .stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.preview-stats .stat svg {
  width: 1rem;
  height: 1rem;
}

.preview-actions {
  display: flex;
  gap: 0.75rem;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.confirm-modal {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.warning-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #f59e0b;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem 0;
  color: #374151;
}

.warning-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

.deletion-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border-radius: 0.5rem;
}

.deletion-stats .stat {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #991b1b;
  font-size: 0.875rem;
}

.deletion-stats .stat svg {
  width: 1rem;
  height: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #fafbfc;
}

/* Notifications */
.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background: #10b981;
  color: white;
}

.notification.error {
  background: #ef4444;
  color: white;
}

.notification.warning {
  background: #f59e0b;
  color: white;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.2);
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

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .search-filters {
    flex-direction: column;
  }

  .search-box {
    min-width: unset;
  }

  .forms-container {
    padding: 1rem;
  }

  .forms-grid {
    grid-template-columns: 1fr;
  }

  .card-main-actions {
    flex-direction: column;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  /* Modal de prévisualisation responsive */
  .preview-modal {
    width: 100vw;
    max-width: none;
    max-height: 100vh;
    border-radius: 0;
  }

  .preview-modal-header {
    padding: 1rem 1.5rem;
  }

  .preview-form-title span {
    font-size: 1rem;
  }

  .preview-modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .preview-stats {
    justify-content: center;
  }

  .preview-actions {
    justify-content: stretch;
  }

  .preview-actions button {
    flex: 1;
  }
}

/* Utilitaires */
.mt-4 {
  margin-top: 1rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>