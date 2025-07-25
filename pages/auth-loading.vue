<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Card de chargement améliorée -->
      <div class="loading-card bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center transform transition-all duration-300 slide-up-animation">
        <!-- Logo avec animation -->
        <!-- <div class="flex justify-center mb-8">
          <div class="relative breathe-animation">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform duration-300 hover:scale-105 pulse-glow">
             
              <Icon 
                name="heroicons:document-text-20-solid" 
                class="w-10 h-10 text-white"
              />
            </div>
            
            <div class="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl shimmer-effect"></div>
          </div>
        </div> -->

        <!-- État de chargement avec animation améliorée -->
        <div v-if="isLoading" class="space-y-6">
          <div class="flex justify-center">
            <div class="relative">
              <!-- Spinner principal -->
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-100"></div>
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
              <!-- Points de chargement -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
            <h2 class="text-xl font-bold text-gray-900 tracking-tight">
              Vérification en cours
            </h2>
            <p class="text-gray-600 text-sm leading-relaxed">
              Analyse de vos permissions d'accès...
            </p>
            
            <!-- Barre de progression simulée -->
            <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full animate-pulse" style="width: 75%"></div>
            </div>
          </div>
        </div>

        <!-- État d'erreur avec design amélioré -->
        <div v-else-if="error" class="space-y-6">
          <div class="flex justify-center">
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
                <!-- Icône d'erreur avec fallback -->
                <Icon 
                  name="heroicons:exclamation-triangle-20-solid" 
                  class="w-8 h-8 text-red-600"
                />
              </div>
              <!-- Effet d'ondulation pour attirer l'attention -->
              <div class="absolute inset-0 bg-red-200 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          
          <div class="space-y-4">
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
              Accès non autorisé
            </h2>
            <div class="bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="text-red-800 text-sm font-medium leading-relaxed">
                {{ errorMessage }}
              </p>
            </div>
          </div>
          
          <!-- Boutons d'action améliorés -->
          <div class="space-y-3 pt-2">
            <button
              @click="redirectToLogin"
              class="button-enhanced group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Icon 
                name="heroicons:arrow-right-on-rectangle-20-solid" 
                class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
              />
              <span>Se connecter</span>
            </button>
            
            <button
              @click="goHome"
              class="button-enhanced group w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Icon 
                name="heroicons:home-20-solid" 
                class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
              />
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </div>

        <!-- État de succès avec animation -->
        <div v-else-if="success" class="space-y-6">
          <div class="flex justify-center">
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <!-- Icône de succès avec fallback -->
                <Icon 
                  name="heroicons:check-circle-20-solid" 
                  class="w-8 h-8 text-green-600"
                />
              </div>
              <!-- Effet de célébration -->
              <div class="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
          
          <div class="space-y-3">
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
              Accès autorisé !
            </h2>
            <div class="bg-green-50 border border-green-200 rounded-xl p-4">
              <p class="text-green-800 text-sm font-medium leading-relaxed flex items-center justify-center space-x-2">
                <Icon 
                  name="heroicons:arrow-path-20-solid" 
                  class="w-4 h-4 animate-spin"
                />
                <span>Redirection en cours...</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations supplémentaires avec design cohérent -->
      <div class="mt-8 text-center space-y-2">
        <p class="text-sm font-medium text-gray-600">
          Form Modulable
        </p>
        <p class="text-xs text-gray-500 flex items-center justify-center space-x-1">
          <Icon 
            name="heroicons:shield-check-20-solid" 
            class="w-3 h-3"
          />
          <span>Vérification d'accès sécurisée</span>
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

// États réactifs avec meilleure gestion
const isLoading = ref(true)
const error = ref(false)
const success = ref(false)
const errorMessage = ref('')
const loadingProgress = ref(0)

// Route et router
const route = useRoute()
const router = useRouter()

// ✅ Animation de progression pour une meilleure UX
const animateProgress = () => {
  const progressInterval = setInterval(() => {
    if (loadingProgress.value < 90) {
      loadingProgress.value += Math.random() * 15
    } else {
      clearInterval(progressInterval)
    }
  }, 100)
  
  return progressInterval
}

// ✅ Fonction d'animation d'entrée avec stagger
const animateCardEntry = () => {
  const card = document.querySelector('.loading-card')
  if (card) {
    card.style.opacity = '0'
    card.style.transform = 'translateY(50px) scale(0.9)'
    
    setTimeout(() => {
      card.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
      card.style.opacity = '1'
      card.style.transform = 'translateY(0) scale(1)'
    }, 100)
  }
}

