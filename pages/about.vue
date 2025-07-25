<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section améliorée -->
    <div class="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-8 mx-auto shadow-2xl">
            <Icon name="heroicons:document-text-20-solid" class="w-10 h-10 text-white" />
          </div>
          <h1 class="text-5xl font-bold text-white mb-6 tracking-tight">
            À propos de
            <span class="bg-gradient-to-r from-blue-200 to-blue-100 bg-clip-text text-transparent">
              Form Modulable
            </span>
          </h1>
          <p class="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Notre mission est de simplifier vos démarches administratives grâce à une plateforme moderne, intuitive et sécurisée
          </p>
        </div>
      </div>
      
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <!-- Section Vision et Innovation -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        <div class="space-y-8">
          <div class="space-y-4">
            <div class="inline-flex items-center space-x-2 text-blue-600 font-semibold text-sm uppercase tracking-wide">
              <Icon name="heroicons:eye-20-solid" class="w-4 h-4" />
              <span>Notre Vision</span>
            </div>
            <h2 class="text-4xl font-bold text-gray-900 leading-tight">
              Révolutionner les démarches administratives
            </h2>
          </div>
          <div class="space-y-6 text-gray-600 leading-relaxed">
            <p class="text-lg">
              Nous croyons que les démarches administratives ne devraient pas être un obstacle dans votre vie quotidienne. 
              C'est pourquoi nous avons créé Form Modulable, une plateforme qui centralise toutes vos démarches en un seul endroit.
            </p>
            <p>
              Grâce à notre technologie avancée et notre interface intuitive, vous pouvez désormais effectuer vos démarches 
              en quelques clics, sans vous déplacer et sans perdre de temps.
            </p>
          </div>
          <!-- CTA Button -->
          <div class="pt-4">
            <NuxtLink 
              to="/operations" 
              class="inline-flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-semibold"
            >
              <span>Découvrir nos services</span>
              <Icon name="heroicons:arrow-right-20-solid" class="w-5 h-5" />
            </NuxtLink>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div class="relative">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Icon name="heroicons:light-bulb-20-solid" class="w-10 h-10 text-white" />
            </div>
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 text-center mb-3">
            Innovation
          </h3>
          <p class="text-gray-600 text-center leading-relaxed">
            Nous utilisons les dernières technologies pour vous offrir une expérience utilisateur exceptionnelle
          </p>
        </div>
      </div>

      <!-- Section Valeurs -->
      <div class="mb-20">
        <div class="text-center mb-16">
          <div class="inline-flex items-center space-x-2 text-blue-600 font-semibold text-sm uppercase tracking-wide mb-4">
            <Icon name="heroicons:heart-20-solid" class="w-4 h-4" />
            <span>Nos Valeurs</span>
          </div>
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            Ce qui nous guide
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Des principes forts qui orientent chacune de nos décisions et innovations
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Simplicité -->
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon name="heroicons:check-circle-20-solid" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 text-center mb-4">
              Simplicité
            </h3>
            <p class="text-gray-600 text-center leading-relaxed">
              Nous rendons complexe simple. Chaque fonctionnalité est pensée pour vous faire gagner du temps.
            </p>
          </div>

          <!-- Sécurité -->
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon name="heroicons:shield-check-20-solid" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 text-center mb-4">
              Sécurité
            </h3>
            <p class="text-gray-600 text-center leading-relaxed">
              Vos données sont protégées par les plus hauts standards de sécurité et de confidentialité.
            </p>
          </div>

          <!-- Accessibilité -->
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon name="heroicons:users-20-solid" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 text-center mb-4">
              Accessibilité
            </h3>
            <p class="text-gray-600 text-center leading-relaxed">
              Notre plateforme est conçue pour être accessible à tous, partout et à tout moment.
            </p>
          </div>
        </div>
      </div>

      <!-- Section Statistiques -->
      <div class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-12 mb-20 relative overflow-hidden">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-white mb-4">
              Form Modulable en chiffres
            </h2>
            <p class="text-blue-100 text-lg">
              La confiance de nos utilisateurs se mesure
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="text-4xl font-bold text-white mb-2">10K+</div>
              <div class="text-blue-200 font-medium">Formulaires traités</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-white mb-2">98%</div>
              <div class="text-blue-200 font-medium">Satisfaction client</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-white mb-2">24/7</div>
              <div class="text-blue-200 font-medium">Support disponible</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Contact/CTA final -->
      <div class="text-center">
        <div class="bg-blue-600 rounded-3xl p-12 shadow-xl border border-blue-500">
          <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Icon name="heroicons:envelope-20-solid" class="w-10 h-10 text-white" />
          </div>
          <h2 class="text-3xl font-bold text-white mb-4">
            Prêt à simplifier vos démarches ?
          </h2>
          <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui ont déjà adopté Form Modulable pour leurs démarches administratives
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <NuxtLink 
              to="/operations" 
              class="inline-flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-semibold"
            >
              <span>Commencer maintenant</span>
              <Icon name="heroicons:rocket-launch-20-solid" class="w-5 h-5" />
            </NuxtLink>
            <NuxtLink 
              to="/" 
              class="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Icon name="heroicons:home-20-solid" class="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ✅ Animation et interaction avancées

