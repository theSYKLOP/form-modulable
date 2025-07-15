<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    

    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <!-- Indicateur de chargement -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600 font-medium">Chargement des statistiques...</p>
        </div>
      </div>

      <!-- Contenu principal -->
      <div v-else class="space-y-8">
        <!-- Cards statistiques avec animations -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
            <div class="p-8">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Utilisateurs</p>
                  <p class="text-4xl font-bold text-gray-900 mt-3">{{ formatNumber(dashboardData.stats.users.total) }}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Icon name="heroicons:users" class="w-8 h-8 text-white" />
                </div>
              </div>
              <div class="mt-6 flex items-center">
                <div class="flex items-center">
                  <Icon 
                    :name="dashboardData.stats.users.growth >= 0 ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'" 
                    :class="dashboardData.stats.users.growth >= 0 ? 'text-green-500' : 'text-red-500'"
                    class="w-5 h-5 mr-2"
                  />
                  <span :class="dashboardData.stats.users.growth >= 0 ? 'text-green-600' : 'text-red-600'" class="text-base font-semibold">
                    {{ Math.abs(dashboardData.stats.users.growth) }}%
                  </span>
                </div>
                <span class="text-sm text-gray-500 ml-2">ce mois</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
            <div class="p-8">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Formulaires</p>
                  <p class="text-4xl font-bold text-gray-900 mt-3">{{ formatNumber(dashboardData.stats.forms.total) }}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Icon name="heroicons:document-text" class="w-8 h-8 text-white" />
                </div>
              </div>
              <div class="mt-6 flex items-center">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-base text-green-600 font-semibold">{{ dashboardData.stats.forms.published }}</span>
                </div>
                <span class="text-sm text-gray-500 ml-2">publiés</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
            <div class="p-8">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Soumissions</p>
                  <p class="text-4xl font-bold text-gray-900 mt-3">{{ formatNumber(dashboardData.stats.submissions.total) }}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Icon name="heroicons:paper-airplane" class="w-8 h-8 text-white" />
                </div>
              </div>
              <div class="mt-6 flex items-center">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                  <span class="text-base text-purple-600 font-semibold">{{ dashboardData.stats.submissions.today }}</span>
                </div>
                <span class="text-sm text-gray-500 ml-2">aujourd'hui</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
            <div class="p-8">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Taux de réussite</p>
                  <p class="text-4xl font-bold text-gray-900 mt-3">{{ dashboardData.stats.successRate }}%</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Icon name="heroicons:chart-bar" class="w-8 h-8 text-white" />
                </div>
              </div>
              <div class="mt-6 flex items-center">
                <div :class="getSuccessRateColor(dashboardData.stats.successRate)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ getSuccessRateText(dashboardData.stats.successRate) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Graphiques avec meilleur design -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Graphique des inscriptions -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="p-8 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">Inscriptions</h3>
                  <p class="text-sm text-gray-600 mt-1">Évolution des inscriptions sur 6 mois</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:chart-bar" class="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div class="p-8">
              <AdminLineChart 
                v-if="dashboardData.chartData.registrations.length > 0" 
                :data="dashboardData.chartData.registrations" 
                color="#3b82f6"
                class="h-96"
              />
              <div v-else class="h-96 flex flex-col items-center justify-center text-gray-500">
                <Icon name="heroicons:chart-bar" class="w-16 h-16 mb-4 text-gray-300" />
                <p class="text-base font-medium">Pas de données disponibles</p>
                <p class="text-sm text-gray-400 mt-2">Les données apparaîtront une fois que vous aurez des utilisateurs</p>
              </div>
            </div>
          </div>

          <!-- Graphique des soumissions -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="p-8 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">Soumissions</h3>
                  <p class="text-sm text-gray-600 mt-1">Activité des soumissions sur 7 jours</p>
                </div>
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:paper-airplane" class="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div class="p-8">
              <AdminBarChart 
                v-if="dashboardData.chartData.submissions.length > 0" 
                :data="dashboardData.chartData.submissions" 
                color="#10b981"
                class="h-96"
              />
              <div v-else class="h-96 flex flex-col items-center justify-center text-gray-500">
                <Icon name="heroicons:paper-airplane" class="w-16 h-16 mb-4 text-gray-300" />
                <p class="text-base font-medium">Pas de données disponibles</p>
                <p class="text-sm text-gray-400 mt-2">Les données apparaîtront une fois que vous aurez des soumissions</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Activité récente avec design amélioré -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Derniers utilisateurs -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="p-8 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">Derniers utilisateurs</h3>
                  <p class="text-sm text-gray-600 mt-1">Nouveaux membres récents</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:users" class="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div class="divide-y divide-gray-100">
              <div 
                v-for="user in dashboardData.recentActivity.users" 
                :key="user.id"
                class="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <span class="text-base font-semibold text-white">
                      {{ user.firstName?.charAt(0) || 'U' }}{{ user.lastName?.charAt(0) || '' }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-base font-semibold text-gray-900 truncate">
                      {{ user.firstName || 'Utilisateur' }} {{ user.lastName || '' }}
                    </p>
                    <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
                  </div>
                  <div class="text-sm text-gray-400 whitespace-nowrap">
                    {{ formatDate(user.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="p-6 bg-gray-50 rounded-b-xl">
              <NuxtLink 
                to="/admin/users" 
                class="inline-flex items-center text-base text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Voir tous les utilisateurs
                <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-2" />
              </NuxtLink>
            </div>
          </div>

          <!-- Dernières soumissions -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="p-8 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">Dernières soumissions</h3>
                  <p class="text-sm text-gray-600 mt-1">Activité récente des formulaires</p>
                </div>
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:paper-airplane" class="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div class="divide-y divide-gray-100">
              <div 
                v-for="submission in dashboardData.recentActivity.submissions" 
                :key="submission.id"
                class="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <Icon name="heroicons:document-check" class="w-7 h-7 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-base font-semibold text-gray-900 truncate">
                      {{ submission.formTitle }}
                    </p>
                    <p class="text-sm text-gray-500 truncate">
                      par {{ submission.userEmail }}
                    </p>
                  </div>
                  <div class="text-sm text-gray-400 whitespace-nowrap">
                    {{ formatDate(submission.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="p-6 bg-gray-50 rounded-b-xl">
              <NuxtLink 
                to="/admin/submissions" 
                class="inline-flex items-center text-base text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Voir toutes les soumissions
                <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-2" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Layout admin
definePageMeta({
  layout: 'admin'
})

// Meta données
useHead({
  title: 'Administration - Form Modulable',
  meta: [
    { name: 'description', content: 'Interface d\'administration Form Modulable' }
  ]
})

// États réactifs
const loading = ref(true)
const dashboardData = ref({
  stats: {
    users: { total: 0, growth: 0 },
    forms: { total: 0, published: 0 },
    submissions: { total: 0, today: 0 },
    successRate: 0
  },
  chartData: {
    registrations: [],
    submissions: []
  },
  recentActivity: {
    users: [],
    submissions: []
  }
})

// Fonction pour formater les dates
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'À l\'instant'
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `Il y a ${diffInDays}j`
  }
}

// Charger les données du dashboard
const loadDashboardData = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/admin/dashboard')
    dashboardData.value = response
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error)
    // Optionnel : toast d'erreur
  } finally {
    loading.value = false
  }
}

// Charger les données au montage
onMounted(loadDashboardData)

// Actualiser les données toutes les 5 minutes
const { pause } = useIntervalFn(loadDashboardData, 300000)

// Arrêter l'actualisation au démontage
onUnmounted(() => {
  pause()
})

// Nouvelles fonctions utilitaires
const formatNumber = (num) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

const getSuccessRateColor = (rate) => {
  if (rate >= 80) return 'bg-green-100 text-green-800'
  if (rate >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getSuccessRateText = (rate) => {
  if (rate >= 80) return 'Excellent'
  if (rate >= 60) return 'Bon'
  return 'À améliorer'
}
</script>