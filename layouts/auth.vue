<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation simple en haut -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2 group">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-200">
                <Icon name="heroicons:document-text" class="w-5 h-5 text-white" />
              </div>
              <span class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Form Modulable
              </span>
            </NuxtLink>
          </div>

          <!-- Actions rapides -->
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/" 
              class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Accueil
            </NuxtLink>
            
            <!-- Indicateur de route actuelle -->
            <div class="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <Icon name="heroicons:chevron-right" class="w-4 h-4" />
              <span v-if="$route.path === '/auth?form=login'" class="text-blue-600 font-medium">
                Connexion
              </span>
              <span v-else-if="$route.path === '/auth?form=register'" class="text-purple-600 font-medium">
                Inscription
              </span>
              <span v-else class="text-gray-900 font-medium">
                Authentification
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="relative">
      <slot />
    </main>

    <!-- Footer simple -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div class="flex items-center space-x-6 text-sm text-gray-600">
            <NuxtLink to="/about" class="hover:text-blue-600 transition-colors">
              À propos
            </NuxtLink>
            <NuxtLink to="/support" class="hover:text-blue-600 transition-colors">
              Support
            </NuxtLink>
            <NuxtLink to="/privacy" class="hover:text-blue-600 transition-colors">
              Confidentialité
            </NuxtLink>
            <NuxtLink to="/terms" class="hover:text-blue-600 transition-colors">
              Conditions
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">
              © {{ new Date().getFullYear() }} Form Modulable
            </span>
            
            <!-- Réseaux sociaux -->
            <div class="flex items-center space-x-2">
              <a href="#" class="text-gray-400 hover:text-blue-600 transition-colors">
                <Icon name="heroicons:globe-alt" class="w-4 h-4" />
              </a>
              <a href="#" class="text-gray-400 hover:text-blue-600 transition-colors">
                <Icon name="heroicons:envelope" class="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Toast notifications (optionnel) -->
    <div class="fixed top-4 right-4 z-50">
      <div 
        v-if="showWelcomeMessage" 
        class="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm transform transition-all duration-300"
        :class="showWelcomeMessage ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
      >
        <div class="flex items-start space-x-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:information-circle" class="w-4 h-4 text-blue-600" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">
              Bienvenue sur Form Modulable !
            </p>
            <p class="text-sm text-gray-600 mt-1">
              Créez votre compte pour commencer à utiliser nos outils.
            </p>
          </div>
          <button 
            @click="showWelcomeMessage = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Route actuelle
const route = useRoute()

// Message de bienvenue
const showWelcomeMessage = ref(false)

// Afficher le message de bienvenue uniquement sur la page d'inscription
onMounted(() => {
  if (route.path === '/auth?form=register') {
    setTimeout(() => {
      showWelcomeMessage.value = true
    }, 1000)
    
    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
      showWelcomeMessage.value = false
    }, 6000)
  }
})

// Meta données pour le SEO
useHead({
  bodyAttrs: {
    class: 'bg-gray-50'
  },
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    }
  ]
})
</script>

<style scoped>
/* Animations personnalisées */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Améliorer les transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Hover effects pour les liens */
nav a:hover {
  transform: translateY(-1px);
}

/* Focus states pour l'accessibilité */
nav a:focus,
footer a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>