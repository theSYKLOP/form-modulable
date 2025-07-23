modulable\components\LoginForm.vue
<template>
  <div class="space-y-8">
    <!-- Logo et titre -->
    <div class="text-center">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Icon name="heroicons:document-text" class="w-8 h-8 text-white" />
        </div>
      </div>
      <h2 class="text-3xl font-bold text-gray-900 mb-2">
        Bon retour !
      </h2>
      <p class="text-gray-600">
        Connectez-vous à votre compte pour continuer
      </p>
    </div>

    <!-- Formulaire -->
    <form @submit.prevent="handleLogin" class="space-y-6">
      <!-- Email -->
      <div class="space-y-2">
        <label for="email" class="text-sm font-medium text-gray-700 block">
          Adresse email
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="heroicons:envelope" class="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 sm:text-sm"
            :class="{ 
              'border-red-300 focus:ring-red-500 focus:border-red-500': emailError,
              'border-gray-300': !emailError 
            }"
            placeholder="votre@email.com"
            :disabled="isLoginLoading"
          />
        </div>
        <p v-if="emailError" class="text-sm text-red-600 mt-1">{{ emailError }}</p>
      </div>

      <!-- Mot de passe -->
      <div class="space-y-2">
        <label for="password" class="text-sm font-medium text-gray-700 block">
          Mot de passe
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="heroicons:lock-closed" class="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 sm:text-sm"
            :class="{ 
              'border-red-300 focus:ring-red-500 focus:border-red-500': passwordError,
              'border-gray-300': !passwordError 
            }"
            placeholder="Votre mot de passe"
            :disabled="isLoginLoading"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <Icon 
              :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" 
              class="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" 
            />
          </button>
        </div>
        <p v-if="passwordError" class="text-sm text-red-600 mt-1">{{ passwordError }}</p>
      </div>

      <!-- Se souvenir de moi et mot de passe oublié -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            v-model="rememberMe"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-700">
            Se souvenir de moi
          </label>
        </div>
        <NuxtLink 
          to="/auth/forgot-password" 
          class="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          Mot de passe oublié ?
        </NuxtLink>
      </div>

      <!-- Message d'erreur général -->
      <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4">
        <div class="flex">
          <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Erreur de connexion
            </h3>
            <div class="mt-1 text-sm text-red-700">
              {{ error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Bouton de connexion -->
      <button
        type="submit"
        :disabled="isLoginLoading || !isFormValid"
        class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <span v-if="isLoginLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        {{ isLoginLoading ? 'Connexion en cours...' : 'Se connecter' }}
      </button>

      <!-- Divider -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      <!-- Lien vers inscription -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Vous n'avez pas de compte ?
          <button
            type="button"
            @click="$emit('switchToRegister')"
            class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
// Émissions
const emit = defineEmits(['switchToRegister'])

// Store d'authentification
const authStore = useAuthStore()
const { login } = authStore

// Accès direct aux propriétés du store au lieu de storeToRefs
const isLoginLoading = computed(() => authStore.isLoginLoading)

// État du formulaire - Utiliser ref au lieu de reactive
const form = ref({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const showPassword = ref(false)
const error = ref('')
const emailError = ref('')
const passwordError = ref('')

// Validation du formulaire - Accéder aux valeurs avec .value
const isFormValid = computed(() => {
  const emailValid = form.value.email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
  const passwordValid = form.value.password.length > 0
  
  // Debug pour comprendre pourquoi le bouton est désactivé
  console.log('Form validation:', {
    email: form.value.email,
    password: form.value.password,
    emailValid,
    passwordValid,
    isLoginLoading: isLoginLoading.value,
    isFormValid: emailValid && passwordValid,
    buttonDisabled: isLoginLoading.value || !(emailValid && passwordValid)
  })
  
  return emailValid && passwordValid
})

// Validation en temps réel
watch(() => form.value.email, (newEmail) => {
  emailError.value = ''
  // Validation plus flexible - seulement si l'email n'est pas vide
  if (newEmail && newEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    emailError.value = 'Format d\'email invalide'
  }
})

watch(() => form.value.password, () => {
  passwordError.value = ''
  if (form.value.password && form.value.password.length < 6) {
    passwordError.value = 'Le mot de passe doit contenir au moins 6 caractères'
  }
})

// Fonction de connexion
const handleLogin = async () => {
  error.value = ''
  emailError.value = ''
  passwordError.value = ''

  // Validation côté client
  if (!form.value.email) {
    emailError.value = 'L\'email est requis'
    return
  }
  
  if (!form.value.password) {
    passwordError.value = 'Le mot de passe est requis'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    emailError.value = 'Format d\'email invalide'
    return
  }

  try {
    const result = await login({
      email: form.value.email,
      password: form.value.password,
      remember: rememberMe.value
    })

    if (result.success) {
      // ✅ Gestion de la redirection selon le rôle utilisateur
      const route = useRoute()
      const redirectTo = route.query.redirect
      
      // ✅ Si il y a un paramètre redirect spécifique, l'utiliser
      if (redirectTo && redirectTo !== '/auth') {
        await navigateTo(redirectTo, { replace: true })
      } else {
        // ✅ Redirection selon le rôle de l'utilisateur
        const userRole = result.data?.user?.role || authStore.user?.role
        
        if (userRole === 'ADMIN') {
          // ✅ Admin → Dashboard d'administration
          await navigateTo('/admin', { replace: true })
        } else {
          // ✅ Utilisateur normal → Page d'accueil
          await navigateTo('/', { replace: true })
        }
      }
    } else {
      error.value = result.error || 'Erreur de connexion'
    }
  } catch (err) {
    console.error('Erreur de connexion:', err)
    
    if (err.statusCode === 401) {
      error.value = 'Email ou mot de passe incorrect'
    } else if (err.statusCode === 429) {
      error.value = 'Trop de tentatives de connexion. Veuillez patienter.'
    } else {
      error.value = 'Une erreur est survenue lors de la connexion'
    }
  }
}
</script>