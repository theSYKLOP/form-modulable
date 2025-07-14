<script setup>
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = usePrismaClient().$extends(withAccelerate());

// Récupérer tous les utilisateurs
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    username: true,
    firstName: true,
    lastName: true,
    createdAt: true,
    emailVerified: true,
    lastLoginAt: true,
    _count: {
      select: {
        forms: true,
        formSubmissions: true,
        formTemplates: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});

// Fonction pour formater les dates
const formatDate = (date) => {
  if (!date) return 'Non défini';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fonction pour obtenir le nom complet
const getFullName = (user) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || user.email;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Statistiques -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Statistiques</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ users.length }}</div>
          <div class="text-sm text-blue-800">Utilisateurs total</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">
            {{ users.filter(u => u.emailVerified).length }}
          </div>
          <div class="text-sm text-green-800">Email vérifié</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">
            {{ users.filter(u => u.lastLoginAt).length }}
          </div>
          <div class="text-sm text-purple-800">Se sont connectés</div>
        </div>
      </div>
    </div>

    <!-- Liste des utilisateurs -->
    <div class="bg-white rounded-lg shadow-md">
      <div class="p-6 border-b">
        <h2 class="text-xl font-semibold">Liste des Utilisateurs</h2>
      </div>
      
      <div v-if="users.length === 0" class="p-6 text-center text-gray-500">
        <p>Aucun utilisateur trouvé dans la base de données.</p>
        <p class="mt-2 text-sm">Utilisez Prisma Studio pour ajouter des utilisateurs de test.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activité
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Créé le
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ getFullName(user).charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getFullName(user) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.username || 'Pas de nom d\'utilisateur' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="user.emailVerified" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Vérifié
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Non vérifié
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="space-y-1">
                  <div>{{ user._count.forms }} formulaires</div>
                  <div>{{ user._count.formSubmissions }} soumissions</div>
                  <div>{{ user._count.formTemplates }} templates</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
