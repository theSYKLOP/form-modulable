export default defineNuxtPlugin(() => {
  // ✅ Initialisation automatique de l'authentification au démarrage
  if (import.meta.client) {
    const authStore = useAuthStore()
    
    // ✅ Initialiser l'état d'authentification depuis localStorage
    authStore.initializeAuth()
  }
})
