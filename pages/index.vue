<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">Form Modulable - Dashboard</h1>
    
    <!-- Navigation -->
    <div class="mb-8">
      <nav class="flex space-x-4">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">Accueil</NuxtLink>
        <NuxtLink to="/users" class="text-blue-600 hover:text-blue-800">Utilisateurs</NuxtLink>
        <NuxtLink to="/forms" class="text-blue-600 hover:text-blue-800">Formulaires</NuxtLink>
        <NuxtLink to="/templates" class="text-blue-600 hover:text-blue-800">Templates</NuxtLink>
      </nav>
    </div>

    <!-- Test de connexion -->
    <NuxtIsland name="PrismaTest" />

    <!-- Informations sur le projet -->
    <div class="mt-8 bg-gray-50 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">Informations sur le projet</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="font-medium text-gray-700">Modèles Prisma configurés :</h3>
          <ul class="list-disc list-inside mt-2 text-sm text-gray-600">
            <li>User (Utilisateurs)</li>
            <li>Form (Formulaires)</li>
            <li>FormTemplate (Templates)</li>
            <li>FormSubmission (Soumissions)</li>
            <li>Subscription (Abonnements)</li>
            <li>ApiKey (Clés API)</li>
            <li>Et plus...</li>
          </ul>
        </div>
        <div>
          <h3 class="font-medium text-gray-700">Fonctionnalités :</h3>
          <ul class="list-disc list-inside mt-2 text-sm text-gray-600">
            <li>Authentification complète</li>
            <li>Gestion des formulaires</li>
            <li>Système de templates</li>
            <li>Gestion des abonnements</li>
            <li>API avec limitation de débit</li>
            <li>Système de révision</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Prochaines étapes -->
    <div class="mt-8 bg-blue-50 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-4 text-blue-800">Prochaines étapes</h2>
      <ol class="list-decimal list-inside space-y-2 text-sm text-blue-700">
        <li>Créer une instance Prisma Postgres sur <a href="https://console.prisma.io" class="underline font-medium">console.prisma.io</a></li>
        <li>Remplacer l'URL de la base de données dans le fichier <code class="bg-blue-100 px-1 rounded">.env</code></li>
        <li>Exécuter les migrations avec <code class="bg-blue-100 px-1 rounded">npx prisma migrate dev --name init</code></li>
        <li>Tester la connexion en démarrant le serveur de développement</li>
        <li>Utiliser Prisma Studio pour ajouter des données de test</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
// Méta-données de la page
useHead({
  title: 'Form Modulable - Dashboard',
  meta: [
    { name: 'description', content: 'Dashboard principal de Form Modulable avec intégration Prisma' }
  ]
})
</script>
