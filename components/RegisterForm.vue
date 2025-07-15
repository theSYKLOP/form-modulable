<template>
  <div class="space-y-8">
    <!-- Logo et titre -->
    <div class="text-center">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Icon name="heroicons:user-plus" class="w-8 h-8 text-white" />
        </div>
      </div>
      <h2 class="text-3xl font-bold text-gray-900 mb-2">
        Créer un compte
      </h2>
      <p class="text-gray-600">
        Rejoignez des milliers d'utilisateurs satisfaits
      </p>
    </div>

    <!-- Formulaire -->
    <form @submit.prevent="handleRegister" class="space-y-6">
      <!-- Prénom et Nom -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label for="firstName" class="text-sm font-medium text-gray-700 block">
            Prénom
          </label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            autocomplete="given-name"
            required
            class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-400 sm:text-sm"
            :class="{ 
              'border-red-300 focus:ring-red-500 focus:border-red-500': errors.firstName,
              'border-gray-300': !errors.firstName 
            }"
            placeholder="John"
            :disabled="isRegisterLoading"
          />
          <p v-if="errors.firstName" class="text-sm text-red-600">{{ errors.firstName }}</p>
        </div>

        <div class="space-y-2">
          <label for="lastName" class="text-sm font-medium text-gray-700 block">
            Nom
          </label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            autocomplete="family-name"
            required
            class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-400 sm:text-sm"
            :class="{ 
              'border-red-300 focus:ring-red-500 focus:border-red-500': errors.lastName,
              'border-gray-300': !errors.lastName 
            }"
            placeholder="Doe"
            :disabled="isRegisterLoading"
          />
          <p v-if="errors.lastName" class="text-sm text-red-600">{{ errors.lastName }}</p>
        </div>
      </div>

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
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-400 sm:text-sm"
            :class="{ 
              'border-red-300 focus:ring-red-500 focus:border-red-500': errors.email,
              'border-gray-300': !errors.email 
            }"
            placeholder="john@example.com"
            :disabled="isRegisterLoading"
          />
        </div>
        <p v-if="errors.email" class="text-sm text-red-600">{{ errors.email }}</p>
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
            autocomplete="new-password"
            required
            class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-400 sm:text-sm"
            :class="{ 
              'border-red-300 focus:ring-red-500 focus:border-red-500': errors.password,
              'border-gray-300': !errors.password 
            }"
            placeholder="Minimum 8 caractères"
            :disabled="isRegisterLoading"
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
        <p v-if="errors.password" class="text-sm text-red-600">{{ errors.password }}</p>
        
        <!-- Indicateur de force du mot de passe -->
        <div v-if="form.password" class="mt-2">
          <div class="flex items-center space-x-2">
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full transition-all duration-300 rounded-full"
                :class="passwordStrengthColor"
                :style="{ width: `${passwordStrength}%` }"
              ></div>
            </div>
            <span class="text-xs font-medium" :class="passwordStrengthTextColor">
              {{ passwordStrengthText }}
            </span>
          </div>
        </div>
      </div>

      <!-- Conditions d'utilisation -->
      <div class="space-y-2">
        <div class="flex items-start">
          <input
            id="acceptTerms"
            v-model="acceptTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors mt-1"
          />
          <label for="acceptTerms" class="ml-2 block text-sm text-gray-700 leading-relaxed">
            J'accepte les 
            <a href="#" class="text-purple-600 hover:text-purple-500 font-medium">conditions d'utilisation</a>
            et la 
            <a href="#" class="text-purple-600 hover:text-purple-500 font-medium">politique de confidentialité</a>
          </label>
        </div>
        <p v-if="errors.acceptTerms" class="text-sm text-red-600">{{ errors.acceptTerms }}</p>
      </div>

      <!-- Message d'erreur général -->
      <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4">
        <div class="flex">
          <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Erreur d'inscription
            </h3>
            <div class="mt-1 text-sm text-red-700">
              {{ error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Message de succès -->
      <div v-if="successMessage" class="rounded-lg bg-green-50 border border-green-200 p-4">
        <div class="flex">
          <Icon name="heroicons:check-circle" class="h-5 w-5 text-green-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">
              Inscription réussie
            </h3>
            <div class="mt-1 text-sm text-green-700">
              {{ successMessage }}
            </div>
          </div>
        </div>
      </div>

      <!-- Bouton d'inscription -->
      <button
        type="submit"
        :disabled="isRegisterLoading || !isFormValid"
        class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <span v-if="isRegisterLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        {{ isRegisterLoading ? 'Création en cours...' : 'Créer mon compte' }}
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

      <!-- Lien vers connexion -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Vous avez déjà un compte ?
          <button
            type="button"
            @click="$emit('switchToLogin')"
            class="font-medium text-purple-600 hover:text-purple-500 transition-colors"
          >
            Se connecter
          </button>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
// Émissions
const emit = defineEmits(['switchToLogin'])

// Store d'authentification
const authStore = useAuthStore()
const { register } = authStore
const { isRegisterLoading } = storeToRefs(authStore)

// État du formulaire
const form = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: ''
})

