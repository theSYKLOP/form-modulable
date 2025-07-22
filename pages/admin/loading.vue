<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <!-- Card de chargement -->
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <!-- Logo -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon name="heroicons:document-text" class="w-8 h-8 text-white" />
          </div>
        </div>

        <!-- État de chargement -->
        <div v-if="isLoading" class="space-y-4">
          <div class="flex justify-center">
            <div class="relative">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
            </div>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">
            Vérification en cours...
          </h2>
          <p class="text-gray-600">
            {{ loadingMessage }}
          </p>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-500"
              :style="{ width: progressWidth + '%' }"
            ></div>
          </div>
        </div>

        <!-- État d'erreur -->
        <div v-else-if="error" class="space-y-4">
          <div class="flex justify-center">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">
            Accès non autorisé
          </h2>
          <p class="text-gray-600">
            {{ errorMessage }}
          </p>
          
          <!-- Bouton de redirection -->
          <div class="mt-6 space-y-3">
            <button
              @click="redirectToLogin"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Se connecter
            </button>
            <button
              @click="goHome"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>

        <!-- État de succès -->
        <div v-else-if="success" class="space-y-4">
          <div class="flex justify-center">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:check" class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">
            Accès autorisé
          </h2>
          <p class="text-gray-600">
            Redirection vers le dashboard...
          </p>
        </div>
      </div>

      <!-- Informations supplémentaires -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          Form Modulable - Administration
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Désactiver le layout par défaut pour cette page
definePageMeta({
  layout: false
})

// Store d'authentification
const authStore = useAuthStore()

// États réactifs
const isLoading = ref(true)
const error = ref(false)
const success = ref(false)
const loadingMessage = ref('Vérification de votre authentification...')
const errorMessage = ref('')
const progressWidth = ref(0)

// Route et router
const route = useRoute()
const router = useRouter()

// Fonction de vérification d'authentification et de rôle
const checkAuthAndRole = async () => {
  try {
    // Étape 1: Initialisation
    progressWidth.value = 20
    loadingMessage.value = 'Initialisation de la vérification...'
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Étape 2: Vérifier si l'utilisateur est connecté
    progressWidth.value = 40
    loadingMessage.value = 'Vérification de votre authentification...'
    
    if (!authStore.isAuthenticated) {
      // Essayer de recharger les données d'auth depuis le token
      await authStore.checkAuthStatus()
    }
    
    // Si toujours pas authentifié
    if (!authStore.isAuthenticated) {
      error.value = true
      errorMessage.value = 'Vous devez être connecté pour accéder à cette page. Veuillez vous connecter pour continuer.'
      return
    }
    
    // Étape 3: Vérifier le rôle
    progressWidth.value = 70
    loadingMessage.value = 'Vérification de vos permissions administrateur...'
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = authStore.user
    if (!user || user.role !== 'ADMIN') {
      error.value = true
      errorMessage.value = 'Accès refusé : Vous n\'avez pas les permissions administrateur nécessaires pour accéder à cette section. Contactez un administrateur si vous pensez qu\'il s\'agit d\'une erreur.'
      return
    }
    
    // Étape 4: Succès
    progressWidth.value = 100
    loadingMessage.value = 'Accès autorisé ! Redirection vers le dashboard...'
    success.value = true
    
    // Redirection après un court délai
    setTimeout(() => {
      const redirectTo = route.query.redirect || '/admin'
      navigateTo(redirectTo, { replace: true })
    }, 1000)
    
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    error.value = true
    errorMessage.value = 'Une erreur technique est survenue lors de la vérification de vos permissions. Veuillez rafraîchir la page ou réessayer plus tard.'
  } finally {
    isLoading.value = false
  }
}

// Fonction de redirection vers login
const redirectToLogin = () => {
  const redirectParam = route.query.redirect || '/admin'
  navigateTo(`/auth?form=login&redirect=${encodeURIComponent(redirectParam)}`)
}

// Fonction pour retourner à l'accueil
const goHome = () => {
  navigateTo('/')
}

// Démarrer la vérification au montage
onMounted(() => {
  checkAuthAndRole()
})

// SEO
useHead({
  title: 'Vérification d\'accès - Form Modulable',
  meta: [
    { name: 'description', content: 'Vérification des permissions d\'accès' },
    { name: 'robots', content: 'noindex' }
  ]
})
</script>
