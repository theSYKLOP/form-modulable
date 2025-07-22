<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div class="w-64 bg-white shadow-lg fixed h-full z-30" :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'">
      <!-- Logo -->
      <div class="p-6 border-b border-gray-200">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:cog-6-tooth" class="w-6 h-6 text-white" />
          </div>
          <div>
            <span class="text-xl font-bold text-gray-900">Admin</span>
            <p class="text-xs text-gray-500">Form Modulable</p>
          </div>
        </NuxtLink>
      </div>
      
      <!-- Navigation -->
      <nav class="mt-6">
        <div class="px-4 space-y-2">
          <NuxtLink 
            to="/admin"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            :class="$route.path === '/admin' 
              ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'"
          >
            <Icon name="heroicons:chart-bar-square" class="w-5 h-5 mr-3" />
            Tableau de bord
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/formulaires"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/formulaires') 
              ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'"
          >
            <Icon name="heroicons:document-text" class="w-5 h-5 mr-3" />
            Formulaires
            <span v-if="formCount" class="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              {{ formCount }}
            </span>
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/utilisateurs"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/utilisateurs') 
              ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'"
          >
            <Icon name="heroicons:users" class="w-5 h-5 mr-3" />
            Utilisateurs
            <span v-if="userCount" class="ml-auto bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
              {{ userCount }}
            </span>
          </NuxtLink>
        </div>
      </nav>
      
      <!-- Informations utilisateur -->
      <div class="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {{ user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ userFullName }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              Administrateur
            </p>
          </div>
        </div>
        
        <div class="flex space-x-2">
          <NuxtLink 
            to="/"
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-xs font-medium text-center transition-colors"
          >
            <Icon name="heroicons:home" class="w-4 h-4 mx-auto" />
          </NuxtLink>
          <button 
            @click="handleLogout"
            class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-md text-xs font-medium transition-colors"
          >
            <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay mobile -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Contenu principal -->
    <div class="flex-1 md:ml-64">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div class="flex justify-between items-center px-6 py-4">
          <div class="flex items-center space-x-4">
            <!-- Menu burger mobile -->
            <button 
              @click="sidebarOpen = !sidebarOpen"
              class="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <Icon name="heroicons:bars-3" class="w-6 h-6" />
            </button>
            
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                {{ pageTitle }}
              </h1>
              <p class="text-sm text-gray-500">
                {{ pageDescription }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button class="relative p-2 rounded-full text-gray-700 hover:text-blue-600 hover:bg-gray-100">
              <Icon name="heroicons:bell" class="w-6 h-6" />
              <span v-if="notificationCount" class="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ notificationCount }}
              </span>
            </button>
            
            <!-- Menu utilisateur -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {{ user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A' }}
                </div>
                <Icon name="heroicons:chevron-down" class="w-4 h-4 text-gray-500" />
              </button>
              
              <!-- Dropdown menu -->
              <div v-if="showUserMenu" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div class="py-1">
                  <div class="px-4 py-2 text-sm text-gray-500 border-b">
                    {{ user?.email }}
                  </div>
                  <NuxtLink
                    to="/admin/profil"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="showUserMenu = false"
                  >
                    <Icon name="heroicons:user" class="w-4 h-4 mr-2 inline" />
                    Mon profil
                  </NuxtLink>
                  <NuxtLink
                    to="/admin/parametres"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="showUserMenu = false"
                  >
                    <Icon name="heroicons:cog-6-tooth" class="w-4 h-4 mr-2 inline" />
                    Paramètres
                  </NuxtLink>
                  <div class="border-t border-gray-100"></div>
                  <NuxtLink
                    to="/"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="showUserMenu = false"
                  >
                    <Icon name="heroicons:home" class="w-4 h-4 mr-2 inline" />
                    Retour au site
                  </NuxtLink>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-2 inline" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenu -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
// Store d'authentification
const authStore = useAuthStore()
const { user, userFullName } = storeToRefs(authStore)

// Route actuelle
const route = useRoute()

// État local
const sidebarOpen = ref(false)
const showUserMenu = ref(false)

// ✅ Données réelles pour les badges (remplace les données fictives)
const formCount = ref(0)
const userCount = ref(0)
const notificationCount = ref(3) // Peut rester fictif pour l'instant
const isLoadingStats = ref(false)

// ✅ Charger les statistiques réelles
const loadStats = async () => {
  if (isLoadingStats.value) return // Éviter les appels multiples
  
  isLoadingStats.value = true
  try {
    // Charger le nombre de formulaires
    try {
      const formsResponse = await $fetch('/api/form?page=1&limit=1')
      if (formsResponse?.success && formsResponse.data) {
        formCount.value = formsResponse.data.pagination.totalCount
      }
    } catch (formError) {
      console.error('Erreur lors du chargement des formulaires:', formError)
      // Garder la valeur précédente en cas d'erreur
    }
    
    // Charger le nombre d'utilisateurs
    try {
      const usersResponse = await $fetch('/api/admin/users?page=1&limit=1')
      if (usersResponse?.success && usersResponse.data) {
        userCount.value = usersResponse.data.pagination.totalCount
      }
    } catch (userError) {
      console.error('Erreur lors du chargement des utilisateurs:', userError)
      // Si l'API utilisateurs n'existe pas encore ou erreur d'auth, garder 0
      if (userError.statusCode === 403 || userError.statusCode === 401) {
        userCount.value = 0
      }
    }
  } catch (error) {
    console.error('Erreur générale lors du chargement des statistiques:', error)
  } finally {
    isLoadingStats.value = false
  }
}

// Titre et description de la page selon la route
const pageTitle = computed(() => {
  const titles = {
    '/admin': 'Tableau de bord',
    '/admin/formulaires': 'Gestion des formulaires',
    '/admin/utilisateurs': 'Gestion des utilisateurs',
    '/admin/profil': 'Mon profil',
    '/admin/parametres': 'Paramètres'
  }
  return titles[route.path] || 'Administration'
})

const pageDescription = computed(() => {
  const descriptions = {
    '/admin': 'Vue d\'ensemble des statistiques et activités',
    '/admin/formulaires': 'Gérer tous les formulaires de la plateforme',
    '/admin/utilisateurs': 'Gérer les utilisateurs et leurs permissions',
    '/admin/profil': 'Gérer votre profil administrateur',
    '/admin/parametres': 'Configuration de la plateforme'
  }
  return descriptions[route.path] || 'Interface d\'administration'
})

// Gestion de la déconnexion
const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout()
}

// Fermer les menus quand on navigue
watch(route, () => {
  sidebarOpen.value = false
  showUserMenu.value = false
  
  // ✅ Rafraîchir les statistiques quand on navigue (utile après ajout/suppression)
  if (route.path.startsWith('/admin/')) {
    loadStats()
  }
})

// Fermer le menu utilisateur quand on clique ailleurs
onMounted(() => {
  // ✅ Charger les statistiques au montage
  loadStats()
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})

// Vérifier les permissions admin
onMounted(() => {
  // ✅ Ne pas vérifier les permissions sur la page de loading qui gère sa propre vérification
  const route = useRoute()
  if (route.path === '/admin/loading') {
    return
  }
  
  if (!user.value || user.value.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès refusé - Permissions administrateur requises'
    })
  }
})

// ✅ Exposer la fonction de rechargement des stats pour les pages enfants
provide('refreshAdminStats', loadStats)
</script>