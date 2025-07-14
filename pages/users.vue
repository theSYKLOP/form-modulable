<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">Gestion des Utilisateurs</h1>
    
    <!-- Navigation -->
    <div class="mb-8">
      <nav class="flex space-x-4">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">Accueil</NuxtLink>
        <NuxtLink to="/users" class="text-blue-600 hover:text-blue-800 font-semibold">Utilisateurs</NuxtLink>
        <NuxtLink to="/forms" class="text-blue-600 hover:text-blue-800">Formulaires</NuxtLink>
        <NuxtLink to="/templates" class="text-blue-600 hover:text-blue-800">Templates</NuxtLink>
      </nav>
    </div>

    <!-- Liste des utilisateurs -->
    <NuxtIsland name="UsersList" />
  </div>
</template>

<script setup>
useHead({
  title: 'Utilisateurs - Form Modulable',
  meta: [
    { name: 'description', content: 'Gestion des utilisateurs de Form Modulable' }
  ]
})
</script>
