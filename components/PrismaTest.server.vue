<script setup>
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = usePrismaClient().$extends(withAccelerate());

// Test de connexion - récupérer le premier utilisateur
const user = await prisma.user.findFirst();
</script>

<template>
  <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h2 class="text-lg font-semibold text-blue-800 mb-2">Test de connexion Prisma</h2>
    <p class="text-blue-700">
      {{ user?.firstName && user?.lastName 
         ? `Utilisateur trouvé: ${user.firstName} ${user.lastName}` 
         : user?.email 
         ? `Utilisateur trouvé: ${user.email}` 
         : "Aucun utilisateur trouvé dans la base de données." }}
    </p>
  </div>
</template>
