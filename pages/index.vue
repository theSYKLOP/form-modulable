<template>
  <div>
    <!-- Section Hero avec Carousel optimisé -->
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <!-- Utilisation de l'intersection observer pour le lazy loading -->
      <div ref="heroSection" class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
            <template v-if="!isAuthenticated || isAdmin">
              Simplifiez vos
              <span class="block text-blue-200">démarches administratives</span>
            </template>
            <template v-else>
              Bienvenue {{ userDisplayName }}
              <span class="block text-blue-200">Accédez à nos services</span>
            </template>
          </h1>
          <p class="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            <template v-if="!isAuthenticated || isAdmin">
              Fini les files d'attente et les déplacements ! Effectuez toutes vos démarches en ligne, 
              rapidement et en toute sécurité.
            </template>
            <template v-else>
              Découvrez tous nos formulaires disponibles et effectuez vos démarches en ligne
              rapidement et en toute sécurité.
            </template>
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <template v-if="!isAuthenticated">
              <NuxtLink 
                to="/auth" 
                class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Commencer maintenant
              </NuxtLink>
              <button 
                @click="scrollToOperations"
                class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Découvrir les services
              </button>
            </template>
            <template v-else-if="isAdmin">
              <!-- Boutons pour les administrateurs -->
              <NuxtLink 
                to="/admin/formulaires" 
                class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Mes formulaires
              </NuxtLink>
              <NuxtLink 
                to="/form" 
                class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Créer un formulaire
              </NuxtLink>
            </template>
            <template v-else>
              <!-- Boutons pour les utilisateurs normaux -->
              <button 
                @click="scrollToOperations"
                class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Nos services
              </button>
              <NuxtLink 
                to="/auth/logout" 
                class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Se déconnecter
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Carousel optimisé avec lazy loading -->
    <section id="operations" ref="operationsSection" class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <template v-if="!isAuthenticated || isAdmin">
              Nos formulaires disponibles
            </template>
            <template v-else>
              Formulaires à votre disposition
            </template>
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            <template v-if="!isAuthenticated || isAdmin">
              Découvrez tous les formulaires que vous pouvez remplir en ligne
            </template>
            <template v-else>
              Remplissez facilement vos formulaires en ligne en quelques clics
            </template>
          </p>
        </div>

        <!-- État de chargement -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-600">Chargement des formulaires...</span>
        </div>

        <!-- État d'erreur -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-600 mb-4">{{ error }}</div>
          <button 
            @click="loadForms" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>

        <!-- État vide -->
        <div v-else-if="forms.length === 0" class="text-center py-12">
          <Icon name="heroicons:document-text" class="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun formulaire disponible</h3>
          <p class="text-gray-600">Les formulaires seront bientôt disponibles.</p>
        </div>

        <!-- Carousel des formulaires -->
        <div v-else class="relative">
          <div class="overflow-hidden">
            <div 
              class="flex transition-transform duration-500 ease-in-out"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <div 
                v-for="(slide, index) in carouselSlides" 
                :key="index"
                class="w-full flex-shrink-0"
              >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div 
                    v-for="form in slide" 
                    :key="form.id"
                    class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer group"
                    @mouseenter="preloadOperationRoute(form)"
                    @click="goToForm(form)"
                  >
                    <div class="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <Icon :name="form.icon" class="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2 text-center group-hover:text-blue-600 transition-colors">
                      {{ form.title }}
                    </h3>
                    <p class="text-gray-600 text-center mb-4 line-clamp-2">
                      {{ form.description }}
                    </p>
                    <div class="flex justify-center items-center gap-4 text-sm text-gray-500 mb-4">
                      <span class="flex items-center gap-1">
                        <Icon name="heroicons:queue-list" class="w-4 h-4" />
                        {{ form.stepsCount }} étapes
                      </span>
                      <span class="flex items-center gap-1">
                        <Icon name="heroicons:document" class="w-4 h-4" />
                        {{ form.fieldsCount }} champs
                      </span>
                    </div>
                    <div class="text-center">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Icon name="heroicons:clock" class="w-4 h-4 mr-1" />
                        {{ form.duration }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Indicateurs de navigation du carousel -->
          <div v-if="carouselSlides.length > 1" class="flex justify-center mt-8 gap-2">
            <button 
              v-for="(slide, index) in carouselSlides" 
              :key="index"
              @click="debouncedSlideChange(index)"
              class="w-3 h-3 rounded-full transition-colors"
              :class="currentSlide === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Avantages -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir Form Modulable ?
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Une solution moderne qui révolutionne vos démarches administratives
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="advantage in advantages" 
            :key="advantage.id"
            class="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <Icon :name="advantage.icon" class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">
              {{ advantage.title }}
            </h3>
            <p class="text-gray-600">
              {{ advantage.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Témoignages -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p class="text-lg text-gray-600">
            Découvrez les témoignages de ceux qui ont simplifié leurs démarches
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="testimonial in testimonials" 
            :key="testimonial.id"
            class="bg-white rounded-lg shadow-lg p-6"
          >
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ testimonial.name.charAt(0) }}
              </div>
              <div class="ml-4">
                <h4 class="font-semibold text-gray-900">{{ testimonial.name }}</h4>
                <p class="text-sm text-gray-600">{{ testimonial.role }}</p>
              </div>
            </div>
            <div class="flex mb-4">
              <Icon 
                v-for="n in 5" 
                :key="n"
                name="heroicons:star-solid" 
                class="w-5 h-5 text-yellow-400" 
              />
            </div>
            <p class="text-gray-600">
              "{{ testimonial.content }}"
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="py-16 bg-blue-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          <template v-if="!isAuthenticated">
            Prêt à simplifier vos démarches ?
          </template>
          <template v-else-if="isAdmin">
            Continuez à gérer vos formulaires
          </template>
          <template v-else>
            Explorez nos services disponibles
          </template>
        </h2>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          <template v-if="!isAuthenticated">
            Rejoignez des milliers d'utilisateurs qui ont déjà adopté la solution numérique
          </template>
          <template v-else-if="isAdmin">
            Créez, gérez et publiez vos formulaires pour offrir la meilleure expérience à vos utilisateurs
          </template>
          <template v-else>
            Accédez à tous nos formulaires pour effectuer vos démarches en toute simplicité
          </template>
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <template v-if="!isAuthenticated">
            <NuxtLink 
              to="/auth" 
              class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Créer mon compte
            </NuxtLink>
            <NuxtLink 
              to="/form" 
              class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Voir tous les services
            </NuxtLink>
          </template>
          <template v-else-if="isAdmin">
            <!-- Boutons pour les administrateurs -->
            <NuxtLink 
              to="/admin/formulaires" 
              class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Gérer mes formulaires
            </NuxtLink>
            <NuxtLink 
              to="/form" 
              class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Créer un nouveau formulaire
            </NuxtLink>
          </template>
          <template v-else>
            <!-- Boutons pour les utilisateurs normaux -->
            <button 
              @click="scrollToOperations"
              class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Explorer nos services
            </button>
            <NuxtLink 
              to="/auth/profile" 
              class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Mon profil
            </NuxtLink>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePerformance } from '~/composables/core/usePerformance'
