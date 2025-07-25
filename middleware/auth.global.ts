export default defineNuxtRouteMiddleware((to) => {
  // ✅ Éviter les boucles de redirection
  if (to.path === '/auth-loading') {
    return
  }
  
  const authStore = useAuthStore()
  
  // ✅ Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth
  if (authStore.isAuthenticated && to.path.startsWith('/auth')) {
    // ✅ Gérer la redirection après connexion si spécifiée
    const redirectTo = to.query.redirect as string
    if (redirectTo && redirectTo !== '/auth' && redirectTo !== to.path) {
      return navigateTo(redirectTo, { replace: true })
    }
    
    // ✅ Redirection selon le rôle
    if (authStore.user?.role === 'ADMIN') {
      return navigateTo('/admin', { replace: true })
    } else {
      return navigateTo('/', { replace: true })
    }
  }
  
  // ✅ Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = ['/', '/about']
  if (publicPages.includes(to.path)) {
    return
  }
  
  // ✅ Vérification d'authentification pour la page operations
  if (to.path === '/operations') {
    if (!authStore.isAuthenticated) {
      return navigateTo(`/auth?form=login&redirect=${encodeURIComponent(to.fullPath)}`)
    }
    // Si authentifié, laisser passer (peu importe le rôle)
    return
  }
  
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