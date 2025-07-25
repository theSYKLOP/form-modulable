<template>
  <div class="users-management">
    <!-- Header avec actions -->
    <div class="bg-white border-b border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
          <p class="text-gray-600 mt-1">Gérer tous les utilisateurs de la plateforme</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Bouton de rafraîchissement -->
          <button 
            @click="refreshUsers" 
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            :disabled="loading"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
            title="Actualiser la liste"
          >
            <Icon 
              name="heroicons:arrow-path-20-solid"
              class="w-4 h-4"
              :class="{ 'animate-spin': loading }"
            />
            <span class="hidden sm:inline" v-if="!loading">Actualiser</span>
            <span class="hidden sm:inline" v-else>Chargement...</span>
          </button>
          
          <!-- Bouton principal -->
          <button 
            @click="showCreateModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
          >
            <Icon name="heroicons:plus-20-solid" class="w-5 h-5" />
            Nouvel utilisateur
          </button>
        </div>
      </div>
      
      <!-- Indicateur de dernière mise à jour -->
      <div class="mt-4 text-sm text-gray-500 flex items-center justify-between">
        <span class="flex items-center gap-2">
          <Icon name="heroicons:clock-20-solid" class="w-4 h-4" />
          Dernière mise à jour : 
          <span class="font-medium" :class="isDataFresh ? 'text-green-600' : 'text-orange-600'">
            {{ formatRelativeTime(lastRefresh) }}
          </span>
          <span v-if="isDataFresh" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            À jour
          </span>
        </span>
        <span v-if="users.length > 0">
          {{ total }} utilisateur{{ total > 1 ? 's' : '' }} trouvé{{ total > 1 ? 's' : '' }}
        </span>
      </div>
      
      <!-- Barre de recherche et filtres -->
      <div class="mt-6 flex flex-col sm:flex-row gap-4">
        <!-- Recherche -->
        <div class="relative flex-1 max-w-md">
          <Icon name="heroicons:magnifying-glass-20-solid" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher un utilisateur..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <!-- Filtres par statut -->
        <div class="flex gap-2">
          <button
            @click="setStatusFilter('all')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="statusFilter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'"
          >
            Tous ({{ total }})
          </button>
          <button
            @click="setStatusFilter('verified')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="statusFilter === 'verified' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'"
          >
            Vérifiés ({{ verifiedCount }})
          </button>
          <button
            @click="setStatusFilter('unverified')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="statusFilter === 'unverified' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'"
          >
            Non vérifiés ({{ unverifiedCount }})
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="p-6">
      <!-- État de chargement -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Chargement des utilisateurs...</span>
      </div>
      
      <!-- État vide -->
      <div v-else-if="users.length === 0" class="text-center py-12">
        <Icon name="heroicons:users-20-solid" class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery ? 'Aucun résultat pour cette recherche.' : 'Aucun utilisateur trouvé.' }}
        </p>
      </div>

      <!-- Table des utilisateurs -->
      <div v-else class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistiques
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 group transition-colors">
                <!-- Utilisateur -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="user-avatar-container">
                      <span class="user-avatar-text">
                        {{ getUserInitials(user) }}
                      </span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-medium text-gray-900 truncate">
                        {{ getUserDisplayName(user) }}
                      </div>
                      <div class="text-sm text-gray-500 truncate">{{ user.email }}</div>
                      <div v-if="user.username" class="text-xs text-gray-400 truncate">@{{ user.username }}</div>
                    </div>
                  </div>
                </td>

                <!-- Rôle -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getRoleClass(user.role)"
                  >
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>

                <!-- Statut -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full"
                    :class="user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    <Icon 
                      :name="user.emailVerified ? 'heroicons:check-circle-20-solid' : 'heroicons:x-circle-20-solid'" 
                      class="w-3 h-3 mr-1" 
                    />
                    {{ user.emailVerified ? 'Vérifié' : 'Non vérifié' }}
                  </span>
                </td>

                <!-- Statistiques -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="space-y-1">
                    <div class="flex items-center text-xs text-gray-500">
                      <Icon name="heroicons:document-text-20-solid" class="w-3 h-3 mr-1" />
                      {{ user._count?.forms || 0 }} formulaire{{ (user._count?.forms || 0) > 1 ? 's' : '' }}
                    </div>
                    <div class="flex items-center text-xs text-gray-500">
                      <Icon name="heroicons:paper-airplane-20-solid" class="w-3 h-3 mr-1" />
                      {{ user._count?.formSubmissions || 0 }} soumission{{ (user._count?.formSubmissions || 0) > 1 ? 's' : '' }}
                    </div>
                  </div>
                </td>

                <!-- Dernière connexion -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Jamais' }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="editUser(user)"
                      class="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded"
                      title="Modifier"
                    >
                      <Icon name="heroicons:pencil-20-solid" class="w-4 h-4" />
                    </button>
                    <button
                      @click="toggleEmailVerification(user)"
                      class="transition-colors p-1 rounded"
                      :class="user.emailVerified ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                      :title="user.emailVerified ? 'Désactiver le compte' : 'Activer le compte'"
                    >
                      <Icon 
                        :name="user.emailVerified ? 'heroicons:x-circle-20-solid' : 'heroicons:check-circle-20-solid'" 
                        class="w-4 h-4" 
                      />
                    </button>
                    <button
                      @click="confirmDeleteUser(user)"
                      class="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
                      title="Supprimer"
                    >
                      <Icon name="heroicons:trash-20-solid" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage <= 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Affichage de <span class="font-medium">{{ ((currentPage - 1) * 20) + 1 }}</span> à 
                  <span class="font-medium">{{ Math.min(currentPage * 20, total) }}</span> sur 
                  <span class="font-medium">{{ total }}</span> résultats
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    @click="changePage(currentPage - 1)"
                    :disabled="currentPage <= 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="heroicons:chevron-left-20-solid" class="w-4 h-4" />
                  </button>
                  
                  <button
                    v-for="page in getVisiblePages()"
                    :key="page"
                    @click="changePage(page)"
                    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    :class="page === currentPage 
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                  >
                    {{ page }}
                  </button>
                  
                  <button
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage >= totalPages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="heroicons:chevron-right-20-solid" class="w-4 h-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Modifier l'utilisateur
          </h3>
          <form @submit.prevent="updateUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                v-model="editForm.firstName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                v-model="editForm.lastName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="editForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
              <input
                v-model="editForm.username"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select
                v-model="editForm.role"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
                <option value="MODERATOR">Modérateur</option>
              </select>
            </div>
            <div class="flex items-center">
              <input
                v-model="editForm.emailVerified"
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label class="ml-2 block text-sm text-gray-700">
                Email vérifié
              </label>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showEditModal = false"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="updateLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {{ updateLoading ? 'Mise à jour...' : 'Mettre à jour' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
        <div class="mt-3 text-center">
          <Icon name="heroicons:exclamation-triangle-20-solid" class="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Confirmer la suppression
          </h3>
          <p class="text-sm text-gray-500 mb-6">
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete?.email }}</strong> ?
            Cette action est irréversible.
          </p>
          <div class="flex justify-center space-x-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              @click="deleteUser"
              :disabled="deleteLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {{ deleteLoading ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications toast (optionnel) -->
    <div v-if="notification" class="fixed top-4 right-4 z-50">
      <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div class="flex items-center">
          <Icon 
            :name="notification.type === 'success' ? 'heroicons:check-circle-20-solid' : 'heroicons:x-circle-20-solid'"
            :class="notification.type === 'success' ? 'text-green-500' : 'text-red-500'"
            class="w-5 h-5 mr-3"
          />
          <p class="text-sm text-gray-900">{{ notification.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Gestion des utilisateurs - Admin'
})

