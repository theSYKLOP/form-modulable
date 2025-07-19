# APIs de Test pour la Validation des Étapes

## 1. API de Test Simple (httpbin.org)

### Endpoint de Test Universel
```
URL: https://httpbin.org/post
Méthode: POST
Headers: Content-Type: application/json
```

Cette API retourne un écho de toutes les données envoyées, parfait pour tester la fonctionnalité.

**Réponse exemple :**
```json
{
  "json": {
    "email": "test@example.com",
    "name": "John Doe"
  },
  "url": "https://httpbin.org/post",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

## 2. API de Test avec Validation Simulée

### JSONPlaceholder (Simulation)
```
URL: https://jsonplaceholder.typicode.com/posts
Méthode: POST
```

**Réponse exemple :**
```json
{
  "id": 101,
  "title": "test",
  "body": "test content",
  "userId": 1
}
```

## 3. Webhook.site (Test en Temps Réel)

1. Allez sur https://webhook.site
2. Copiez l'URL unique générée
3. Utilisez cette URL comme endpoint d'API
4. Vous verrez en temps réel les données envoyées

## 4. Exemples de Configuration d'Étapes

### Validation d'Email
```json
{
  "enabled": true,
  "endpoint": "https://httpbin.org/post",
  "fieldsToSend": ["email"],
  "validationRequired": true,
  "successMessage": "Email vérifié avec succès !",
  "errorMessage": "Email invalide ou déjà utilisé",
  "headers": {
    "X-API-Key": "test-key-123"
  }
}
```

### Vérification de Disponibilité
```json
{
  "enabled": true,
  "endpoint": "https://httpbin.org/post",
  "fieldsToSend": ["username", "email"],
  "validationRequired": false,
  "successMessage": "Nom d'utilisateur disponible",
  "errorMessage": "Nom d'utilisateur déjà pris"
}
```

### Validation de Code de Vérification
```json
{
  "enabled": true,
  "endpoint": "https://httpbin.org/post",
  "fieldsToSend": ["phone", "verification_code"],
  "validationRequired": true,
  "successMessage": "Code vérifié avec succès",
  "errorMessage": "Code de vérification incorrect"
}
```

## 5. Simulation d'Erreurs

Pour tester la gestion d'erreurs, vous pouvez utiliser :

### httpstat.us (Codes d'erreur)
```
URL: https://httpstat.us/400  (pour une erreur 400)
URL: https://httpstat.us/422  (pour une erreur de validation)
URL: https://httpstat.us/500  (pour une erreur serveur)
```

## 6. Test Complet - Scénario Réel

### Étape 1: Informations Personnelles
- Champs: nom, email
- API: Validation d'email avec httpbin.org
- Validation requise: Oui

### Étape 2: Vérification
- Champs: code_verification
- API: Vérification du code
- Validation requise: Oui

### Étape 3: Finalisation
- Champs: conditions_acceptees
- API: Aucune
- Soumission finale

## 7. Configuration Recommandée pour les Tests

```javascript
const testFormConfig = {
  id: "test-form",
  title: "Formulaire de Test API",
  steps: [
    {
      id: "step-1",
      title: "Validation Email",
      fields: [
        {
          id: "email-field",
          name: "email",
          type: "email",
          label: "Adresse Email",
          required: true
        }
      ],
      apiConfig: {
        enabled: true,
        endpoint: "https://httpbin.org/post",
        fieldsToSend: ["email-field"],
        validationRequired: true,
        successMessage: "Email vérifié !",
        errorMessage: "Erreur de validation email"
      }
    }
  ]
}
```

Utilisez ces exemples pour tester toutes les fonctionnalités de validation API des étapes !
