<template>
  <div>
    <!-- Section Hero avec Carousel -->
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div class="absolute inset-0 bg-black opacity-10"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
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

    <!-- Carousel des opérations -->
    <section id="operations" class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos services disponibles
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez toutes les démarches que vous pouvez effectuer en ligne sur notre plateforme
          </p>
        </div>

        <!-- Carousel -->
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

          <!-- Contrôles du carousel -->
          <div class="flex justify-center mt-8 space-x-2">
            <button 
              v-for="(slide, index) in carouselSlides" 
              :key="index"
              @click="currentSlide = index"
              class="w-3 h-3 rounded-full transition-colors"
              :class="currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'"
            ></button>
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
// Meta données
useHead({
  title: 'Form Modulable - Simplifiez vos démarches administratives',
  meta: [
    { name: 'description', content: 'Plateforme moderne pour effectuer toutes vos démarches administratives en ligne. Fini les files d\'attente !' }
  ]
})

// État du carousel
const currentSlide = ref(0)

// Données du carousel
const operations = [
  {
    id: 1,
    title: 'Carte d\'identité',
    description: 'Renouvellement et première demande de carte d\'identité',
    icon: 'heroicons:identification',
    duration: '5 min'
  },
  {
    id: 2,
    title: 'Passeport',
    description: 'Demande de passeport biométrique en ligne',
    icon: 'heroicons:document-text',
    duration: '8 min'
  },
  {
    id: 3,
    title: 'Permis de conduire',
    description: 'Renouvellement et duplicata de permis',
    icon: 'heroicons:truck',
    duration: '3 min'
  },
  {
    id: 4,
    title: 'Certificat de naissance',
    description: 'Demande d\'acte de naissance en ligne',
    icon: 'heroicons:user-plus',
    duration: '2 min'
  },
  {
    id: 5,
    title: 'Certificat de mariage',
    description: 'Acte de mariage et livret de famille',
    icon: 'heroicons:heart',
    duration: '2 min'
  },
  {
    id: 6,
    title: 'Aide au logement',
    description: 'Demande d\'APL et autres aides',
    icon: 'heroicons:home',
    duration: '10 min'
  },
  {
    id: 7,
    title: 'Déclaration d\'impôts',
    description: 'Déclaration de revenus simplifiée',
    icon: 'heroicons:calculator',
    duration: '15 min'
  },
  {
    id: 8,
    title: 'Inscription Pôle Emploi',
    description: 'Inscription et actualisation mensuelle',
    icon: 'heroicons:briefcase',
    duration: '7 min'
  },
  {
    id: 9,
    title: 'Changement d\'adresse',
    description: 'Notification de changement d\'adresse',
    icon: 'heroicons:map-pin',
    duration: '3 min'
  }
]

// Grouper les opérations par 3 pour le carousel
const carouselSlides = computed(() => {
  const slides = []
  for (let i = 0; i < operations.length; i += 3) {
    slides.push(operations.slice(i, i + 3))
  }
  return slides
})

// Avantages
const advantages = [
  {
    id: 1,
    title: 'Gain de temps',
    description: 'Évitez les files d\'attente et les déplacements inutiles. Effectuez vos démarches en quelques clics.',
    icon: 'heroicons:clock'
  },
  {
    id: 2,
    title: 'Disponible 24h/24',
    description: 'Accédez à nos services à tout moment, depuis chez vous ou votre bureau.',
    icon: 'heroicons:globe-alt'
  },
  {
    id: 3,
    title: 'Sécurisé',
    description: 'Vos données sont protégées par les dernières technologies de sécurité.',
    icon: 'heroicons:shield-check'
  },
  {
    id: 4,
    title: 'Suivi en temps réel',
    description: 'Suivez l\'avancement de vos démarches en temps réel avec des notifications.',
    icon: 'heroicons:eye'
  },
  {
    id: 5,
    title: 'Support dédié',
    description: 'Notre équipe est disponible pour vous accompagner à chaque étape.',
    icon: 'heroicons:chat-bubble-left-right'
  },
  {
    id: 6,
    title: 'Économique',
    description: 'Réduisez vos coûts de transport et optimisez votre temps précieux.',
    icon: 'heroicons:banknotes'
  }
]

// Témoignages
const testimonials = [
  {
    id: 1,
    name: 'Marie Dubois',
    role: 'Enseignante',
    content: 'J\'ai pu renouveler ma carte d\'identité en 5 minutes depuis mon domicile. C\'est révolutionnaire !'
  },
  {
    id: 2,
    name: 'Pierre Martin',
    role: 'Entrepreneur',
    content: 'Fini les après-midi perdus en mairie ! Cette plateforme m\'a fait gagner un temps précieux.'
  },
  {
    id: 3,
    name: 'Sophie Leroy',
    role: 'Mère de famille',
    content: 'Avec 3 enfants, impossible de faire la queue. Cette solution est parfaite pour moi.'
  }
]

// Auto-avancement du carousel
onMounted(() => {
  setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length
  }, 5000)
})

// Fonction pour scroller vers les opérations
const scrollToOperations = () => {
  document.getElementById('operations').scrollIntoView({ behavior: 'smooth' })
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