// États réactifs
const loading = ref(false)
const updateLoading = ref(false)
const deleteLoading = ref(false)
const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const lastRefresh = ref(new Date())

// Filtres et recherche
const searchQuery = ref('')
const statusFilter = ref('all') // 'all', 'verified', 'unverified'

// Modals
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showCreateModal = ref(false)
const userToDelete = ref(null)

// Formulaire d'édition
const editForm = ref({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  role: 'USER',
  emailVerified: false
})

// Notifications
const notification = ref(null)

// Computed pour les compteurs de statut
const verifiedCount = computed(() => {
  return users.value.filter(user => user.emailVerified).length
})

const unverifiedCount = computed(() => {
  return users.value.filter(user => !user.emailVerified).length
})

// Computed pour savoir si les données sont fraîches (moins de 1 minute)
const isDataFresh = computed(() => {
  if (!lastRefresh.value) return false
  const now = new Date()
  const diff = now.getTime() - lastRefresh.value.getTime()
  return diff < 60000 // Moins d'1 minute = fraîche
})

// Fonction pour changer le filtre de statut
const setStatusFilter = (filter) => {
  statusFilter.value = filter
  currentPage.value = 1
  loadUsers(true)
}

// Fonctions utilitaires
const getUserInitials = (user) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  } else if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase()
  } else if (user.lastName) {
    return user.lastName.charAt(0).toUpperCase()
  } else {
    return user.email.charAt(0).toUpperCase()
  }
}

const getUserDisplayName = (user) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  } else if (user.firstName) {
    return user.firstName
  } else if (user.lastName) {
    return user.lastName
  } else {
    return 'Utilisateur'
  }
}

