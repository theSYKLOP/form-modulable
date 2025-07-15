<template>
  <div>
    <component :is="currentLayout">
      <NuxtPage />
    </component>
  </div>
</template>

<script setup>
// Imports
import DefaultLayout from '~/layouts/default.vue'
import AuthLayout from '~/layouts/auth.vue'
import AdminLayout from '~/layouts/admin.vue'

// Store d'authentification
const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)

// Route actuelle
const route = useRoute()

// Déterminer le layout selon la route et l'authentification
const currentLayout = computed(() => {
  // Pages d'administration (uniquement pour les admins)
  if (route.path.startsWith('/admin')) { // Enlevé le slash final
    return AdminLayout
  }
  
  // Pages d'authentification
  if (route.path.startsWith('/auth')) {
    return AuthLayout
  }
  
  // Toutes les autres pages publiques
  return DefaultLayout
})

// Vérifier l'authentification au chargement
onMounted(async () => {
  const token = useCookie('auth-token').value || localStorage.getItem('auth-token')
  if (token) {
    await authStore.checkAuthStatus()
  }
})
</script>
