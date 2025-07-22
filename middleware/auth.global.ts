export default defineNuxtRouteMiddleware((to) => {
  // ✅ Éviter les boucles de redirection
  if (to.path === '/auth-loading' || to.path.startsWith('/auth') || to.path === '/') {
    return
  }
  
  const authStore = useAuthStore()
  
  // ✅ Vérification instantanée pour les routes admin
  if (to.path.startsWith('/admin')) {
    // ✅ Si pas d'authentification ou pas admin, rediriger IMMÉDIATEMENT
    if (!authStore.isAuthenticated || !authStore.user || authStore.user.role !== 'ADMIN') {
      return navigateTo(`/auth-loading?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }

  // ✅ Vérification pour les pages form (également réservées aux admins)
  if (to.path.startsWith('/form')) {
    // ✅ Si pas d'authentification ou pas admin, rediriger vers la page de vérification
    if (!authStore.isAuthenticated || !authStore.user || authStore.user.role !== 'ADMIN') {
      return navigateTo(`/auth-loading?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
  
  // ✅ Pour les autres routes protégées
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return navigateTo(`/auth?form=login&redirect=${encodeURIComponent(to.fullPath)}`)
  }
})