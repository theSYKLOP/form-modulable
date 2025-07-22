import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

// Interface pour l'utilisateur basée sur votre modèle Prisma
export interface User {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: 'USER' | 'ADMIN' | 'MODERATOR' // Ajouter le rôle
  emailVerified?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// Interface pour les données d'authentification
export interface AuthData {
  token?: string
  user?: User
  isAuthenticated: boolean
}

// Interfaces pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// Interface pour les formulaires d'authentification
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
  username?: string
}

export interface ResetPasswordForm {
  email: string
}

export interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileForm {
  firstName?: string
  lastName?: string
  username?: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  // État réactif avec persistance dans localStorage
  const authData = useLocalStorage<AuthData>('auth', {
    token: undefined,
    user: undefined,
    isAuthenticated: false
  })

  // États de chargement
  const isLoading = ref(false)
  const isLoginLoading = ref(false)
  const isRegisterLoading = ref(false)
  const isResetPasswordLoading = ref(false)
  const isUpdateProfileLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => authData.value.isAuthenticated && !!authData.value.token)
  const user = computed(() => authData.value.user)
  const token = computed(() => authData.value.token)
  const userFullName = computed(() => {
    if (!user.value) return ''
    if (user.value.firstName && user.value.lastName) {
      return `${user.value.firstName} ${user.value.lastName}`
    }
    return user.value.username || user.value.email
  })

  // Actions d'authentification
  const login = async (credentials: LoginForm) => {
    isLoginLoading.value = true
    try {
      const response = await $fetch<ApiResponse<{ user: User, token: string }>>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (response.success && response.data) {
        // Mise à jour de l'état
        authData.value = {
          token: response.data.token,
          user: response.data.user,
          isAuthenticated: true
        }

        // Pas d'appel à updateLastLogin - c'est fait côté serveur dans l'API login

        return { success: true, data: response.data }
      }

      throw new Error('Réponse invalide du serveur')
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      return { 
        success: false, 
        error: error.data?.message || 'Erreur de connexion' 
      }
    } finally {
      isLoginLoading.value = false
    }
  }

  const register = async (userData: RegisterForm) => {
    isRegisterLoading.value = true
    try {
      const response = await $fetch<ApiResponse<{ user: User, token: string }>>('/api/auth/register', {
        method: 'POST',
        body: userData
      })

      if (response.success && response.data) {
        // Mise à jour de l'état
        authData.value = {
          token: response.data.token,
          user: response.data.user,
          isAuthenticated: true
        }

        return { success: true, data: response.data }
      }

      throw new Error('Réponse invalide du serveur')
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error)
      return { 
        success: false, 
        error: error.data?.message || 'Erreur d\'inscription' 
      }
    } finally {
      isRegisterLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // Appel API pour invalider le token côté serveur
      if (token.value) {
        await $fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      // Nettoyage de l'état local
      authData.value = {
        token: undefined,
        user: undefined,
        isAuthenticated: false
      }
      
      // Redirection vers la page de connexion
      await navigateTo('/auth?form=login')
    }
  }

  const requestPasswordReset = async (email: string) => {
    isResetPasswordLoading.value = true
    try {
      const response = await $fetch<ApiResponse>('/api/auth/password-reset/request', {
        method: 'POST',
        body: { email }
      })

      return { success: response.success, message: response.message }
    } catch (error: any) {
      console.error('Erreur de demande de réinitialisation:', error)
      return { 
        success: false, 
        error: error.data?.message || 'Erreur lors de la demande de réinitialisation' 
      }
    } finally {
      isResetPasswordLoading.value = false
    }
  }

  const resetPassword = async (token: string, password: string) => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiResponse>('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: { token, password }
      })

      return { success: response.success, message: response.message }
    } catch (error: any) {
      console.error('Erreur de réinitialisation du mot de passe:', error)
      return { 
        success: false, 
        error: error.data?.message || 'Erreur lors de la réinitialisation du mot de passe' 
      }
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (passwords: ChangePasswordForm) => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiResponse>('/api/auth/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: passwords
      })

      return { success: response.success, message: response.message }
    } catch (error: any) {
      console.error('Erreur de changement de mot de passe:', error)
      return { 
        success: false, 
        error: error.data?.message || 'Erreur lors du changement de mot de passe' 
      }
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (profileData: UpdateProfileForm) => {
    isUpdateProfileLoading.value = true
    try {
      const response = await $fetch<ApiResponse<{ user: User }>>('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: profileData
      })

      if (response.success && response.data) {
        // Mise à jour de l'utilisateur dans le store
        authData.value.user = response.data.user

        return { success: true, data: response.data }
      }

      throw new Error('Réponse invalide du serveur')
    } catch (error: any) {
      console.error('Erreur de mise à jour du profil:', error)
      return { 
        success: false, 
        error: error.data?.message || 'Erreur lors de la mise à jour du profil' 
      }
    } finally {
      isUpdateProfileLoading.value = false
    }
  }

  // Actions pour les nouvelles fonctionnalités
  const forgotPassword = async (email: string) => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiResponse>('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      })

      return { success: response.success, message: response.message }
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Erreur lors de la demande de réinitialisation' }
    } finally {
      isLoading.value = false
    }
  }

  const resetPasswordWithToken = async (token: string, password: string, confirmPassword: string) => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiResponse>('/api/auth/reset-password', {
        method: 'POST',
        body: { token, password, confirmPassword }
      })

      return { success: response.success, message: response.message }
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Erreur lors de la réinitialisation' }
    } finally {
      isLoading.value = false
    }
  }

  const verifyEmail = async (token: string) => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiResponse<{ user: User, token: string }>>('/api/auth/verify-email', {
        method: 'POST',
        body: { token }
      })

      if (response.success && response.data) {
        authData.value.user = response.data.user
        authData.value.token = response.data.token
        authData.value.isAuthenticated = true
      }

      return { success: response.success, message: response.message }
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Erreur lors de la vérification' }
    } finally {
      isLoading.value = false
    }
  }

  const resendVerification = async (email: string) => {
    isLoading.value = true
    try {
      const response = await $fetch<ApiResponse>('/api/auth/resend-verification', {
        method: 'POST',
        body: { email }
      })

      return { success: response.success, message: response.message }
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Erreur lors du renvoi' }
    } finally {
      isLoading.value = false
    }
  }

  const checkAuthStatus = async () => {
    if (!token.value) return false

    try {
      const response = await $fetch<ApiResponse<{ user: User }>>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.success && response.data) {
        // Mise à jour des données utilisateur
        authData.value.user = response.data.user
        authData.value.isAuthenticated = true

        return true
      }

      return false
    } catch (error) {
      console.error('Token invalide, déconnexion:', error)
      await logout()
      return false
    }
  }

  const refreshToken = async () => {
    try {
      const response = await $fetch<ApiResponse<{ token: string }>>('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.success && response.data) {
        authData.value.token = response.data.token
        return { success: true, token: response.data.token }
      }

      throw new Error('Réponse invalide du serveur')
    } catch (error: any) {
      console.error('Erreur de rafraîchissement du token:', error)
      await logout()
      return { success: false, error: error.data?.message }
    }
  }

  // Ajoutons cette méthode dans le store d'authentification

  // ✅ Méthode d'initialisation rapide depuis localStorage
  const initializeAuth = () => {
    // ✅ Utiliser import.meta.client au lieu de process.client (non déprécié)
    if (import.meta.client) {
      try {
        // ✅ Le store utilise déjà useLocalStorage, donc les données sont déjà synchronisées
        // On peut juste vérifier si on a des données valides
        if (authData.value.token && authData.value.user && !authData.value.isAuthenticated) {
          // ✅ Restaurer l'état d'authentification depuis les données locales
          authData.value.isAuthenticated = true
          
          // ✅ Optionnel : Vérifier la validité du token (non bloquant)
          verifyTokenAsync(authData.value.token)
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error)
        // ✅ En cas d'erreur, réinitialiser l'état
        authData.value = {
          token: undefined,
          user: undefined,
          isAuthenticated: false
        }
      }
    }
  }

  // ✅ Vérification async du token (non bloquante)
  const verifyTokenAsync = async (tokenToVerify: string): Promise<void> => {
    try {
      const response = await $fetch<ApiResponse>('/api/auth/verify', {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      })
      
      if (!response.success) {
        // ✅ Token invalide, déconnecter
        await logout()
      }
    } catch (error) {
      // ✅ En cas d'erreur réseau, garder l'état local mais logger
      console.warn('Impossible de vérifier le token:', error)
    }
  }

  return {
    // État
    authData: readonly(authData),
    isLoading: readonly(isLoading),
    isLoginLoading: readonly(isLoginLoading),
    isRegisterLoading: readonly(isRegisterLoading),
    isResetPasswordLoading: readonly(isResetPasswordLoading),
    isUpdateProfileLoading: readonly(isUpdateProfileLoading),

    // Getters
    isAuthenticated,
    user,
    token,
    userFullName,

    // Actions
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    changePassword,
    updateProfile,
    verifyEmail,
    resendVerification,
    checkAuthStatus,
    refreshToken,
    forgotPassword,
    resetPasswordWithToken,

    // ✅ Méthodes d'initialisation ajoutées
    initializeAuth,
    verifyTokenAsync
  }
})
