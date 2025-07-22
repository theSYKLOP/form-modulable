<template>
  <div class="forms-management">
    <!-- Header optimisé -->
    <div class="page-header">
      <div class="search-filters">
        <div class="search-box">
          <input 
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher un formulaire..."
            class="search-input"
          />
        </div>
      </div>
    </div>

    <!-- Liste des formulaires avec lazy loading et virtualisation -->
    <div class="forms-container">
      <!-- État de chargement -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner animate-spin">⏳</div>
        <p>Chargement des formulaires...</p>
      </div>
      
      <!-- État vide -->
      <div v-else-if="forms.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>Aucun formulaire trouvé</h3>
        <p>{{ searchQuery ? 'Aucun résultat pour cette recherche.' : 'Commencez par créer votre premier formulaire.' }}</p>
        <NuxtLink to="/form" class="btn-primary">
          <Icon name="heroicons:plus" />
          Créer un formulaire
        </NuxtLink>
      </div>
      
      <!-- Grille des formulaires -->
      <div v-else class="forms-grid" ref="formsGrid">
        <div 
          v-for="form in visibleForms" 
          :key="form.id"
          class="form-card"
          @mouseenter="preloadFormEdit(form.id)"
        >
          <!-- En-tête de la card -->
          <div class="card-header">
            <div class="form-info">
              <h3 class="form-title">{{ form.title || 'Formulaire sans titre' }}</h3>
              <p class="form-description">{{ form.description || 'Aucune description' }}</p>
            </div>
            <div class="card-actions">
              <button @click="previewForm(form)" class="btn-preview">
                <Icon name="heroicons:eye" />
                Aperçu
              </button>
              <button @click="editForm(form)" class="btn-edit">
                <Icon name="heroicons:pencil" />
                Modifier
              </button>
            </div>
          </div>
          
          <!-- Stats de la card -->
          <div class="card-stats">
            <div class="stat-item">
              <Icon name="heroicons:queue-list" />
              <span>{{ form.steps?.length || 0 }} étapes</span>
            </div>
            <div class="stat-item">
              <Icon name="heroicons:users" />
              <span>{{ form.submissionsCount || 0 }} soumissions</span>
            </div>
            <div class="stat-item">
              <Icon name="heroicons:eye" />
              <span>{{ form.viewsCount || 0 }} vues</span>
            </div>
          </div>
          
          <!-- Footer de la card -->
          <div class="card-footer">
            <div class="form-dates">
              <div class="date-created">
                <Icon name="heroicons:calendar" />
                <span>Créé {{ formatDate(form.createdAt) }}</span>
              </div>
              <div class="date-updated">
                <Icon name="heroicons:clock" />
                <span>Modifié {{ formatDate(form.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de prévisualisation optimisée -->
    <div v-if="showPreviewModal" class="modal-overlay preview-overlay" @click.self="closePreviewModal">
      <div class="preview-modal">
        <!-- Header de la modal -->
        <div class="preview-modal-header">
          <div class="preview-header-info">
            <div class="preview-form-title">
              <Icon name="heroicons:eye" class="preview-icon" />
              <span>Aperçu du formulaire</span>
            </div>
            <p class="preview-form-name">{{ previewingForm?.title || 'Formulaire sans titre' }}</p>
          </div>
          <button @click="closePreviewModal" class="preview-close-btn">
            <Icon name="heroicons:x-mark" />
          </button>
        </div>
        
        <!-- Corps de la modal -->
        <div class="preview-modal-body">
          <div v-if="!previewingForm" class="preview-loading">
            <div class="loading-spinner animate-spin">⏳</div>
            <p>Chargement de l'aperçu...</p>
          </div>
          
          <div v-else class="preview-content-wrapper">
            <LazyFormPreview 
              v-if="previewingForm"
              :form-config="formatFormForPreview(previewingForm)"
            />
          </div>
        </div>
        
        <!-- Footer de la modal -->
        <div class="preview-modal-footer">
          <div class="preview-stats">
            <div class="stat">
              <Icon name="heroicons:queue-list" />
              <span>{{ previewingForm?.steps?.length || 0 }} étapes</span>
            </div>
            <div class="stat">
              <Icon name="heroicons:calendar" />
              <span>Créé {{ formatDate(previewingForm?.createdAt) }}</span>
            </div>
          </div>
          
          <div class="preview-actions">
            <button @click="editForm(previewingForm)" class="btn-primary">
              <Icon name="heroicons:pencil" />
              Modifier
            </button>
            <button @click="closePreviewModal" class="btn-secondary">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { usePerformance } from '~/composables/core/usePerformance';

// ✅ Configuration de la page admin
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

// ✅ Configuration SEO
useHead({
  title: 'Gestion des formulaires - Admin',
  meta: [
    { name: 'description', content: 'Interface d\'administration pour gérer les formulaires' }
  ]
});

// ✅ Intégration des optimisations
const { 
  lazyComponent, 
  useOptimizedDebounce, 
  useIntersectionObserver,
  preloadRoute,
  useMemoryCache,
  measurePerformance
} = usePerformance();

// ✅ Composant lazy pour la modal de prévisualisation
const LazyFormPreview = lazyComponent(() => import('~/pages/form/components/FormPreview.vue'));

// ✅ Cache pour les formulaires
const formsCache = useMemoryCache('admin-forms', 300000); // 5 minutes

// États existants
const forms = ref([]);
const searchQuery = ref('');
const formsGrid = ref(null);

// ✅ Variables manquantes pour la pagination et le chargement
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(12);
const sortBy = ref('createdAt');
const sortOrder = ref('desc');

// ✅ Variables pour la modal de prévisualisation
const showPreviewModal = ref(false);
const previewingForm = ref(null);

// ✅ Recherche avec debounce optimisé
const debouncedSearch = useOptimizedDebounce(() => {
  measurePerformance('Forms Search', () => {
    currentPage.value = 1;
    loadForms();
  });
}, 300);

// ✅ Pagination virtuelle pour les grandes listes
const visibleForms = computed(() => {
  // Afficher seulement les formulaires visibles (pagination virtuelle)
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return forms.value.slice(start, end);
});

// ✅ Chargement des formulaires avec cache
const loadForms = async () => {
  loading.value = true;
  
  // Vérifier le cache d'abord
  const cachedForms = formsCache.get();
  if (cachedForms && !searchQuery.value) {
    forms.value = cachedForms;
    loading.value = false;
    return;
  }
  
  try {
    const response = await measurePerformance('Load Forms API', async () => {
      return await $fetch('/api/form', {
        query: {
          page: currentPage.value,
          limit: itemsPerPage.value,
          search: searchQuery.value || undefined,
          sortBy: sortBy.value,
          sortOrder: sortOrder.value
        }
      });
    });

    if (response.success) {
      forms.value = response.data.forms;
      
      // Mettre en cache seulement si pas de recherche
      if (!searchQuery.value) {
        formsCache.set(response.data.forms);
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    loading.value = false;
  }
};

// ✅ Préchargement optimisé des routes d'édition
const preloadFormEdit = useOptimizedDebounce((formId) => {
  preloadRoute(`/form?id=${formId}`);
}, 300);

// ✅ Observer pour le chargement automatique
useIntersectionObserver(
  formsGrid,
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && forms.value.length === 0) {
        loadForms();
      }
    });
  },
  { rootMargin: '50px' }
);

// ✅ Fonctions manquantes pour le template
const previewForm = (form) => {
  previewingForm.value = form;
  showPreviewModal.value = true;
};

const editForm = (form) => {
  navigateTo(`/form?id=${form.id}`);
};

const closePreviewModal = () => {
  showPreviewModal.value = false;
  previewingForm.value = null;
};

// ✅ Fonction utilitaire pour formater les dates
const formatDate = (dateString) => {
  if (!dateString) return 'Non défini';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return 'Date invalide';
  }
};

