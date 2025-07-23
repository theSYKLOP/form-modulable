<template>
  <div class="forms-management">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Gestion des formulaires</h1>
          <p class="text-gray-600 mt-1">Gérer tous les formulaires de la plateforme</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Bouton de rafraîchissement -->
          <button 
            @click="refreshForms" 
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            :disabled="loading"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
            title="Actualiser la liste"
          >
            <Icon 
              name="heroicons:arrow-path" 
              class="w-4 h-4 transition-transform" 
              :class="{ 'animate-spin': loading }"
            />
            <span class="hidden sm:inline" v-if="!loading">Actualiser</span>
            <span class="hidden sm:inline" v-else>Chargement...</span>
          </button>
          
          <!-- Bouton principal -->
          <NuxtLink to="/form" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors">
            <Icon name="heroicons:plus" class="w-5 h-5" />
            Nouveau formulaire
          </NuxtLink>
        </div>
      </div>
      
      <!-- Indicateur de dernière mise à jour -->
      <div class="mt-4 text-sm text-gray-500 flex items-center justify-between">
        <span class="flex items-center gap-2">
          <Icon name="heroicons:clock" class="w-4 h-4" />
          Dernière mise à jour : 
          <span class="font-medium" :class="isDataFresh ? 'text-green-600' : 'text-orange-600'">
            {{ formatRelativeTime(lastRefresh) }}
          </span>
          <span v-if="isDataFresh" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            À jour
          </span>
        </span>
        <span v-if="forms.length > 0">
          {{ forms.length }} formulaire{{ forms.length > 1 ? 's' : '' }} trouvé{{ forms.length > 1 ? 's' : '' }}
        </span>
      </div>
      
      <!-- Barre de recherche et filtres -->
      <div class="mt-6 flex flex-col sm:flex-row gap-4">
        <!-- Recherche -->
        <div class="relative flex-1 max-w-md">
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher un formulaire..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <!-- Filtre par statut -->
        <div class="flex gap-2">
          <button
            @click="setStatusFilter('all')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="statusFilter === 'all' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'"
          >
            Tous ({{ forms.length }})
          </button>
          <button
            @click="setStatusFilter('published')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="statusFilter === 'published' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'"
          >
            Publiés ({{ publishedCount }})
          </button>
          <button
            @click="setStatusFilter('draft')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="statusFilter === 'draft' 
              ? 'bg-orange-100 text-orange-700 border border-orange-200' 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'"
          >
            Brouillons ({{ draftCount }})
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="p-6">
      <!-- État de chargement -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Chargement des formulaires...</span>
      </div>
      
      <!-- État vide -->
      <div v-else-if="forms.length === 0" class="text-center py-12">
        <Icon name="heroicons:document-text" class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun formulaire</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery ? 'Aucun résultat pour cette recherche.' : 'Commencez par créer votre premier formulaire.' }}
        </p>
        <div class="mt-6">
          <NuxtLink to="/form" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <Icon name="heroicons:plus" class="-ml-1 mr-2 h-5 w-5" />
            Nouveau formulaire
          </NuxtLink>
        </div>
      </div>
      
      <!-- Grille des formulaires -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="form in forms" 
          :key="form.id"
          class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 group"
        >
          <!-- En-tête de la card -->
          <div class="flex items-start gap-3 mb-4">
            <div class="form-icon-container">
              <Icon :name="form.icon || 'heroicons:document-text'" class="form-icon" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-lg font-medium text-gray-900 truncate">
                  {{ form.title || 'Formulaire sans titre' }}
                </h3>
                <!-- Badge de statut de publication -->
                <span 
                  v-if="form.isPublished" 
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                  Publié
                </span>
                <span 
                  v-else 
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                >
                  <div class="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></div>
                  Brouillon
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                {{ form.description || 'Aucune description' }}
              </p>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="flex justify-between text-sm text-gray-500 mb-4">
            <span class="flex items-center gap-1">
              <Icon name="heroicons:queue-list" class="w-4 h-4" />
              {{ form.stepsCount || 0 }} étapes
            </span>
            <span class="flex items-center gap-1">
              <Icon name="heroicons:users" class="w-4 h-4" />
              {{ form.submissionsCount || 0 }} soumissions
            </span>
          </div>
          
          <!-- Footer avec actions -->
          <div class="pt-4 border-t border-gray-100">
            <div class="flex justify-between items-center">
              <div class="text-xs text-gray-500">
                <div>Créé {{ formatDate(form.createdAt) }}</div>
                <div class="mt-1">Modifié {{ formatDate(form.updatedAt) }}</div>
              </div>
              
              <!-- Boutons d'action -->
              <div class="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                <!-- Toggle de publication -->
                <button 
                  @click="togglePublished(form)"
                  :disabled="updatingForms.has(form.id)"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="form.isPublished ? 'Dépublier' : 'Publier'"
                >
                  <div v-if="updatingForms.has(form.id)" class="w-4 h-4">
                    <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                  </div>
                  <Icon 
                    v-else
                    :name="form.isPublished ? 'heroicons:archive-box' : 'heroicons:globe-alt'" 
                    class="w-4 h-4" 
                  />
                </button>
                <button 
                  @click="previewForm(form)"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Aperçu"
                >
                  <Icon name="heroicons:eye" class="w-4 h-4" />
                </button>
                <button 
                  @click="editForm(form)"
                  class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Modifier"
                >
                  <Icon name="heroicons:pencil" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de prévisualisation -->
    <div v-if="showPreviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <!-- Header modal -->
        <div class="flex justify-between items-center p-6 border-b">
          <div>
            <h3 class="text-lg font-medium text-gray-900">Aperçu du formulaire</h3>
            <p class="text-sm text-gray-500">{{ previewingForm?.title || 'Formulaire sans titre' }}</p>
          </div>
          <button @click="closePreviewModal" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>
        
        <!-- Corps modal -->
        <div class="overflow-y-auto max-h-[70vh]">
          <div v-if="previewingForm" class="h-full">
            <!-- En-tête avec informations du formulaire -->
            <div class="bg-gray-50 p-4 border-b">
              <div class="flex justify-between items-start">
                <div class="flex items-start gap-3">
                  <div class="modal-form-icon-container">
                    <Icon :name="previewingForm.icon || 'heroicons:document-text'" class="modal-form-icon" />
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ previewingForm.title }}</h4>
                    <p class="text-gray-600 text-sm mt-1">{{ previewingForm.description }}</p>
                  </div>
                </div>
                <div class="flex gap-4 text-sm">
                  <div class="text-center">
                    <div class="font-bold text-blue-600">{{ previewingForm.stepsCount || 0 }}</div>
                    <div class="text-gray-600">Étapes</div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-green-600">{{ previewingForm.fieldsCount || 0 }}</div>
                    <div class="text-gray-600">Champs</div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-purple-600">{{ previewingForm.submissionsCount || 0 }}</div>
                    <div class="text-gray-600">Soumissions</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Composant FormPreview -->
            <div class="p-6">
              <FormPreview :form-config="previewingForm" />
            </div>
          </div>
        </div>
        
        <!-- Footer modal -->
        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button @click="closePreviewModal" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Fermer
          </button>
          <button @click="editForm(previewingForm)" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Modifier
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ✅ Import du composant FormPreview
import FormPreview from '~/pages/form/components/FormPreview.vue';
import { onActivated, onUnmounted } from 'vue';

