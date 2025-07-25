<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:document-text" class="w-5 h-5 text-white" />
              </div>
              <span class="text-xl font-bold text-gray-900">Form Modulable</span>
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink 
              to="/" 
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/' }"
            >
              Accueil
            </NuxtLink>
            <NuxtLink 
               v-if="isAuthenticated"
              to="/operations" 
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/operations' }"
            >
              Opérations
            </NuxtLink>
            <NuxtLink 
              to="/about" 
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path === '/about' }"
            >
              À propos
            </NuxtLink>
            
            <!-- Dashboard link for admin users only -->
            <NuxtLink 
              v-if="isAuthenticated && isAdmin"
              to="/admin" 
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-blue-600 bg-blue-50': $route.path.startsWith('/admin') }"
            >
              Dashboard
            </NuxtLink>
          </div>

          <!-- Boutons connexion/déconnexion -->
          <div class="flex items-center space-x-4">
            <!-- Bouton connexion (si non connecté) -->
            <NuxtLink 
              v-if="!isAuthenticated"
              to="/auth?form=login" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Connexion
            </NuxtLink>
            
            <!-- Menu utilisateur connecté -->
            <div v-else class="flex items-center space-x-4">
              <span class="text-gray-700 text-sm">
                Bonjour, {{ user?.firstName || 'Utilisateur' }}
              </span>
              <button 
                @click="handleLogout"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Déconnexion
              </button>
            </div>
            
            <!-- Menu mobile -->
            <button 
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              <Icon name="heroicons:bars-3" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Menu mobile -->
        <div v-if="mobileMenuOpen" class="md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <NuxtLink 
              to="/" 
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              @click="mobileMenuOpen = false"
            >
              Accueil
            </NuxtLink>
            <NuxtLink 
              to="/operations" 
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              @click="mobileMenuOpen = false"
            >
              Opérations
            </NuxtLink>
            <NuxtLink 
              to="/about" 
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              @click="mobileMenuOpen = false"
            >
              À propos
            </NuxtLink>
            
            <!-- Dashboard mobile -->
            <NuxtLink 
              v-if="isAuthenticated && isAdmin"
              to="/admin" 
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              @click="mobileMenuOpen = false"
            >
              Dashboard
            </NuxtLink>
            
            <!-- Connexion/Déconnexion mobile -->
            <NuxtLink 
              v-if="!isAuthenticated"
              to="/auth?form=login" 
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              @click="mobileMenuOpen = false"
            >
              Connexion
            </NuxtLink>
            <button 
              v-else
              @click="handleLogout"
              class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- Contenu principal -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Logo et description -->
          <div class="md:col-span-1">
            <div class="flex items-center space-x-2 mb-4">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:document-text" class="w-5 h-5 text-white" />
              </div>
              <span class="text-xl font-bold">Form Modulable</span>
            </div>
            <p class="text-gray-400 text-sm">
              Simplifiez vos démarches administratives avec notre plateforme moderne et intuitive.
            </p>
          </div>

          <!-- Liens rapides -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors">Accueil</NuxtLink></li>
              <li><NuxtLink to="/operations" class="text-gray-400 hover:text-white transition-colors">Opérations</NuxtLink></li>
              <li><NuxtLink to="/about" class="text-gray-400 hover:text-white transition-colors">À propos</NuxtLink></li>
              <li v-if="!isAuthenticated"><NuxtLink to="/auth?form=login" class="text-gray-400 hover:text-white transition-colors">Connexion</NuxtLink></li>
              <li v-else-if="isAdmin"><NuxtLink to="/admin" class="text-gray-400 hover:text-white transition-colors">Dashboard</NuxtLink></li>
            </ul>
          </div>

          <!-- Services -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Services</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Formulaires en ligne</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Suivi des démarches</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Documents numériques</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Support 24/7</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Contact</h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center space-x-2">
                <Icon name="heroicons:envelope" class="w-4 h-4" />
                <span class="text-gray-400">contact@formmodulable.fr</span>
              </li>
              <li class="flex items-center space-x-2">
                <Icon name="heroicons:phone" class="w-4 h-4" />
                <span class="text-gray-400">+33 1 23 45 67 89</span>
              </li>
              <li class="flex items-center space-x-2">
                <Icon name="heroicons:map-pin" class="w-4 h-4" />
                <span class="text-gray-400">Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-gray-800 mt-8 pt-8 text-center">
          <p class="text-gray-400 text-sm">
            © {{ new Date().getFullYear() }} Form Modulable. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>

    <!-- ✅ Système de notifications toast -->
    <ToastNotifications />
  </div>
</template>

<script setup>
// Composable d'authentification
const { user, isAuthenticated, isAdmin, logout } = useAuth()

// État local
const mobileMenuOpen = ref(false)

// Fonction de déconnexion
const handleLogout = async () => {
  try {
    await logout()
    await navigateTo('/')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

// Fermer le menu mobile quand on navigue
const route = useRoute()
watch(route, () => {
  mobileMenuOpen.value = false
})
</script>