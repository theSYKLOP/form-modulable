<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          À propos de Form Modulable
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Notre mission est de simplifier vos démarches administratives grâce à une plateforme moderne et intuitive
        </p>
      </div>

      <!-- Contenu à propos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-6">
            Notre vision
          </h2>
          <p class="text-gray-600 mb-4">
            Nous croyons que les démarches administratives ne devraient pas être un obstacle dans votre vie quotidienne. 
            C'est pourquoi nous avons créé Form Modulable, une plateforme qui centralise toutes vos démarches en un seul endroit.
          </p>
          <p class="text-gray-600">
            Grâce à notre technologie avancée et notre interface intuitive, vous pouvez désormais effectuer vos démarches 
            en quelques clics, sans vous déplacer et sans perdre de temps.
          </p>
        </div>
        <div class="bg-blue-100 rounded-lg p-8">
          <Icon name="heroicons:light-bulb" class="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-gray-900 text-center mb-2">
            Innovation
          </h3>
          <p class="text-gray-600 text-center">
            Nous utilisons les dernières technologies pour vous offrir une expérience utilisateur exceptionnelle
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'À propos - Form Modulable',
  meta: [
    { name: 'description', content: 'Découvrez Form Modulable, la plateforme qui simplifie vos démarches administratives' }
  ]
})
</script>