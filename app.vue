<template>
  <div>
    <NuxtRouteAnnouncer />
    
    <!-- Navigation pour les utilisateurs authentifiés -->
    <nav v-if="isAuthenticated" class="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div class="container mx-auto px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex space-x-8">
            <NuxtLink to="/dashboard" class="text-blue-600 hover:text-blue-800 font-medium">Dashboard</NuxtLink>
            <NuxtLink to="/users" class="text-blue-600 hover:text-blue-800">Utilisateurs</NuxtLink>
            <NuxtLink to="/forms" class="text-blue-600 hover:text-blue-800">Formulaires</NuxtLink>
            <NuxtLink to="/templates" class="text-blue-600 hover:text-blue-800">Templates</NuxtLink>
          </div>
          <div v-if="user" class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">{{ userFullName }}</span>
            <button @click="handleLogout" class="text-sm text-red-600 hover:text-red-800">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu de la page -->
    <NuxtPage />
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const { logout } = authStore
const { isAuthenticated, user, userFullName } = storeToRefs(authStore)

// Gestion de la déconnexion
const handleLogout = async () => {
  await logout()
}

// Vérification de l'authentification au montage
onMounted(async () => {
  if (process.client) {
    await authStore.checkAuthStatus()
  }
})
</script>
