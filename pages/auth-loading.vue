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
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-200"></div>
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent absolute inset-0"></div>
            </div>
          </div>
          <h2 class="text-lg font-semibold text-gray-900">
            Vérification...
          </h2>
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
            Redirection...
          </p>
        </div>
      </div>

      <!-- Informations supplémentaires -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          Form Modulable - Vérification d'accès
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
const errorMessage = ref('')

// Route et router
const route = useRoute()
const router = useRouter()

// ✅ Fonction optimisée de vérification INSTANTANÉE
const checkAuthAndRole = async () => {
  try {
    // ✅ Initialisation rapide depuis localStorage
    authStore.initializeAuth()
    
    // ✅ Vérification instantanée de l'état
    if (!authStore.isAuthenticated) {
      throw new Error('NOT_AUTHENTICATED')
    }
    
    // ✅ Vérifier le rôle admin (instantané)
    if (!authStore.user || authStore.user.role !== 'ADMIN') {
      throw new Error('INSUFFICIENT_PERMISSIONS')
    }
    
    // ✅ Succès - redirection immédiate
    success.value = true
    isLoading.value = false
    
    // ✅ Redirection rapide (100ms pour voir l'animation de succès)
    setTimeout(() => {
      const redirectTo = route.query.redirect?.toString() || '/admin'
      navigateTo(redirectTo, { replace: true })
    }, 100)
    
  } catch (authError) {
    isLoading.value = false
    error.value = true
    
    // ✅ Messages d'erreur spécifiques selon la destination
    if (authError.message === 'NOT_AUTHENTICATED') {
      const destination = route.query.redirect?.toString() || ''
      if (destination.startsWith('/admin')) {
        errorMessage.value = 'Vous devez être connecté pour accéder au panneau d\'administration.'
      } else if (destination.startsWith('/form')) {
        errorMessage.value = 'Vous devez être connecté pour accéder à la gestion des formulaires.'
      } else {
        errorMessage.value = 'Vous devez être connecté pour accéder à cette page.'
      }
    } else if (authError.message === 'INSUFFICIENT_PERMISSIONS') {
      const destination = route.query.redirect?.toString() || ''
      if (destination.startsWith('/admin')) {
        errorMessage.value = 'Accès refusé : Seuls les administrateurs peuvent accéder au panneau d\'administration.'
      } else if (destination.startsWith('/form')) {
        errorMessage.value = 'Accès refusé : Seuls les administrateurs peuvent gérer les formulaires.'
      } else {
        errorMessage.value = 'Accès refusé : Permissions administrateur requises.'
      }
    } else {
      errorMessage.value = 'Erreur de vérification des permissions.'
    }
    
    console.error('Erreur auth:', authError)
  }
}

// ✅ Fonction de redirection vers login (instantané)
const redirectToLogin = () => {
  const redirectParam = route.query.redirect?.toString() || '/admin'
  navigateTo(`/auth?form=login&redirect=${encodeURIComponent(redirectParam)}`, { replace: true })
}

// ✅ Fonction pour retourner à l'accueil (instantané)
const goHome = () => {
  navigateTo('/', { replace: true })
}

// ✅ Démarrer la vérification immédiatement (pas d'attente onMounted)
checkAuthAndRole()

// ✅ SEO dynamique selon la destination
const destination = route.query.redirect?.toString() || ''
let pageTitle = 'Vérification d\'accès'
if (destination.startsWith('/admin')) {
  pageTitle = 'Accès Administration'
} else if (destination.startsWith('/form')) {
  pageTitle = 'Accès Gestion Formulaires'
}

useHead({
  title: `${pageTitle} - Form Modulable`,
  meta: [
    { name: 'description', content: 'Vérification des permissions d\'accès' },
    { name: 'robots', content: 'noindex' }
  ]
})
</script>
