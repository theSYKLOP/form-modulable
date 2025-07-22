<template>
  <div>
    <!-- Section Hero avec Carousel optimisé -->
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <!-- Utilisation de l'intersection observer pour le lazy loading -->
      <div ref="heroSection" class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
            Simplifiez vos
            <span class="block text-blue-200">démarches administratives</span>
          </h1>
          <p class="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Fini les files d'attente et les déplacements ! Effectuez toutes vos démarches en ligne, 
            rapidement et en toute sécurité.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/auth/register" 
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
          </div>
        </div>
      </div>
    </section>

    <!-- Carousel optimisé avec lazy loading -->
    <section id="operations" ref="operationsSection" class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Préchargement des images du carousel -->
        <div class="relative">
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
                    v-for="operation in slide" 
                    :key="operation.id"
                    class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                    @mouseenter="preloadOperationRoute(operation)"
                  >
                    <div class="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4">
                      <Icon :name="operation.icon" class="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2 text-center">
                      {{ operation.title }}
                    </h3>
                    <p class="text-gray-600 text-center mb-4">
                      {{ operation.description }}
                    </p>
                    <div class="text-center">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {{ operation.duration }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          Prêt à simplifier vos démarches ?
        </h2>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers d'utilisateurs qui ont déjà adopté la solution numérique
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/auth/register" 
            class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Créer mon compte
          </NuxtLink>
          <NuxtLink 
            to="/operations" 
            class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Voir tous les services
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { usePerformance } from '~/composables/core/usePerformance'

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

// ✅ Données des slides du carousel
const carouselSlides = ref([
  [
    {
      id: 1,
      title: "Demande de passeport",
      description: "Renouvelez ou demandez votre passeport en quelques clics",
      icon: "heroicons:identification",
      duration: "5 min",
      type: "form"
    },
    {
      id: 2,
      title: "Carte d'identité",
      description: "Demande de carte nationale d'identité simplifiée",
      icon: "heroicons:credit-card",
      duration: "3 min",
      type: "form"
    },
    {
      id: 3,
      title: "Permis de conduire",
      description: "Toutes vos démarches liées au permis de conduire",
      icon: "heroicons:truck",
      duration: "7 min",
      type: "form"
    }
  ],
  [
    {
      id: 4,
      title: "Acte de naissance",
      description: "Demande d'extrait d'acte de naissance",
      icon: "heroicons:document-text",
      duration: "2 min",
      type: "form"
    },
    {
      id: 5,
      title: "Certificat de vie",
      description: "Obtention de certificat de vie en ligne",
      icon: "heroicons:check-badge",
      duration: "4 min",
      type: "form"
    },
    {
      id: 6,
      title: "Changement d'adresse",
      description: "Signalement de changement d'adresse",
      icon: "heroicons:home",
      duration: "6 min",
      type: "form"
    }
  ]
])

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

// ✅ Debounced navigation du carousel
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

// Auto-avancement optimisé du carousel
onMounted(() => {
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
})

// ✅ Fonction pour scroller vers les opérations avec smooth behavior
const scrollToOperations = () => {
  const element = document.getElementById('operations')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
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
</style>