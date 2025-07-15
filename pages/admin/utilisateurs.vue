<template>
  <div>
    <div class="mb-6">
      <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
        <Icon name="heroicons:plus" class="w-4 h-4 mr-2 inline" />
        Nouvel utilisateur
      </button>
    </div>
    
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Liste des utilisateurs
        </h2>
        <p class="text-gray-600">
          Gestion des utilisateurs - À implémenter
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Gestion des utilisateurs - Admin'
})
</script>