<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <!-- Card d'erreur -->
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <!-- Icône d'erreur -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:shield-exclamation" class="w-10 h-10 text-red-600" />
          </div>
        </div>

        <!-- Contenu d'erreur -->
        <div class="space-y-4">
          <h1 class="text-2xl font-bold text-gray-900">
            Accès refusé
          </h1>
          <p class="text-gray-600">
            {{ errorMessage }}
          </p>
          
          <!-- Code d'erreur -->
          <div v-if="errorCode" class="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
            Erreur {{ errorCode }}
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 space-y-3">
          <NuxtLink
            to="/auth?form=login"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors inline-block"
          >
            Se connecter
          </NuxtLink>
          <NuxtLink
            to="/"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors inline-block"
          >
            Retour à l'accueil
          </NuxtLink>
        </div>
      </div>

      <!-- Informations de contact -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500 mb-2">
          Besoin d'aide ?
        </p>
        <p class="text-sm text-gray-600">
          <Icon name="heroicons:envelope" class="w-4 h-4 inline mr-1" />
          support@formmodulable.fr
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Désactiver le layout par défaut
definePageMeta({
  layout: false
})

// Props depuis la route
const route = useRoute()
const errorCode = route.query.code || '403'
const errorMessage = route.query.message || 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'

// SEO
useHead({
  title: `Erreur ${errorCode} - Accès refusé`,
  meta: [
    { name: 'description', content: 'Page d\'erreur d\'accès' },
    { name: 'robots', content: 'noindex' }
  ]
})
</script>