// ✅ Configuration de la page admin
definePageMeta({
  layout: 'admin'
});

// ✅ Configuration SEO
useHead({
  title: 'Gestion des formulaires - Admin',
  meta: [
    { name: 'description', content: 'Interface d\'administration pour gérer les formulaires' }
  ]
});

// États principaux
const forms = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all'); // 'all', 'published', 'draft'
const loading = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(12);
const lastRefresh = ref(new Date());

// Modal de prévisualisation
const showPreviewModal = ref(false);
const previewingForm = ref(null);

// États pour la gestion des mises à jour
const updatingForms = ref(new Set());

// ✅ Recherche avec debounce simple
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1;
  loadForms(true); // Force le rechargement lors de la recherche
}, 300);

// ✅ Computed pour les compteurs de statut
const publishedCount = computed(() => {
  return forms.value.filter(form => form.isPublished).length
})

const draftCount = computed(() => {
  return forms.value.filter(form => !form.isPublished).length
})

// ✅ Fonction pour changer le filtre de statut
const setStatusFilter = (filter) => {
  statusFilter.value = filter
  currentPage.value = 1
  loadForms(true)
}

// ✅ Fonction pour rafraîchir manuellement
const refreshForms = () => {
  console.log('🔄 Rafraîchissement manuel demandé');
  loadForms(true);
};

