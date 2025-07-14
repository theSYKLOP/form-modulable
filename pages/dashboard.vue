<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Form Modulable</h1>
          </div>
          
          <!-- Menu utilisateur -->
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">
              Bonjour, {{ userFullName }}
            </span>
            
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {{ user?.firstName?.charAt(0) || user?.email?.charAt(0) || '?' }}
                </div>
              </button>
              
              <!-- Dropdown menu -->
              <div v-if="showUserMenu" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div class="py-1">
                  <NuxtLink
                    to="/auth/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="showUserMenu = false"
                  >
                    Mon profil
                  </NuxtLink>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Tableau de bord</h2>
          <p class="text-gray-600">Bienvenue sur votre espace personnel Form Modulable</p>
        </div>

        <!-- Informations utilisateur -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Informations du compte</h3>
          </div>
          <div class="px-6 py-4">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user?.email }}</dd>
              </div>
              <div v-if="user?.username">
                <dt class="text-sm font-medium text-gray-500">Nom d'utilisateur</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.username }}</dd>
              </div>
              <div v-if="user?.firstName">
                <dt class="text-sm font-medium text-gray-500">Prénom</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.firstName }}</dd>
              </div>
              <div v-if="user?.lastName">
                <dt class="text-sm font-medium text-gray-500">Nom</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.lastName }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Statut de l'email</dt>
                <dd class="mt-1 text-sm">
                  <span v-if="user?.emailVerified" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Vérifié
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Non vérifié
                  </span>
                </dd>
              </div>
              <div v-if="user?.lastLoginAt">
                <dt class="text-sm font-medium text-gray-500">Dernière connexion</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.lastLoginAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Icon name="heroicons:document-text" class="h-6 w-6 text-blue-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Mes formulaires</dt>
                    <dd class="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <div class="text-sm">
                <NuxtLink to="/forms" class="font-medium text-blue-700 hover:text-blue-900">
                  Voir tous les formulaires
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Icon name="heroicons:template" class="h-6 w-6 text-green-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Templates</dt>
                    <dd class="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <div class="text-sm">
                <NuxtLink to="/templates" class="font-medium text-green-700 hover:text-green-900">
                  Parcourir les templates
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <Icon name="heroicons:user-circle" class="h-6 w-6 text-purple-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Mon profil</dt>
                    <dd class="text-lg font-medium text-gray-900">Gérer</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <div class="text-sm">
                <NuxtLink to="/auth/profile" class="font-medium text-purple-700 hover:text-purple-900">
                  Modifier le profil
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const { logout } = authStore
const { user, userFullName } = storeToRefs(authStore)

// Meta données de la page
useHead({
  title: 'Dashboard - Form Modulable',
  meta: [
    { name: 'description', content: 'Tableau de bord Form Modulable' }
  ]
})

// État local
const showUserMenu = ref(false)

// Gestion de la déconnexion
const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
}

// Fermer le menu utilisateur quand on clique ailleurs
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})

// Fonction pour formater les dates
const formatDate = (dateString) => {
  if (!dateString) return 'Non défini'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Vérification de l'authentification au montage
onMounted(async () => {
  await authStore.checkAuthStatus()
})
</script>
