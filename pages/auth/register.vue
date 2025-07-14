<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer votre compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
            connectez-vous à votre compte existant
          </NuxtLink>
        </p>
      </div>
      
      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="space-y-4">
          <!-- Prénom et Nom -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                id="firstName"
                v-model="form.firstName"
                name="firstName"
                type="text"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Prénom"
                :disabled="isRegisterLoading"
              >
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">Nom</label>
              <input
                id="lastName"
                v-model="form.lastName"
                name="lastName"
                type="text"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nom"
                :disabled="isRegisterLoading"
              >
            </div>
          </div>

          <!-- Nom d'utilisateur -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur (optionnel)</label>
            <input
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nom d'utilisateur"
              :disabled="isRegisterLoading"
            >
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Adresse email"
              :disabled="isRegisterLoading"
            >
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe *</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Mot de passe"
              :disabled="isRegisterLoading"
            >
          </div>

          <!-- Confirmation du mot de passe -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Confirmez le mot de passe"
              :disabled="isRegisterLoading"
            >
          </div>
        </div>

        <!-- Conditions d'utilisation -->
        <div class="flex items-center">
          <input
            id="acceptTerms"
            v-model="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <label for="acceptTerms" class="ml-2 block text-sm text-gray-900">
            J'accepte les 
            <a href="#" class="text-blue-600 hover:text-blue-500">conditions d'utilisation</a>
            et la 
            <a href="#" class="text-blue-600 hover:text-blue-500">politique de confidentialité</a>
          </label>
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Erreur d'inscription
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ error }}
              </div>
            </div>
          </div>
        </div>

        <!-- Message de succès -->
        <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Inscription réussie
              </h3>
              <div class="mt-2 text-sm text-green-700">
                {{ successMessage }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isRegisterLoading || !acceptTerms"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isRegisterLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isRegisterLoading ? 'Création...' : 'Créer le compte' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const { register } = authStore
const { isRegisterLoading } = storeToRefs(authStore)

// Meta données de la page
useHead({
  title: 'Inscription - Form Modulable',
  meta: [
    { name: 'description', content: 'Créez votre compte Form Modulable' }
  ]
})

// Données du formulaire
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  username: ''
})

const acceptTerms = ref(false)
const error = ref('')
const successMessage = ref('')

// Gestion de la soumission du formulaire
const handleRegister = async () => {
  error.value = ''
  successMessage.value = ''
  
  const result = await register(form)
  
  if (result.success) {
    successMessage.value = result.message || 'Compte créé avec succès !'
    setTimeout(() => {
      navigateTo('/dashboard')
    }, 2000)
  } else {
    error.value = result.error || 'Erreur lors de la création du compte'
  }
}

// Redirection si déjà connecté
onMounted(() => {
  const { isAuthenticated } = storeToRefs(authStore)
  if (isAuthenticated.value) {
    navigateTo('/dashboard')
  }
})
</script>
