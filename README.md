# Form Modulable - Projet Nuxt avec Prisma

Ce projet est une application Nuxt 3 intégrée avec Prisma ORM pour la gestion de formulaires modulaires.

## 🚀 Fonctionnalités

- **Gestion des utilisateurs** avec authentification complète
- **Formulaires dynamiques** avec configuration flexible
- **Système de templates** avec catégorisation et partage
- **Gestion des abonnements** avec différents plans
- **API avec limitation de débit** et gestion des clés
- **Système de révision** pour les templates
- **Base de données PostgreSQL** avec Prisma ORM

## 📦 Installation

1. **Cloner le projet et installer les dépendances :**
```bash
npm install
```

2. **Configurer Prisma Postgres :**
   - Créer un compte sur [Prisma Data Platform](https://console.prisma.io)
   - Créer une nouvelle base de données Prisma Postgres
   - Copier l'URL de connexion dans le fichier `.env`

3. **Configurer les variables d'environnement :**
```bash
# Remplacer dans .env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=VOTRE_API_KEY"
```

4. **Exécuter les migrations :**
```bash
npx prisma migrate dev --name init
```

5. **Générer le client Prisma :**
```bash
npx prisma generate
```

## 🔧 Commandes disponibles

### Développement
```bash
# Démarrer le serveur de développement
npm run dev

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev

# Ouvrir Prisma Studio
npx prisma studio

# Réinitialiser la base de données
npx prisma migrate reset
```

### Production
```bash
# Construire l'application
npm run build

# Prévisualiser en production
npm run preview
```

## 📊 Structure de la base de données

### Modèles principaux

- **User** : Gestion des utilisateurs avec authentification
- **Form** : Formulaires avec configuration JSON flexible
- **FormTemplate** : Templates de formulaires avec catégorisation
- **FormSubmission** : Soumissions de formulaires
- **Subscription** : Gestion des abonnements
- **ApiKey** : Clés API avec permissions
- **ApiLog** : Logs des appels API

### Fonctionnalités d'authentification

- **PasswordReset** : Réinitialisation de mot de passe
- **EmailVerification** : Vérification d'email

### Système de templates

- **TemplateReview** : Avis sur les templates
- **TemplateFavorite** : Favoris des utilisateurs

## 🎨 Interface utilisateur

Le projet comprend plusieurs pages :

- **Dashboard** (`/`) : Vue d'ensemble avec test de connexion Prisma
- **Utilisateurs** (`/users`) : Gestion des utilisateurs
- **Formulaires** (`/forms`) : Gestion des formulaires
- **Templates** (`/templates`) : Gestion des templates

## 🔍 Composants serveur

- **PrismaTest.server.vue** : Test de connexion à la base de données
- **UsersList.server.vue** : Liste des utilisateurs avec statistiques
- **FormsList.server.vue** : Liste des formulaires avec détails
- **TemplatesList.server.vue** : Liste des templates avec catégorisation

## 🚀 Déploiement

### Prérequis pour le déploiement

1. **Compte Vercel** configuré
2. **Base de données Prisma Postgres** en production
3. **Variables d'environnement** configurées

### Étapes de déploiement

1. **Pousser le code sur GitHub**
2. **Connecter le projet à Vercel**
3. **Configurer les variables d'environnement :**
   - `DATABASE_URL` : URL de votre base Prisma Postgres
4. **Déployer** via Vercel

## 📚 Documentation

- [Nuxt 3](https://nuxt.com/)
- [Prisma ORM](https://prisma.io/)
- [Prisma Nuxt Module](https://prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nuxt-prisma-guide)
- [Tailwind CSS](https://tailwindcss.com/)

## 🛠️ Développement

### Ajout de nouveaux modèles

1. Modifier le fichier `prisma/schema.prisma`
2. Créer une nouvelle migration : `npx prisma migrate dev --name nom_migration`
3. Générer le client : `npx prisma generate`

### Création de nouveaux composants serveur

Les composants serveur (`.server.vue`) permettent d'exécuter du code côté serveur avec accès à Prisma :

```vue
<script setup>
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = usePrismaClient().$extends(withAccelerate());

// Votre code Prisma ici
const data = await prisma.model.findMany();
</script>
```

## 🔐 Sécurité

- Authentification par email/mot de passe
- Vérification d'email
- Limitation de débit pour l'API
- Permissions granulaires pour les clés API
- Validation des données d'entrée

## 📈 Monitoring

- Logs des appels API
- Statistiques d'utilisation
- Métriques de performance
- Suivi des erreurs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.
