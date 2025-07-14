export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuthStore()
  
  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = [
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/'
  ]
  
  // Vérifier si la route actuelle est publique
  const isPublicPage = publicPages.some(page => 
    to.path === page || to.path.startsWith(page)
  )
  
  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!isAuthenticated && !isPublicPage) {
    return navigateTo('/auth/login')
  }
  
  // Si l'utilisateur est authentifié et essaie d'accéder aux pages d'auth
  if (isAuthenticated && (to.path.startsWith('/auth/') && to.path !== '/auth/profile')) {
    return navigateTo('/dashboard')
  }
})
