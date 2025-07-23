import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()

  // Vérifications de rôle
  const isAdmin = computed(() => {
    return authStore.isAuthenticated && authStore.user?.role === 'ADMIN'
  })

  const isModerator = computed(() => {
    return authStore.isAuthenticated && authStore.user?.role === 'MODERATOR'
  })

  const isUser = computed(() => {
    return authStore.isAuthenticated && authStore.user?.role === 'USER'
  })

  const isAuthenticated = computed(() => {
    return authStore.isAuthenticated
  })

  // Vérifications de permissions combinées
  const canManageForms = computed(() => {
    return isAdmin.value || isModerator.value
  })

  const canCreateForms = computed(() => {
    return isAdmin.value
  })

  const canViewAdminPanel = computed(() => {
    return isAdmin.value || isModerator.value
  })

  // Informations utilisateur
  const user = computed(() => {
    return authStore.user
  })

  const userDisplayName = computed(() => {
    if (!authStore.user) return null
    return authStore.user.firstName || authStore.user.username || authStore.user.email
  })

  // Actions
  const logout = () => {
    return authStore.logout()
  }

  const login = (credentials: any) => {
    return authStore.login(credentials)
  }

  return {
    // État
    isAuthenticated,
    user,
    userDisplayName,
    
    // Rôles
    isAdmin,
    isModerator,
    isUser,
    
    // Permissions
    canManageForms,
    canCreateForms,
    canViewAdminPanel,
    
    // Actions
    login,
    logout
  }
}