// ✅ Computed pour savoir si les données sont fraîches (moins de 1 minute)
const isDataFresh = computed(() => {
  if (!lastRefresh.value) return false;
  const now = new Date();
  const diff = now.getTime() - lastRefresh.value.getTime();
  return diff < 60000; // Moins d'1 minute = fraîche
});

// ✅ Chargement des formulaires simplifié
const loadForms = async (force = false) => {
  // Éviter les rechargements trop fréquents (sauf si forcé)
  if (!force && loading.value) {
    console.log('⚠️ Chargement déjà en cours, ignoré');
    return;
  }
  
  loading.value = true;
  
  try {
    console.log('🔄 Chargement des formulaires...', { force, timestamp: new Date().toLocaleTimeString() });
    
    // Construction des paramètres de requête
    const queryParams = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      // ✅ Ajouter un timestamp pour éviter le cache
      _t: Date.now()
    }
    
    // ✅ Ajouter le filtre de statut si nécessaire
    if (statusFilter.value === 'published') {
      queryParams.isPublished = 'true'
    } else if (statusFilter.value === 'draft') {
      queryParams.isPublished = 'false'
    }
    // Si 'all', on ne filtre pas par isPublished
    
    const response = await $fetch('/api/form', {
      query: queryParams
    });

    if (response.success) {
      forms.value = response.data.forms || [];
      lastRefresh.value = new Date();
      
      console.log('✅ Formulaires chargés:', {
        count: forms.value.length,
        filter: statusFilter.value,
        timestamp: lastRefresh.value.toLocaleTimeString()
      });
      
      // ✅ Debug pour voir la structure des données
      if (forms.value.length > 0) {
        console.log('Premier formulaire récupéré:', {
          title: forms.value[0].title,
          description: forms.value[0].description,
          icon: forms.value[0].icon,
          isPublished: forms.value[0].isPublished,
          stepsCount: forms.value[0].stepsCount,
          fieldsCount: forms.value[0].fieldsCount,
          submissionsCount: forms.value[0].submissionsCount,
          updatedAt: forms.value[0].updatedAt
        });
      }
    } else {
      console.error('Erreur API:', response.message);
      forms.value = [];
    }
  } catch (error) {
    console.error('Erreur de chargement des formulaires:', error);
    forms.value = [];
  } finally {
    loading.value = false;
  }
};

// ✅ Fonctions pour les actions
const togglePublished = async (form) => {
  try {
    updatingForms.value.add(form.id)
    
    const newPublishedStatus = !form.isPublished
    
    console.log(`🔄 ${newPublishedStatus ? 'Publication' : 'Dépublication'} du formulaire:`, form.title)
    
    const response = await $fetch(`/api/form/${form.id}`, {
      method: 'PUT',
      body: {
        isPublished: newPublishedStatus
      }
    })
    
    if (response.success) {
      // Mettre à jour localement le statut
      const formIndex = forms.value.findIndex(f => f.id === form.id)
      if (formIndex !== -1) {
        forms.value[formIndex].isPublished = newPublishedStatus
        if (newPublishedStatus) {
          forms.value[formIndex].publishedAt = new Date().toISOString()
        }
      }
      
      console.log(`✅ Formulaire ${newPublishedStatus ? 'publié' : 'dépublié'} avec succès`)
      
      // ✅ Invalider le cache de la page d'accueil pour forcer le rechargement des formulaires publiés
      try {
        if (process.client) {
          // Invalider le cache côté client
          await clearNuxtData()
          
          // Optionnel: Si vous voulez forcer le rechargement de la page d'accueil
          // await refreshCookie('homepage-forms')
          console.log('🔄 Cache invalidé - la page d\'accueil se mettra à jour')
        }
      } catch (cacheError) {
        console.warn('⚠️ Erreur lors de l\'invalidation du cache:', cacheError)
      }
      
      // Optionnel: Afficher une notification de succès
      // showNotification(`Formulaire ${newPublishedStatus ? 'publié' : 'dépublié'} avec succès`, 'success')
    } else {
      console.error('Erreur lors de la mise à jour:', response.message)
      // Optionnel: Afficher une notification d'erreur
      // showNotification('Erreur lors de la mise à jour du statut', 'error')
    }
  } catch (error) {
    console.error(`Erreur lors du toggle de publication:`, error)
    // Optionnel: Afficher une notification d'erreur
    // showNotification('Erreur lors de la mise à jour du statut', 'error')
  } finally {
    updatingForms.value.delete(form.id)
  }
}

