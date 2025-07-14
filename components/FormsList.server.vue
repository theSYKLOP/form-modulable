<script setup>
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = usePrismaClient().$extends(withAccelerate());

// Récupérer tous les formulaires avec leurs relations
const forms = await prisma.form.findMany({
  select: {
    id: true,
    title: true,
    description: true,
    mode: true,
    layout: true,
    isPublished: true,
    isTemplate: true,
    createdAt: true,
    updatedAt: true,
    publishedAt: true,
    user: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true
      }
    },
    template: {
      select: {
        id: true,
        title: true,
        category: true
      }
    },
    _count: {
      select: {
        submissions: true
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

// Fonction pour obtenir le nom de l'utilisateur
const getUserName = (user) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || user.email;
};

// Fonction pour obtenir le label du mode
const getModeLabel = (mode) => {
  const modes = {
    'VIEW': 'Lecture',
    'EDIT': 'Édition',
    'CREATE': 'Création',
    'PREVIEW': 'Aperçu'
  };
  return modes[mode] || mode;
};

// Fonction pour obtenir le label du layout
const getLayoutLabel = (layout) => {
  const layouts = {
    'VERTICAL': 'Vertical',
    'HORIZONTAL': 'Horizontal',
    'INLINE': 'En ligne'
  };
  return layouts[layout] || layout;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Statistiques -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Statistiques des Formulaires</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ forms.length }}</div>
          <div class="text-sm text-blue-800">Total</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">
            {{ forms.filter(f => f.isPublished).length }}
          </div>
          <div class="text-sm text-green-800">Publiés</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">
            {{ forms.filter(f => f.isTemplate).length }}
          </div>
          <div class="text-sm text-purple-800">Templates</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-orange-600">
            {{ forms.reduce((sum, f) => sum + f._count.submissions, 0) }}
          </div>
          <div class="text-sm text-orange-800">Soumissions</div>
        </div>
      </div>
    </div>

    <!-- Liste des formulaires -->
    <div class="bg-white rounded-lg shadow-md">
      <div class="p-6 border-b">
        <h2 class="text-xl font-semibold">Liste des Formulaires</h2>
      </div>
      
      <div v-if="forms.length === 0" class="p-6 text-center text-gray-500">
        <p>Aucun formulaire trouvé dans la base de données.</p>
        <p class="mt-2 text-sm">Utilisez Prisma Studio pour ajouter des formulaires de test.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Formulaire
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Créateur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Configuration
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Soumissions
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Créé le
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="form in forms" :key="form.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ form.title }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ form.description || 'Pas de description' }}
                  </div>
                  <div v-if="form.template" class="text-xs text-purple-600 mt-1">
                    Template: {{ form.template.title }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getUserName(form.user) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="space-y-1">
                  <div>Mode: {{ getModeLabel(form.mode) }}</div>
                  <div>Layout: {{ getLayoutLabel(form.layout) }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span v-if="form.isPublished" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Publié
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Brouillon
                  </span>
                  <span v-if="form.isTemplate" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Template
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="text-center">
                  <div class="text-lg font-semibold">{{ form._count.submissions }}</div>
                  <div class="text-xs text-gray-500">réponses</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{{ formatDate(form.createdAt) }}</div>
                <div v-if="form.publishedAt" class="text-xs text-green-600">
                  Publié: {{ formatDate(form.publishedAt) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
