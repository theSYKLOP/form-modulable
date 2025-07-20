export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  
  // ✅ Utiliser les propriétés directement du store
  const isAuthenticated = authStore.isAuthenticated
  const user = authStore.user
  
  // ✅ Vérifier le statut d'authentification si nécessaire
  if (isAuthenticated && !user) {
    try {
      await authStore.checkAuthStatus()
    } catch (error) {
      // Si la vérification échoue, déconnecter l'utilisateur
      await authStore.logout()
    }
  }
  
  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = [
    '/',
    '/about',
    '/operations',
    '/auth',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email'
  ]
  
  // Vérifier si la route actuelle est publique
  const isPublicPage = publicPages.some(page => 
    to.path === page || to.path.startsWith(page)
  )
  
  // ✅ Gestion de la route /dashboard - redirection vers admin ou page utilisateur
  if (to.path === '/dashboard') {
    if (!isAuthenticated) {
      return navigateTo('/auth?form=login&redirect=' + encodeURIComponent(to.fullPath))
    }
    
    // Redirection selon le rôle
    if (user?.role === 'ADMIN') {
      return navigateTo('/admin', { replace: true })
    } else {
      // Rediriger vers une page utilisateur ou créer une vraie page dashboard
      // Pour l'instant, redirection vers admin aussi (à adapter selon vos besoins)
      return navigateTo('/admin', { replace: true })
    }
  }
  
  // ✅ Vérification des permissions admin pour les pages admin
  if (to.path.startsWith('/admin')) {
    if (!isAuthenticated) {
      return navigateTo('/auth?form=login&redirect=' + encodeURIComponent(to.fullPath))
    }
    
    if (user?.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès refusé - Permissions administrateur requises'
      })
    }
    
    // Laisser passer vers les pages admin
    return
  }
  
  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!isAuthenticated && !isPublicPage) {
    return navigateTo('/auth?form=login&redirect=' + encodeURIComponent(to.fullPath))
  }
  
  // Si l'utilisateur est authentifié et essaie d'accéder aux pages d'auth
  if (isAuthenticated && to.path.startsWith('/auth')) {
    // ✅ Gérer la redirection après connexion
    const redirectTo = to.query.redirect as string
    if (redirectTo && redirectTo !== '/auth') {
      return navigateTo(redirectTo, { replace: true })
    }
    
    // Redirection par défaut vers admin (puisque c'est votre dashboard principal)
    return navigateTo('/admin', { replace: true })
  }
})