const previewForm = async (form) => {
  try {
    // Récupérer les données complètes du formulaire avec les steps
    const fullForm = await $fetch(`/api/form/${form.id}`);
    
    if (fullForm.success && fullForm.data) {
      // ✅ Adapter la structure pour être compatible avec le template
      // L'API /api/form/[id] retourne les stats dans .stats, mais le template attend les stats à la racine
      const adaptedForm = {
        ...fullForm.data,
        // Copier les stats depuis l'objet stats vers la racine pour compatibilité
        stepsCount: fullForm.data.stats?.stepsCount || 0,
        fieldsCount: fullForm.data.stats?.fieldsCount || 0,
        submissionsCount: fullForm.data.stats?.submissionsCount || 0
      };
      
      console.log('Formulaire adapté pour preview:', {
        title: adaptedForm.title,
        stepsCount: adaptedForm.stepsCount,
        fieldsCount: adaptedForm.fieldsCount,
        submissionsCount: adaptedForm.submissionsCount,
        hasSteps: Array.isArray(adaptedForm.steps),
        stepsLength: adaptedForm.steps?.length
      });
      
      previewingForm.value = adaptedForm;
    } else {
      // Fallback sur les données existantes
      previewingForm.value = form;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du formulaire:', error);
    // Fallback sur les données existantes
    previewingForm.value = form;
  }
  
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

// ✅ Fonction pour formater le temps relatif
const formatRelativeTime = (date) => {
  if (!date) return 'Jamais';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 30) return 'À l\'instant';
  if (seconds < 60) return `Il y a ${seconds} secondes`;
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// ✅ Chargement initial
onMounted(() => {
  loadForms();
  
  // ✅ Polling automatique toutes les 30 secondes (optionnel)
  const pollingInterval = setInterval(() => {
    if (!document.hidden && !loading.value) {
      console.log('🔄 Polling automatique - rafraîchissement des données');
      loadForms(true);
    }
  }, 30000); // 30 secondes
  
  // Nettoyer l'intervalle quand le composant est démonté
  onUnmounted(() => {
    clearInterval(pollingInterval);
  });
});

// ✅ Rafraîchir quand on revient sur la page (navigation)
onActivated(() => {
  // Recharger les formulaires quand la page devient active
  loadForms(true);
});

// ✅ Écouter les changements de visibilité de la page
if (process.client) {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !loading.value) {
      // La page redevient visible, recharger les données
      console.log('👁️ Page redevenue visible - rafraîchissement');
      loadForms(true);
    }
  });
}
</script>

<style scoped>
/* Styles de base simplifiés */
.forms-management {
  min-height: 100vh;
  background: #f8fafc;
}

/* Styles pour les icônes de formulaire */
.form-icon-container {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #3b82f6;
}

.modal-form-icon-container {
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-form-icon {
  width: 2rem;
  height: 2rem;
  color: #3b82f6;
}

/* Limitation du texte sur 2 lignes */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: calc(2 * 1.4em);
}

/* Animation spin */
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

/* Améliorations UX pour les cards */
.group:hover .form-icon-container {
  background: #dbeafe;
  border-color: #93c5fd;
}

.group:hover .form-icon {
  color: #2563eb;
}

/* Responsiveness améliorée */
@media (max-width: 640px) {
  .forms-management .p-6 {
    padding: 1rem;
  }
  
  .grid {
    gap: 1rem;
  }
}
</style>