// ✅ Fonction optimisée de vérification avec feedback utilisateur
const checkAuthAndRole = async () => {
  let progressInterval
  
  try {
    // ✅ Démarrer l'animation de progression
    progressInterval = animateProgress()
    
    // ✅ Simulation d'un délai minimum pour la fluidité UX (500ms)
    const minDelay = new Promise(resolve => setTimeout(resolve, 500))
    
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
    
    // ✅ Attendre le délai minimum pour une UX fluide
    await minDelay
    
    // ✅ Finaliser la progression
    clearInterval(progressInterval)
    loadingProgress.value = 100
    
    // ✅ Succès - transition fluide
    success.value = true
    isLoading.value = false
    
    // ✅ Redirection avec délai pour voir l'animation de succès
    setTimeout(() => {
      const redirectTo = route.query.redirect?.toString() || '/admin'
      navigateTo(redirectTo, { replace: true })
    }, 1200) // Délai augmenté pour une meilleure UX
    
  } catch (authError) {
    // ✅ Nettoyer les intervalles
    if (progressInterval) clearInterval(progressInterval)
    
    // ✅ Transition fluide vers l'erreur
    setTimeout(() => {
      isLoading.value = false
      error.value = true
    }, 300) // Petit délai pour éviter le changement brusque
    
    // ✅ Messages d'erreur spécifiques et informatifs selon la destination
    if (authError.message === 'NOT_AUTHENTICATED') {
      const destination = route.query.redirect?.toString() || ''
      if (destination.startsWith('/admin')) {
        errorMessage.value = 'Une authentification est requise pour accéder au panneau d\'administration. Veuillez vous connecter avec vos identifiants administrateur.'
      } else if (destination.startsWith('/form')) {
        errorMessage.value = 'Une authentification est requise pour accéder à la gestion des formulaires. Connectez-vous pour continuer.'
      } else {
        errorMessage.value = 'Une authentification est requise pour accéder à cette page protégée.'
      }
    } else if (authError.message === 'INSUFFICIENT_PERMISSIONS') {
      const destination = route.query.redirect?.toString() || ''
      if (destination.startsWith('/admin')) {
        errorMessage.value = 'Accès refusé : Cette section est réservée aux administrateurs. Contactez votre administrateur système si vous pensez qu\'il s\'agit d\'une erreur.'
      } else if (destination.startsWith('/form')) {
        errorMessage.value = 'Accès refusé : La gestion des formulaires nécessite des privilèges administrateur.'
      } else {
        errorMessage.value = 'Accès refusé : Vos permissions actuelles ne permettent pas d\'accéder à cette ressource.'
      }
    } else {
      errorMessage.value = 'Une erreur inattendue s\'est produite lors de la vérification des permissions. Veuillez réessayer.'
    }
    
    console.error('Erreur auth:', authError)
  }
}

// ✅ Fonction de redirection vers login avec amélioration UX
const redirectToLogin = () => {
  // ✅ Animation de sortie fluide
  const card = document.querySelector('.loading-card')
  if (card) {
    card.style.transform = 'scale(0.95) translateY(-10px)'
    card.style.opacity = '0.8'
    card.style.filter = 'blur(2px)'
  }
  
  setTimeout(() => {
    const redirectParam = route.query.redirect?.toString() || '/admin'
    navigateTo(`/auth?form=login&redirect=${encodeURIComponent(redirectParam)}`, { replace: true })
  }, 300)
}

// ✅ Fonction pour retourner à l'accueil avec animation
const goHome = () => {
  // ✅ Animation de sortie fluide
  const card = document.querySelector('.loading-card')
  if (card) {
    card.style.transform = 'scale(0.95) translateY(10px)'
    card.style.opacity = '0.8'
    card.style.filter = 'blur(2px)'
  }
  
  setTimeout(() => {
    navigateTo('/', { replace: true })
  }, 300)
}

// ✅ Gestion des raccourcis clavier pour une meilleure accessibilité
const handleKeyPress = (event) => {
  if (error.value) {
    if (event.key === 'Enter' || event.key === ' ') {
      redirectToLogin()
    } else if (event.key === 'Escape') {
      goHome()
    }
  }
}

// ✅ Ajouter les événements clavier
onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
})

// ✅ Démarrer la vérification immédiatement
onMounted(() => {
  // Animation d'entrée fluide
  animateCardEntry()
  // Démarrer la vérification après un court délai pour l'animation
  setTimeout(() => {
    checkAuthAndRole()
  }, 200)
})

// ✅ SEO dynamique et informatif selon la destination
const destination = route.query.redirect?.toString() || ''
let pageTitle = 'Vérification d\'accès'
let pageDescription = 'Vérification des permissions d\'accès'

if (destination.startsWith('/admin')) {
  pageTitle = 'Accès Administration'
  pageDescription = 'Vérification des permissions administrateur'
} else if (destination.startsWith('/form')) {
  pageTitle = 'Accès Gestion Formulaires'
  pageDescription = 'Vérification des permissions de gestion des formulaires'
}

// ✅ Configuration SEO optimisée
useHead({
  title: `${pageTitle} - Form Modulable`,
  meta: [
    { name: 'description', content: pageDescription },
    { name: 'robots', content: 'noindex, nofollow' },
    { property: 'og:title', content: `${pageTitle} - Form Modulable` },
    { property: 'og:description', content: pageDescription },
    { property: 'og:type', content: 'website' }
  ]
})
</script>

<style scoped>
/* ✨ Animations personnalisées pour une UX premium */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
}

@keyframes slide-up {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Classes d'animation */
.float-animation {
  animation: float 3s ease-in-out infinite;
}

.shimmer-effect {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.slide-up-animation {
  animation: slide-up 0.6s ease-out;
}

.breathe-animation {
  animation: breathe 4s ease-in-out infinite;
}

/* Améliorations des transitions */
.loading-card {
  backdrop-filter: blur(20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Spinner avancé */
.advanced-spinner {
  background: conic-gradient(transparent, transparent, transparent, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* États visuels pour les boutons */
.button-enhanced {
  position: relative;
  overflow: hidden;
}

.button-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.button-enhanced:hover::before {
  left: 100%;
}

/* Animation d'apparition progressive */
.fade-in-up {
  animation: slide-up 0.6s ease-out forwards;
}

.fade-in-up:nth-child(2) { animation-delay: 0.1s; }
.fade-in-up:nth-child(3) { animation-delay: 0.2s; }
.fade-in-up:nth-child(4) { animation-delay: 0.3s; }
</style>