const acceptTerms = ref(false)
const showPassword = ref(false)
const error = ref('')
const successMessage = ref('')

// Erreurs de validation
const errors = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  acceptTerms: ''
})

// Validation du formulaire
const isFormValid = computed(() => {
  return form.email.length > 0 && 
         form.password.length >= 8 && 
         form.firstName.length > 0 &&
         form.lastName.length > 0 &&
         acceptTerms.value &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
})

// Force du mot de passe
const passwordStrength = computed(() => {
  if (!form.password) return 0
  
  let strength = 0
  if (form.password.length >= 8) strength += 25
  if (/[A-Z]/.test(form.password)) strength += 25
  if (/[a-z]/.test(form.password)) strength += 25
  if (/[0-9]/.test(form.password)) strength += 25
  
  return strength
})

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 50) return 'bg-red-500'
  if (passwordStrength.value < 75) return 'bg-yellow-500'
  return 'bg-green-500'
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 50) return 'Faible'
  if (passwordStrength.value < 75) return 'Moyen'
  return 'Fort'
})

const passwordStrengthTextColor = computed(() => {
  if (passwordStrength.value < 50) return 'text-red-600'
  if (passwordStrength.value < 75) return 'text-yellow-600'
  return 'text-green-600'
})

// Validation en temps réel
watch(() => form.email, (newEmail) => {
  errors.email = ''
  if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    errors.email = 'Format d\'email invalide'
  }
})

watch(() => form.password, (newPassword) => {
  errors.password = ''
  if (newPassword && newPassword.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
  }
})

watch(() => form.firstName, (newFirstName) => {
  errors.firstName = ''
  if (newFirstName && newFirstName.length < 2) {
    errors.firstName = 'Le prénom doit contenir au moins 2 caractères'
  }
})

watch(() => form.lastName, (newLastName) => {
  errors.lastName = ''
  if (newLastName && newLastName.length < 2) {
    errors.lastName = 'Le nom doit contenir au moins 2 caractères'
  }
})

watch(() => acceptTerms.value, (newAcceptTerms) => {
  errors.acceptTerms = ''
  if (!newAcceptTerms) {
    errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation'
  }
})

// Gestion de la soumission du formulaire
const handleRegister = async () => {
  error.value = ''
  successMessage.value = ''
  
  // Reset des erreurs
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  // Validation côté client
  if (!acceptTerms.value) {
    errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation'
    return
  }

  try {
    const result = await register(form)
    
    if (result.success) {
      successMessage.value = result.message || 'Compte créé avec succès !'
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 2000)
    } else {
      error.value = result.error || 'Erreur lors de la création du compte'
    }
  } catch (err) {
    console.error('Erreur d\'inscription:', err)
    
    if (err.statusCode === 409) {
      error.value = 'Un compte avec cet email existe déjà'
    } else if (err.statusCode === 422) {
      error.value = 'Données invalides. Veuillez vérifier vos informations.'
    } else {
      error.value = 'Une erreur est survenue lors de la création du compte'
    }
  }
}
</script>