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
      const { data } = await $fetch<{ user: User, token: string }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      // Mise à jour de l'état
      authData.value = {
        token: data.token,
        user: data.user,
        isAuthenticated: true
      }

      // Mise à jour de la date de dernière connexion
      await updateLastLogin()

      return { success: true, data }
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
      const { data } = await $fetch<{ user: User, token: string }>('/api/auth/register', {
        method: 'POST',
        body: userData
      })

      // Mise à jour de l'état
      authData.value = {
        token: data.token,
        user: data.user,
        isAuthenticated: true
      }

      return { success: true, data }
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
      await navigateTo('/auth/login')
    }
  }

  const requestPasswordReset = async (email: string) => {
    isResetPasswordLoading.value = true
    try {
      await $fetch('/api/auth/password-reset/request', {
        method: 'POST',
        body: { email }
      })

      return { success: true }
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
      await $fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: { token, password }
      })

      return { success: true }
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
      await $fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: passwords
      })

      return { success: true }
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
      const { data } = await $fetch<{ user: User }>('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: profileData
      })

      // Mise à jour de l'utilisateur dans le store
      authData.value.user = data.user

      return { success: true, data }
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

  const verifyEmail = async (token: string) => {
    isLoading.value = true
    try {
      const { data } = await $fetch<{ user: User }>('/api/auth/verify-email', {
        method: 'POST',
        body: { token }
      })

      // Mise à jour de l'utilisateur avec email vérifié
      if (authData.value.user) {
        authData.value.user = data.user
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Erreur de vérification d\'email:', error)
      return { 
        success: false, 
        error: error.data?.message || 'Erreur lors de la vérification de l\'email' 
      }
    } finally {
      isLoading.value = false
    }
  }

  const resendEmailVerification = async () => {
    isLoading.value = true
    try {
      await $fetch('/api/auth/verify-email/resend', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      return { success: true }
    } catch (error: any) {
      console.error('Erreur de renvoi de vérification:', error)
      return { 
        success: false, 
        error: error.data?.message || 'Erreur lors du renvoi de la vérification' 
      }
    } finally {
      isLoading.value = false
    }
  }

  const checkAuthStatus = async () => {
    if (!token.value) return false

    try {
      const { data } = await $fetch<{ user: User }>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      // Mise à jour des données utilisateur
      authData.value.user = data.user
      authData.value.isAuthenticated = true

      return true
    } catch (error) {
      console.error('Token invalide, déconnexion:', error)
      await logout()
      return false
    }
  }

  const updateLastLogin = async () => {
    try {
      await $fetch('/api/auth/last-login', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      if (authData.value.user) {
        authData.value.user.lastLoginAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur de mise à jour de la dernière connexion:', error)
    }
  }

  const refreshToken = async () => {
    try {
      const { data } = await $fetch<{ token: string }>('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      authData.value.token = data.token
      return { success: true, token: data.token }
    } catch (error: any) {
      console.error('Erreur de rafraîchissement du token:', error)
      await logout()
      return { success: false, error: error.data?.message }
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
    resendEmailVerification,
    checkAuthStatus,
    updateLastLogin,
    refreshToken
  }
})