import { useAuth } from '~/composables/useAuth'

// ✅ Configuration SEO de la page
useHead({
  title: 'Form Modulable - Simplifiez vos démarches administratives',
  meta: [
    { name: 'description', content: 'Effectuez toutes vos démarches administratives en ligne, rapidement et en toute sécurité. Passeport, carte d\'identité, permis de conduire et plus encore.' },
    { name: 'keywords', content: 'démarches administratives, en ligne, passeport, carte identité, permis conduire' },
    { property: 'og:title', content: 'Form Modulable - Démarches administratives simplifiées' },
    { property: 'og:description', content: 'Fini les files d\'attente ! Effectuez vos démarches administratives en ligne.' },
    { property: 'og:type', content: 'website' }
  ]
})

// ✅ Composables
const { isAuthenticated, isAdmin, user, userDisplayName } = useAuth()

// ✅ Intégration des optimisations de performance
const { 
  useOptimizedDebounce, 
  useIntersectionObserver, 
  preloadRoute,
  measurePerformance 
} = usePerformance()

// État du carousel avec performance monitoring
const currentSlide = ref(0)
const showTestimonials = ref(false)
const heroSection = ref(null)
const operationsSection = ref(null)

// États pour les formulaires réels
const forms = ref([])
const loading = ref(false)
const error = ref(null)

// ✅ Computed pour organiser les formulaires en slides de 3
const carouselSlides = computed(() => {
  if (!forms.value || forms.value.length === 0) {
    return []
  }
  
  const slides = []
  for (let i = 0; i < forms.value.length; i += 3) {
    slides.push(forms.value.slice(i, i + 3))
  }
  return slides
})

// ✅ Données des avantages
const advantages = ref([
  {
    id: 1,
    title: "Rapide et efficace",
    description: "Effectuez vos démarches en quelques minutes seulement",
    icon: "heroicons:lightning-bolt"
  },
  {
    id: 2,
    title: "Disponible 24h/24",
    description: "Accédez à nos services à tout moment, même le weekend",
    icon: "heroicons:clock"
  },
  {
    id: 3,
    title: "Sécurisé",
    description: "Vos données sont protégées par un chiffrement de niveau bancaire",
    icon: "heroicons:shield-check"
  },
  {
    id: 4,
    title: "Suivi en temps réel",
    description: "Suivez l'avancement de vos dossiers à tout moment",
    icon: "heroicons:eye"
  },
  {
    id: 5,
    title: "Support dédié",
    description: "Une équipe disponible pour vous accompagner",
    icon: "heroicons:chat-bubble-bottom-center"
  },
  {
    id: 6,
    title: "Économique",
    description: "Réduisez vos frais de déplacement et gagnez du temps",
    icon: "heroicons:currency-euro"
  }
])

