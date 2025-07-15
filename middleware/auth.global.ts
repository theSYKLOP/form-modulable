export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const { isAuthenticated, user } = storeToRefs(authStore)
  
  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = [
    '/',
    '/about',
    '/operations',
    '/auth', // Page unique d'authentification
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email'
  ]
  
  // Vérifier si la route actuelle est publique
  const isPublicPage = publicPages.some(page => 
    to.path === page || to.path.startsWith(page)
  )
  
  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!isAuthenticated.value && !isPublicPage) {
    return navigateTo('/auth?form=login')
  }
  
  // Si l'utilisateur est authentifié et essaie d'accéder aux pages d'auth
  if (isAuthenticated.value && to.path.startsWith('/auth')) {
    // Rediriger selon le rôle
    if (user.value?.role === 'ADMIN') {
      return navigateTo('/admin')
    } else {
      return navigateTo('/')
    }
  }
  
  // Vérifier les permissions admin pour les pages admin
  if (to.path.startsWith('/admin')) {
    if (!isAuthenticated.value) {
      return navigateTo('/auth?form=login')
    }
    
    if (user.value?.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès refusé - Permissions administrateur requises'
      })
    }
  }
})