# Gestion des API d'Étapes - Documentation

## Vue d'ensemble

Cette fonctionnalité permet d'ajouter des validations API personnalisées à chaque étape d'un formulaire multi-étapes. Les étapes peuvent maintenant être configurées pour envoyer des données à une API externe et valider les réponses avant de permettre à l'utilisateur de continuer.

## Configuration d'une Étape avec API

### Propriétés de Configuration

```typescript
interface StepApiConfig {
  enabled: boolean                    // Active/désactive la validation API
  endpoint: string                   // URL de l'API à appeler
  method: 'POST'                     // Méthode HTTP (toujours POST)
  headers?: Record<string, string>   // Headers personnalisés
  params?: Record<string, any>       // Paramètres additionnels
  fieldsToSend: string[]            // IDs des champs à envoyer
  validationRequired?: boolean       // Si true, bloque la progression sans succès API
  successMessage?: string           // Message affiché en cas de succès
  errorMessage?: string             // Message affiché en cas d'erreur
}
```

### Exemple de Configuration

```javascript
const stepConfig = {
  id: 'step-1',
  title: 'Vérification Email',
  description: 'Vérifiez votre adresse email',
  fields: [
    {
      id: 'email-field',
      name: 'email',
      type: 'email',
      label: 'Adresse Email',
      required: true
    }
  ],
  apiConfig: {
    enabled: true,
    endpoint: 'https://api.exemple.com/verify-email',
    fieldsToSend: ['email-field'],
    validationRequired: true,
    successMessage: 'Email vérifié avec succès !',
    errorMessage: 'Impossible de vérifier cet email',
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN',
      'X-Custom-Header': 'custom-value'
    }
  }
}
```

## Format de Réponse API Attendu

Votre API externe doit retourner une réponse au format JSON :

### Succès
```json
{
  "success": true,
  "message": "Validation réussie",
  "data": {
    // Données optionnelles
  }
}
```

### Erreur
```json
{
  "success": false,
  "message": "Email déjà utilisé",
  "error": "DUPLICATE_EMAIL"
}
```

## Utilisation dans l'Interface

### 1. Configuration via le Modal d'Étape

1. Cliquez sur l'icône d'édition d'une étape
2. Activez "Activer la vérification API pour cette étape"
3. Configurez l'URL de l'API
4. Sélectionnez les champs à envoyer
5. Définissez si la validation est obligatoire
6. Personnalisez les messages de succès/erreur

### 2. Indicateurs Visuels

- **Icône verte** : Étape avec API optionnelle
- **Icône orange** : Étape avec API obligatoire
- **Messages de validation** : Affichés en temps réel lors de la validation

### 3. Comportement de Navigation

- **API optionnelle** : L'utilisateur peut continuer même en cas d'échec
- **API obligatoire** : L'utilisateur doit valider avec succès pour continuer
- **Validation automatique** : Tentative de validation automatique lors du clic "Suivant"

## Exemples d'API de Validation

### Validation d'Email
```bash
POST https://api.exemple.com/verify-email
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Vérification de Disponibilité
```bash
POST https://api.exemple.com/check-availability
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com"
}
```

### Validation de Code
```bash
POST https://api.exemple.com/verify-code
Content-Type: application/json

{
  "phone": "+33123456789",
  "code": "123456"
}
```

## Sécurité

### Recommandations

1. **Authentification** : Utilisez des tokens d'API dans les headers
2. **HTTPS** : Toujours utiliser HTTPS pour les appels API
3. **Rate Limiting** : Implémentez des limites de taux côté API
4. **Validation** : Validez toujours les données côté serveur
5. **Logs** : Enregistrez les tentatives de validation pour audit

### Gestion des Erreurs

```typescript
// L'API peut retourner différents codes d'erreur
switch (error.statusCode) {
  case 400: // Données invalides
  case 422: // Validation échouée
  case 429: // Trop de requêtes
  case 500: // Erreur serveur
}
```

## Développement et Tests

### Test d'une API d'Étape

```javascript
// Exemple de fonction de test
const testStepApi = async () => {
  const config = {
    enabled: true,
    endpoint: 'https://httpbin.org/post',
    fieldsToSend: ['test-field'],
    validationRequired: false
  }
  
  const formData = {
    'test-field': 'valeur-test'
  }
  
  const result = await validateStepWithApi(config, formData, fields)
  console.log('Résultat:', result)
}
```

### API de Test (httpbin.org)

Pour tester la fonctionnalité, vous pouvez utiliser httpbin.org :

```
URL: https://httpbin.org/post
Retourne: Écho des données envoyées
```

## Intégration avec des Services Populaires

### SendGrid (Validation Email)
```
Endpoint: https://api.sendgrid.com/v3/mail/send
Headers: Authorization: Bearer SG.YOUR_API_KEY
```

### Twilio (Vérification SMS)
```
Endpoint: https://verify.twilio.com/v2/Services/YOUR_SERVICE_SID/Verifications
Headers: Authorization: Basic [base64(account_sid:auth_token)]
```

### Auth0 (Validation Utilisateur)
```
Endpoint: https://YOUR_DOMAIN.auth0.com/userinfo
Headers: Authorization: Bearer YOUR_ACCESS_TOKEN
```

Cette fonctionnalité offre une flexibilité maximale pour intégrer des validations métier complexes directement dans le processus de formulaire multi-étapes.