// ✅ Données des témoignages
const testimonials = ref([
  {
    id: 1,
    name: "Marie Dubois",
    role: "Particulière",
    content: "J'ai pu renouveler mon passeport en 5 minutes depuis chez moi. C'est révolutionnaire !"
  },
  {
    id: 2,
    name: "Pierre Martin",
    role: "Chef d'entreprise",
    content: "Fini les files d'attente ! Je gère toutes mes démarches administratives en ligne."
  },
  {
    id: 3,
    name: "Sophie Leroy",
    role: "Étudiante",
    content: "Interface intuitive et processus ultra-rapide. Je recommande vivement !"
  }
])

// ✅ Fonction pour charger les formulaires depuis l'API
const loadForms = async (forceRefresh = false) => {
  try {
    loading.value = true
    error.value = null
    
    const response = await $fetch('/api/form', {
      query: {
        limit: 9, // Limiter à 9 formulaires (3 slides de 3)
        sortBy: 'createdAt',
        sortOrder: 'desc',
        isPublished: true, // Seulement les formulaires publiés
        // ✅ Ajouter timestamp pour éviter le cache si force refresh
        ...(forceRefresh && { _t: Date.now() })
      },
      // ✅ Désactiver le cache pour s'assurer d'avoir les données les plus récentes
      server: false,
      lazy: false,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    if (response.success && response.data?.forms) {
      // Transformer les données pour les adapter au format du carousel
      forms.value = response.data.forms.map(form => ({
        id: form.id,
        title: form.title || 'Formulaire sans titre',
        description: form.description || 'Aucune description disponible',
        icon: form.icon || 'heroicons:document-text',
        duration: calculateEstimatedDuration(form.stepsCount, form.fieldsCount),
        type: 'form',
        stepsCount: form.stepsCount || 0,
        fieldsCount: form.fieldsCount || 0
      }))
      
      console.log('✅ Formulaires chargés pour le carousel:', forms.value.length)
    }
  } catch (err) {
    console.error('❌ Erreur lors du chargement des formulaires:', err)
    error.value = 'Erreur lors du chargement des formulaires'
  } finally {
    loading.value = false
  }
}

// ✅ Fonction pour calculer la durée estimée
const calculateEstimatedDuration = (stepsCount = 0, fieldsCount = 0) => {
  // Estimation basée sur le nombre d'étapes et de champs
  const baseTime = 2 // 2 minutes de base
  const timePerStep = 1 // 1 minute par étape
  const timePerField = 0.5 // 30 secondes par champ
  
  const totalMinutes = Math.max(
    baseTime + (stepsCount * timePerStep) + (fieldsCount * timePerField),
    2 // Minimum 2 minutes
  )
  
  return `${Math.round(totalMinutes)} min`
}

// ✅ Débounced navigation du carousel
const debouncedSlideChange = useOptimizedDebounce((index) => {
  measurePerformance('Carousel Slide Change', () => {
    currentSlide.value = index
  })
}, 100)

// ✅ Observer pour charger les témoignages seulement quand visibles
useIntersectionObserver(
  operationsSection,
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !showTestimonials.value) {
        showTestimonials.value = true
        // Précharger la route about une fois les témoignages visibles
        preloadRoute('/about')
      }
    })
  },
  { rootMargin: '100px' }
)

// ✅ Préchargement optimisé des routes d'opérations
const preloadOperationRoute = useOptimizedDebounce((operation) => {
  if (operation.type === 'form') {
    preloadRoute('/form')
  }
}, 200)

// ✅ Fonction pour naviguer vers un formulaire
const goToForm = (form) => {
  if (form.id) {
    navigateTo(`/form?id=${form.id}`)
  }
}

// ✅ Fonction pour scroller vers les opérations avec smooth behavior
const scrollToOperations = () => {
  const element = document.getElementById('operations')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Auto-avancement optimisé du carousel
onMounted(async () => {
  // ✅ Charger les formulaires au montage
  await loadForms()
  
  // ✅ Vérifier que carouselSlides existe avant de démarrer le carousel
  if (carouselSlides.value && carouselSlides.value.length > 0) {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide.value + 1) % carouselSlides.value.length
      debouncedSlideChange(nextSlide)
    }, 5000)
    
    onBeforeUnmount(() => {
      clearInterval(interval)
    })
  }
  
  // ✅ Recharger les formulaires quand la page redevient visible
  if (process.client) {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page redevenue visible - rechargement des formulaires publiés')
        loadForms(true) // Force refresh
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    onBeforeUnmount(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
  }
})
</script>

<style scoped>
/* Animations personnalisées */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
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

/* Animation spin pour le loading */
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