// ✅ États réactifs pour les animations
const isVisible = ref(false)
const observer = ref(null)
const stats = ref([
  { value: 0, target: 10000, suffix: '+', label: 'Formulaires traités' },
  { value: 0, target: 98, suffix: '%', label: 'Satisfaction client' },
  { value: 0, target: 24, suffix: '/7', label: 'Support disponible' }
])

// ✅ Animation des statistiques au scroll
const animateStats = () => {
  stats.value.forEach((stat, index) => {
    let current = 0
    const increment = stat.target / 100
    const timer = setInterval(() => {
      current += increment
      if (current >= stat.target) {
        current = stat.target
        clearInterval(timer)
      }
      stat.value = Math.floor(current)
    }, 20 + index * 10) // Délai différent pour chaque stat
  })
}

// ✅ Intersection Observer pour déclencher les animations
const observerCallback = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !isVisible.value) {
      isVisible.value = true
      animateStats()
    }
  })
}

// ✅ Fonctions de navigation améliorées et sécurisées
const navigateToOperations = () => {
  if (!process.client) return
  
  // Animation de sortie fluide
  document.body.style.transform = 'scale(0.98)'
  document.body.style.opacity = '0.8'
  
  setTimeout(() => {
    navigateTo('/operations')
  }, 200)
}

const navigateHome = () => {
  if (!process.client) return
  
  // Animation de sortie fluide
  document.body.style.transform = 'scale(0.98)'
  document.body.style.opacity = '0.8'
  
  setTimeout(() => {
    navigateTo('/')
  }, 200)
}

// ✅ Animation d'entrée au montage
onMounted(() => {
  // Animation d'entrée de la page
  nextTick(() => {
    document.body.style.opacity = '0'
    document.body.style.transform = 'translateY(20px)'
    
    setTimeout(() => {
      document.body.style.transition = 'all 0.6s ease-out'
      document.body.style.opacity = '1'
      document.body.style.transform = 'translateY(0)'
    }, 100)

    // Observer pour les statistiques - version robuste
    const statsSection = document.querySelector('.bg-gradient-to-br.from-blue-600')
    if (statsSection && 'IntersectionObserver' in window) {
      observer.value = new IntersectionObserver(observerCallback, {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
      })
      observer.value.observe(statsSection)
    }
  })
})

// ✅ Cleanup des animations et observers
onUnmounted(() => {
  // Nettoyer l'observer
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
  
  // Réinitialiser les styles
  if (process.client) {
    document.body.style.transition = ''
    document.body.style.transform = ''
    document.body.style.opacity = ''
  }
})

// ✅ SEO optimisé avec useSeoMeta (plus performant)
useSeoMeta({
  title: 'À propos - Form Modulable | Simplifiez vos démarches administratives',
  ogTitle: 'À propos - Form Modulable',
  description: 'Découvrez Form Modulable, la plateforme innovante qui révolutionne vos démarches administratives. Simplicité, sécurité et accessibilité pour tous.',
  ogDescription: 'Découvrez notre mission de simplification des démarches administratives',
  ogType: 'website',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
  keywords: 'formulaires, démarches administratives, plateforme numérique, simplicité, sécurité'
})

// ✅ Structured Data avec JSON-LD
useHead({
  link: [
    { rel: 'canonical', href: 'https://form-modulable.com/about' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Form Modulable',
        description: 'Plateforme de simplification des démarches administratives',
        url: 'https://form-modulable.com',
        logo: 'https://form-modulable.com/logo.png',
        foundingDate: '2024',
        sameAs: [
          'https://twitter.com/formmodulable',
          'https://linkedin.com/company/formmodulable'
        ]
      })
    }
  ]
})
</script>

<style scoped>
/* ✨ Animations personnalisées pour une UX premium */
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

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

/* Classes d'animation */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

.animate-slide-in-left {
  animation: slideInLeft 0.8s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.8s ease-out;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Améliorations des transitions */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
}

/* Effets de survol pour les cartes */
.card-hover {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}

.card-hover:hover::before {
  left: 100%;
}

/* Animation de compteur */
.counter {
  font-variant-numeric: tabular-nums;
  transition: all 0.3s ease;
}

/* Boutons améliorés */
.btn-enhanced {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  background-size: 200% 200%;
  transition: all 0.3s ease;
}

.btn-enhanced:hover {
  background-position: right center;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.btn-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-enhanced:hover::before {
  left: 100%;
}

/* Responsive design amélioré */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .stats-grid {
    gap: 1rem;
  }
  
  .card-padding {
    padding: 1.5rem;
  }
}

/* Animation de scroll fluide */
html {
  scroll-behavior: smooth;
}

/* Optimisation des performances */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus states pour l'accessibilité */
.focus\:ring-custom:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
</style>