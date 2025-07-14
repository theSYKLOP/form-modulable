<script setup>
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = usePrismaClient().$extends(withAccelerate());

// Récupérer tous les templates avec leurs relations
const templates = await prisma.formTemplate.findMany({
  select: {
    id: true,
    title: true,
    description: true,
    category: true,
    tags: true,
    industry: true,
    useCase: true,
    difficulty: true,
    estimatedTime: true,
    isPublic: true,
    isFeatured: true,
    isVerified: true,
    usageCount: true,
    createdAt: true,
    updatedAt: true,
    publishedAt: true,
    authorName: true,
    author: {
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true
      }
    },
    _count: {
      select: {
        forms: true,
        reviews: true,
        favorites: true
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
    day: 'numeric'
  });
};

// Fonction pour obtenir le nom de l'auteur
const getAuthorName = (template) => {
  if (template.authorName) return template.authorName;
  if (template.author) {
    if (template.author.firstName && template.author.lastName) {
      return `${template.author.firstName} ${template.author.lastName}`;
    }
    return template.author.username || template.author.email;
  }
  return 'Anonyme';
};

// Fonction pour obtenir le label de la catégorie
const getCategoryLabel = (category) => {
  const categories = {
    'CONTACT': 'Contact',
    'REGISTRATION': 'Inscription',
    'SURVEY': 'Enquête',
    'ORDER': 'Commande',
    'FEEDBACK': 'Retour',
    'BOOKING': 'Réservation',
    'APPLICATION': 'Candidature',
    'LEAD_GENERATION': 'Génération de leads',
    'EVENT': 'Événement',
    'SUPPORT': 'Support',
    'OTHER': 'Autre'
  };
  return categories[category] || category;
};

// Fonction pour obtenir le label de difficulté
const getDifficultyLabel = (difficulty) => {
  const difficulties = {
    'BEGINNER': 'Débutant',
    'INTERMEDIATE': 'Intermédiaire',
    'ADVANCED': 'Avancé'
  };
  return difficulties[difficulty] || difficulty;
};

// Fonction pour obtenir la couleur de difficulté
const getDifficultyColor = (difficulty) => {
  const colors = {
    'BEGINNER': 'bg-green-100 text-green-800',
    'INTERMEDIATE': 'bg-yellow-100 text-yellow-800',
    'ADVANCED': 'bg-red-100 text-red-800'
  };
  return colors[difficulty] || 'bg-gray-100 text-gray-800';
};
</script>

<template>
  <div class="space-y-6">
    <!-- Statistiques -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Statistiques des Templates</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ templates.length }}</div>
          <div class="text-sm text-blue-800">Total</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">
            {{ templates.filter(t => t.isPublic).length }}
          </div>
          <div class="text-sm text-green-800">Publics</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">
            {{ templates.filter(t => t.isFeatured).length }}
          </div>
          <div class="text-sm text-purple-800">En vedette</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-orange-600">
            {{ templates.reduce((sum, t) => sum + t.usageCount, 0) }}
          </div>
          <div class="text-sm text-orange-800">Utilisations</div>
        </div>
      </div>
    </div>

    <!-- Liste des templates -->
    <div class="bg-white rounded-lg shadow-md">
      <div class="p-6 border-b">
        <h2 class="text-xl font-semibold">Liste des Templates</h2>
      </div>
      
      <div v-if="templates.length === 0" class="p-6 text-center text-gray-500">
        <p>Aucun template trouvé dans la base de données.</p>
        <p class="mt-2 text-sm">Utilisez Prisma Studio pour ajouter des templates de test.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <div v-for="template in templates" :key="template.id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <!-- En-tête du template -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="font-semibold text-lg text-gray-900">{{ template.title }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ template.description || 'Pas de description' }}</p>
            </div>
            <div class="flex flex-col items-end space-y-1">
              <span v-if="template.isVerified" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Vérifié
              </span>
              <span v-if="template.isFeatured" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Vedette
              </span>
            </div>
          </div>

          <!-- Informations du template -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Catégorie:</span>
              <span class="font-medium">{{ getCategoryLabel(template.category) }}</span>
            </div>
            
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Difficulté:</span>
              <span :class="getDifficultyColor(template.difficulty)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ getDifficultyLabel(template.difficulty) }}
              </span>
            </div>
            
            <div v-if="template.estimatedTime" class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Temps estimé:</span>
              <span class="font-medium">{{ template.estimatedTime }} min</span>
            </div>
            
            <div v-if="template.industry" class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Secteur:</span>
              <span class="font-medium">{{ template.industry }}</span>
            </div>
            
            <div v-if="template.useCase" class="flex items-center justify-between text-sm">
              <span class="text-gray-500">Usage:</span>
              <span class="font-medium">{{ template.useCase }}</span>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="template.tags && template.tags.length > 0" class="mb-4">
            <div class="flex flex-wrap gap-1">
              <span v-for="tag in template.tags" :key="tag" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="border-t pt-3">
            <div class="flex justify-between items-center text-sm text-gray-500">
              <div class="flex space-x-4">
                <span>{{ template.usageCount }} utilisations</span>
                <span>{{ template._count.forms }} formulaires</span>
                <span>{{ template._count.reviews }} avis</span>
                <span>{{ template._count.favorites }} favoris</span>
              </div>
            </div>
            <div class="mt-2 flex justify-between items-center text-xs text-gray-400">
              <span>Par {{ getAuthorName(template) }}</span>
              <span>{{ formatDate(template.createdAt) }}</span>
            </div>
          </div>

          <!-- Statut -->
          <div class="mt-3 flex justify-between items-center">
            <span v-if="template.isPublic" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Public
            </span>
            <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Privé
            </span>
            <span v-if="template.publishedAt" class="text-xs text-green-600">
              Publié: {{ formatDate(template.publishedAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