const getRoleClass = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800'
    case 'MODERATOR':
      return 'bg-yellow-100 text-yellow-800'
    case 'USER':
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'Administrateur'
    case 'MODERATOR':
      return 'Modérateur'
    case 'USER':
    default:
      return 'Utilisateur'
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'À l\'instant'
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `Il y a ${diffInDays}j`
    } else {
      return date.toLocaleDateString('fr-FR')
    }
  }
}

// Fonction pour formater le temps relatif
const formatRelativeTime = (date) => {
  if (!date) return 'Jamais'
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (seconds < 30) return 'À l\'instant'
  if (seconds < 60) return `Il y a ${seconds} secondes`
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getVisiblePages = () => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
}

// Fonctions de recherche et pagination
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadUsers(true)
}, 500)

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadUsers()
  }
}

// Fonction pour charger les utilisateurs - CORRIGÉE
const loadUsers = async (force = false) => {
  // Éviter les rechargements trop fréquents (sauf si forcé)
  if (!force && loading.value) {
    console.log('⚠️ Chargement déjà en cours, ignoré')
    return
  }
  
  try {
    loading.value = true
    
    console.log('🔄 Chargement des utilisateurs...', { 
      force, 
      timestamp: new Date().toLocaleTimeString() 
    })
    
    // Construction des paramètres de requête
    const queryParams = {
      page: currentPage.value,
      limit: 20,
      search: searchQuery.value || undefined,
      status: statusFilter.value === 'all' ? undefined : statusFilter.value,
      // Ajouter un timestamp pour éviter le cache
      _t: Date.now()
    }
    
    // Utiliser $fetch correctement
    const response = await $fetch('/api/admin/users', {
      query: queryParams
    })
    
    if (response.success) {
      users.value = response.data.users || []
      total.value = response.data.pagination.total
      totalPages.value = response.data.pagination.totalPages
      lastRefresh.value = new Date()
      
      console.log('✅ Utilisateurs chargés:', {
        count: users.value.length,
        filter: statusFilter.value,
        timestamp: lastRefresh.value.toLocaleTimeString()
      })
    }
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
    showNotification('Erreur lors du chargement des utilisateurs', 'error')
  } finally {
    loading.value = false
  }
}

const refreshUsers = () => {
  console.log('🔄 Rafraîchissement manuel demandé')
  loadUsers(true)
}

// Fonctions de gestion des utilisateurs
const editUser = (user) => {
  editForm.value = {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    username: user.username || '',
    role: user.role,
    emailVerified: !!user.emailVerified
  }
  showEditModal.value = true
}

const updateUser = async () => {
  try {
    updateLoading.value = true
    
    const response = await $fetch(`/api/admin/users/${editForm.value.id}`, {
      method: 'PUT',
      body: editForm.value
    })
    
    if (response.success) {
      showNotification('Utilisateur mis à jour avec succès', 'success')
      showEditModal.value = false
      await loadUsers(true) // Recharger la liste
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    showNotification(error.data?.message || 'Erreur lors de la mise à jour', 'error')
  } finally {
    updateLoading.value = false
  }
}

const toggleEmailVerification = async (user) => {
  try {
    const newStatus = !user.emailVerified
    
    const response = await $fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      body: {
        emailVerified: newStatus
      }
    })
    
    if (response.success) {
      showNotification(
        `Compte ${newStatus ? 'activé' : 'désactivé'} avec succès`, 
        'success'
      )
      await loadUsers(true) // Recharger la liste
    }
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    showNotification('Erreur lors du changement de statut', 'error')
  }
}

const confirmDeleteUser = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  try {
    deleteLoading.value = true
    
    const response = await $fetch(`/api/admin/users/${userToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      showNotification('Utilisateur supprimé avec succès', 'success')
      showDeleteModal.value = false
      userToDelete.value = null
      await loadUsers(true) // Recharger la liste
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    showNotification(error.data?.message || 'Erreur lors de la suppression', 'error')
  } finally {
    deleteLoading.value = false
  }
}

// Fonction pour afficher les notifications
const showNotification = (message, type = 'success') => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

// Charger les utilisateurs au montage
onMounted(() => {
  loadUsers()
  
  // Polling automatique toutes les 30 secondes (optionnel)
  const pollingInterval = setInterval(() => {
    if (!document.hidden && !loading.value) {
      console.log('🔄 Polling automatique - rafraîchissement des données')
      loadUsers(true)
    }
  }, 30000) // 30 secondes
  
  // Nettoyer l'intervalle quand le composant est démonté
  onUnmounted(() => {
    clearInterval(pollingInterval)
  })
})

// Écouter les changements de visibilité de la page
if (process.client) {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !loading.value) {
      // La page redevient visible, recharger les données
      console.log('👁️ Page redevenue visible - rafraîchissement')
      loadUsers(true)
    }
  })
}
</script>