// ✅ Fonction pour formater le formulaire pour l'aperçu
const formatFormForPreview = (form) => {
  if (!form) return null;
  
  // Convertir le format de base de données vers le format attendu par FormPreview
  return {
    id: form.id,
    title: form.title || 'Formulaire sans titre',
    description: form.description || '',
    steps: form.steps || [],
    layout: form.layout || 'VERTICAL',
    spacing: form.spacing || 'NORMAL',
    submitButtonText: form.submitButtonText || 'Soumettre',
    cancelButtonText: form.cancelButtonText || 'Annuler',
    resetButtonText: form.resetButtonText || 'Réinitialiser'
  };
};

// ✅ Chargement initial
onMounted(() => {
  loadForms();
});

// Reste de votre code existant...
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

.btn-preview {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-preview:hover {
  background: #2563eb;
}

.btn-edit {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-edit:hover {
  background: #e5e7eb;
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
  overflow: auto;
  background: #f8fafc;
  /* ✅ Amélioration du scroll pour les formulaires longs */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.preview-content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.preview-content-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.preview-content-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.preview-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.preview-content-wrapper :deep(.form-preview) {
  height: auto;
  min-height: 100%;
  box-shadow: none;
  border-radius: 0;
}

.preview-content-wrapper :deep(.preview-container) {
  background: transparent;
  padding: 1.5rem 2rem;
  min-height: auto;
}

/* ✅ Amélioration pour les formulaires multi-étapes longs */
.preview-content-wrapper :deep(.preview-form) {
  max-width: none;
  width: 100%;
}

.preview-content-wrapper :deep(.form-header) {
  margin-bottom: 1.5rem;
}

.preview-content-wrapper :deep(.form-actions) {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  position: sticky;
  bottom: 0;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  z-index: 10;
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

  /* ✅ Amélioration du scroll sur mobile */
  .preview-content-wrapper :deep(.preview-container) {
    padding: 1rem 1.5rem;
  }

  .preview-content-wrapper :deep(.form-actions) {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  /* ✅ Amélioration pour les petits écrans */
  .preview-content-wrapper :deep(.form-title) {
    font-size: 1.5rem;
  }

  .preview-content-wrapper :deep(.progress-indicator) {
    margin: 0 auto 1.5rem;
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