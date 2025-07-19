import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer les plans d'abonnement
  const freePlan = await prisma.subscription.upsert({
    where: { id: 'free-plan' },
    update: {},
    create: {
      id: 'free-plan',
      name: 'Gratuit',
      description: 'Plan gratuit avec fonctionnalités de base',
      maxForms: 3,
      maxFormSubmissions: 100,
      maxApiCalls: 1000,
      maxStorageMB: 50,
      maxTemplates: 1,
      hasAdvancedFields: false,
      hasApiIntegration: false,
      hasCustomBranding: false,
      hasAnalytics: false,
      hasWebhooks: false,
      hasPrivateTemplates: false,
      hasTemplateSharing: false,
      priceMonthly: 0,
      priceYearly: 0,
      isActive: true
    }
  })

  const proPlan = await prisma.subscription.upsert({
    where: { id: 'pro-plan' },
    update: {},
    create: {
      id: 'pro-plan',
      name: 'Pro',
      description: 'Plan professionnel avec toutes les fonctionnalités',
      maxForms: 50,
      maxFormSubmissions: 10000,
      maxApiCalls: 50000,
      maxStorageMB: 1000,
      maxTemplates: 20,
      hasAdvancedFields: true,
      hasApiIntegration: true,
      hasCustomBranding: true,
      hasAnalytics: true,
      hasWebhooks: true,
      hasPrivateTemplates: true,
      hasTemplateSharing: true,
      priceMonthly: 29.99,
      priceYearly: 299.99,
      isActive: true
    }
  })

  // Créer un utilisateur admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      role: 'ADMIN', // ✅ Nouveau: définir le rôle admin
      emailVerified: new Date()
    }
  })

  // Créer l'abonnement admin
  await prisma.userSubscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      subscriptionId: proPlan.id,
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      startDate: new Date(),
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    }
  })

  // Créer des utilisateurs de test
  const userPassword = await bcrypt.hash('password123', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      role: 'USER', // ✅ Nouveau: définir le rôle utilisateur (par défaut)
      emailVerified: new Date()
    }
  })

  // Créer un utilisateur modérateur
  const moderatorPassword = await bcrypt.hash('moderator123', 12)
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@example.com' },
    update: {},
    create: {
      email: 'moderator@example.com',
      password: moderatorPassword,
      firstName: 'Jane',
      lastName: 'Moderator',
      username: 'janemod',
      role: 'MODERATOR', // ✅ Nouveau: créer un utilisateur modérateur
      emailVerified: new Date()
    }
  })

  // Créer l'abonnement utilisateur test
  await prisma.userSubscription.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      subscriptionId: freePlan.id,
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      startDate: new Date(),
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    }
  })

  // Créer l'abonnement modérateur
  await prisma.userSubscription.upsert({
    where: { userId: moderator.id },
    update: {},
    create: {
      userId: moderator.id,
      subscriptionId: proPlan.id,
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      startDate: new Date(),
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    }
  })

  // Créer des templates de formulaires
  // ===== TEMPLATES DE FORMULAIRES AVEC STRUCTURE DIRECTE =====
  const contactTemplate = await prisma.formTemplate.upsert({
    where: { id: 'contact-template' },
    update: {},
    create: {
      id: 'contact-template',
      title: 'Template Contact Simple',
      description: 'Un template de base pour un formulaire de contact',
      category: 'CONTACT',
      tags: ['contact', 'simple', 'basique'],
      industry: 'Général',
      useCase: 'Contact client',
      // ✨ CONFIG DIRECTE SANS WRAPPER
      config: {
        id: 'contact-template',
        title: 'Template Contact Simple',
        description: 'Un template de base pour un formulaire de contact',
        layout: 'VERTICAL',
        spacing: 'NORMAL',
        steps: [
          {
            id: 'step_1752678963911',
            order: 0,
            title: 'Contact',
            description: '',
            fields: [
              {
                id: 'field_name',
                stepId: 'step_1752678963911',
                order: 0,
                width: 'full',
                name: 'name',
                label: 'Nom complet',
                placeholder: 'Votre nom',
                helpText: '',
                validation: { required: true },
                options: [],
                hasApi: false,
                apiConfig: {
                  method: 'GET',
                  endpoint: '',
                  cacheTime: 0,
                  responsePath: '',
                  labelKey: 'name',
                  valueKey: 'id'
                },
                conditionalLogic: {
                  enabled: false,
                  action: 'show',
                  logicalOperator: 'AND',
                  rules: []
                },
                type: 'text'
              }
            ]
          }
        ]
      },
      difficulty: 'BEGINNER',
      estimatedTime: 5,
      isPublic: true,
      isFeatured: true,
      isVerified: true,
      authorId: admin.id,
      authorName: 'Admin User',
      publishedAt: new Date()
    }
  })

  const registrationTemplate = await prisma.formTemplate.upsert({
    where: { id: 'registration-template' },
    update: {},
    create: {
      id: 'registration-template',
      title: 'Template Inscription Événement',
      description: 'Template complet pour inscription à un événement',
      category: 'REGISTRATION',
      tags: ['inscription', 'événement', 'multi-étapes'],
      industry: 'Événementiel',
      useCase: 'Inscription événement',
      config: {
        steps: [
          {
            id: 'step1',
            title: 'Informations personnelles',
            description: 'Vos informations de base',
            order: 1,
            fields: ['firstname', 'lastname', 'email', 'phone']
          },
          {
            id: 'step2',
            title: 'Préférences',
            description: 'Vos préférences pour l\'événement',
            order: 2,
            fields: ['dietary', 'sessions', 'newsletter']
          }
        ],
        fields: [
          {
            id: 'firstname',
            type: 'TEXT',
            label: 'Prénom',
            required: true,
            width: 'HALF',
            order: 1
          },
          {
            id: 'lastname',
            type: 'TEXT',
            label: 'Nom',
            required: true,
            width: 'HALF',
            order: 2
          },
          {
            id: 'email',
            type: 'EMAIL',
            label: 'Email',
            required: true,
            width: 'FULL',
            order: 3
          },
          {
            id: 'phone',
            type: 'TEL',
            label: 'Téléphone',
            required: false,
            width: 'FULL',
            order: 4
          },
          {
            id: 'dietary',
            type: 'SELECT',
            label: 'Régime alimentaire',
            required: true,
            width: 'FULL',
            order: 5,
            options: [
              { value: 'none', label: 'Aucun' },
              { value: 'vegetarian', label: 'Végétarien' },
              { value: 'vegan', label: 'Végan' },
              { value: 'gluten_free', label: 'Sans gluten' }
            ]
          },
          {
            id: 'sessions',
            type: 'MULTISELECT',
            label: 'Sessions d\'intérêt',
            required: true,
            width: 'FULL',
            order: 6,
            options: [
              { value: 'ai', label: 'Intelligence Artificielle' },
              { value: 'blockchain', label: 'Blockchain' },
              { value: 'cybersecurity', label: 'Cybersécurité' }
            ]
          },
          {
            id: 'newsletter',
            type: 'CHECKBOX',
            label: 'Je souhaite recevoir la newsletter',
            required: false,
            width: 'FULL',
            order: 7
          }
        ]
      },
      difficulty: 'INTERMEDIATE',
      estimatedTime: 10,
      isPublic: true,
      isFeatured: true,
      isVerified: true,
      authorId: admin.id,
      authorName: 'Admin User',
      publishedAt: new Date()
    }
  })

  // ===== FORMULAIRE SIMPLE (1 étape) =====
  const contactForm = await prisma.form.upsert({
    where: { id: 'contact-form-1' },
    update: {},
    create: {
      id: 'contact-form-1',
      title: 'Formulaire de Contact',
      description: 'Un formulaire simple pour nous contacter',
      userId: admin.id,
      templateId: contactTemplate.id,
      isPublished: true,
      mode: 'EDIT',
      layout: 'VERTICAL',
      spacing: 'NORMAL',
      // ✨ STEPS DIRECTEMENT COMME DANS LOCALSTORAGE
      steps: [
        {
          id: 'step_1752678963911',
          order: 0,
          title: 'Contact',
          description: '',
          fields: [
            {
              id: 'field_name_main',
              stepId: 'step_1752678963911',
              order: 0,
              width: 'full',
              name: 'name',
              label: 'Nom complet',
              placeholder: 'Votre nom complet',
              helpText: '',
              validation: { required: true },
              options: [],
              hasApi: false,
              apiConfig: {
                method: 'GET',
                endpoint: '',
                cacheTime: 0,
                responsePath: '',
                labelKey: 'name',
                valueKey: 'id'
              },
              conditionalLogic: {
                enabled: false,
                action: 'show',
                logicalOperator: 'AND',
                rules: []
              },
              type: 'text'
            },
            {
              id: 'field_email_main',
              stepId: 'step_1752678963911',
              order: 1,
              width: 'full',
              name: 'email',
              label: 'Email',
              placeholder: 'votre@email.com',
              helpText: '',
              validation: { required: true },
              options: [],
              hasApi: false,
              apiConfig: {
                method: 'GET',
                endpoint: '',
                cacheTime: 0,
                responsePath: '',
                labelKey: 'name',
                valueKey: 'id'
              },
              conditionalLogic: {
                enabled: false,
                action: 'show',
                logicalOperator: 'AND',
                rules: []
              },
              type: 'email'
            },
            {
              id: 'field_message_main',
              stepId: 'step_1752678963911',
              order: 2,
              width: 'full',
              name: 'message',
              label: 'Message',
              placeholder: 'Votre message...',
              helpText: '',
              validation: { required: true },
              options: [],
              hasApi: false,
              apiConfig: {
                method: 'GET',
                endpoint: '',
                cacheTime: 0,
                responsePath: '',
                labelKey: 'name',
                valueKey: 'id'
              },
              conditionalLogic: {
                enabled: false,
                action: 'show',
                logicalOperator: 'AND',
                rules: []
              },
              type: 'textarea'
            }
          ]
        }
      ],
      publishedAt: new Date()
    }
  })

  // ===== FORMULAIRE MULTI-ÉTAPES (3 étapes) =====
  const registrationForm = await prisma.form.upsert({
    where: { id: 'registration-form-1' },
    update: {},
    create: {
      id: 'registration-form-1',
      title: 'Inscription Événement Tech 2024',
      description: 'Formulaire d\'inscription pour notre événement annuel',
      userId: admin.id,
      templateId: registrationTemplate.id,
      isPublished: true,
      mode: 'EDIT',
      layout: 'VERTICAL',
      spacing: 'NORMAL',
      // ✨ STEPS DIRECTEMENT COMME DANS LOCALSTORAGE
      steps: [
        {
          id: 'step_1752678963911',
          order: 0,
          title: 'Informations personnelles',
          description: '',
          fields: [
            {
              id: 'field_firstname_reg',
              stepId: 'step_1752678963911',
              order: 0,
              width: 'half',
              name: 'firstname',
              label: 'Prénom',
              placeholder: 'Votre prénom',
              helpText: '',
              validation: { required: true },
              options: [],
              hasApi: false,
              apiConfig: {
                method: 'GET',
                endpoint: '',
                cacheTime: 0,
                responsePath: '',
                labelKey: 'name',
                valueKey: 'id'
              },
              conditionalLogic: {
                enabled: false,
                action: 'show',
                logicalOperator: 'AND',
                rules: []
              },
              type: 'text'
            },
            {
              id: 'field_lastname_reg',
              stepId: 'step_1752678963911',
              order: 1,
              width: 'half',
              name: 'lastname',
              label: 'Nom',
              placeholder: 'Votre nom',
              helpText: '',
              validation: { required: true },
              options: [],
              hasApi: false,
              apiConfig: {
                method: 'GET',
                endpoint: '',
                cacheTime: 0,
                responsePath: '',
                labelKey: 'name',
                valueKey: 'id'
              },
              conditionalLogic: {
                enabled: false,
                action: 'show',
                logicalOperator: 'AND',
                rules: []
              },
              type: 'text'
            },
            {
              id: 'field_email_reg',
              stepId: 'step_1752678963911',
              order: 2,
              width: 'full',
              name: 'email',
              label: 'Email',
              placeholder: 'votre@email.com',
              helpText: '',
              validation: { required: true },
              options: [],
              hasApi: false,
              apiConfig: {
                method: 'GET',
                endpoint: '',
                cacheTime: 0,
                responsePath: '',
                labelKey: 'name',
                valueKey: 'id'
              },
              conditionalLogic: {
                enabled: false,
                action: 'show',
                logicalOperator: 'AND',
                rules: []
              },
              type: 'email'
            }
          ]
        },
        {
          id: 'step_1752678976498',
          order: 1,
          title: 'Préférences',
          description: '',
          fields: [
            {
              id: 'field_dietary_reg',
              stepId: 'step_1752678976498',
              order: 0,
              width: 'full',
              name: 'dietary',
              label: 'Régime alimentaire',
              placeholder: '',
              helpText: '',
              validation: { required: true },
              options: [
                { value: 'none', label: 'Aucun' },
                { value: 'vegetarian', label: 'Végétarien' },
                { value: 'vegan', label: 'Végan' },
                { value: 'gluten_free', label: 'Sans gluten' }
              ],
              hasApi: false,
              apiConfig: {
                method: 'GET',
                endpoint: '',
                cacheTime: 0,
                responsePath: '',
                labelKey: 'name',
                valueKey: 'id'
              },
              conditionalLogic: {
                enabled: false,
                action: 'show',
                logicalOperator: 'AND',
                rules: []
              },
              type: 'radio'
            }
          ]
        }
      ],
      publishedAt: new Date()
    }
  })

  // Créer des soumissions de test
  await prisma.formSubmission.create({
    data: {
      formId: contactForm.id,
      userId: testUser.id,
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'info',
        message: 'Bonjour, je souhaite obtenir plus d\'informations sur vos services.'
      },
      metadata: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser',
        submissionTime: new Date().toISOString()
      },
      status: 'COMPLETED'
    }
  })

  await prisma.formSubmission.create({
    data: {
      formId: registrationForm.id,
      userId: testUser.id,
      data: {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane@example.com',
        phone: '+33 1 23 45 67 89',
        company: 'Tech Corp',
        position: 'Développeur',
        industry: 'tech',
        experience: 'senior',
        dietary: 'vegetarian',
        sessions: ['ai', 'blockchain'],
        networking: true,
        newsletter: true
      },
      metadata: {
        ip: '192.168.1.2',
        userAgent: 'Mozilla/5.0 Test Browser',
        submissionTime: new Date().toISOString()
      },
      status: 'COMPLETED'
    }
  })

  // Créer des clés API de test
  await prisma.apiKey.create({
    data: {
      userId: admin.id,
      name: 'API Key Admin',
      key: 'ak_test_admin_' + Math.random().toString(36).substring(7),
      permissions: ['forms:read', 'forms:write', 'submissions:read'],
      rateLimit: 1000,
      isActive: true
    }
  })

  await prisma.apiKey.create({
    data: {
      userId: testUser.id,
      name: 'API Key Test User',
      key: 'ak_test_user_' + Math.random().toString(36).substring(7),
      permissions: ['forms:read', 'submissions:read'],
      rateLimit: 100,
      isActive: true
    }
  })

  await prisma.apiKey.create({
    data: {
      userId: moderator.id,
      name: 'API Key Moderator',
      key: 'ak_test_mod_' + Math.random().toString(36).substring(7),
      permissions: ['forms:read', 'forms:write', 'submissions:read', 'templates:moderate'],
      rateLimit: 500,
      isActive: true
    }
  })

  console.log('✅ Seeding terminé !')
  console.log('📊 Données créées :')
  console.log('  - 2 Plans d\'abonnement')
  console.log('  - 3 Utilisateurs (admin, user, moderator)')
  console.log('  - 3 Abonnements utilisateur')
  console.log('  - 2 Templates de formulaires')
  console.log('  - 2 Formulaires')
  console.log('  - 2 Soumissions de test')
  console.log('  - 3 Clés API')
  console.log('')
  console.log('🔑 Connexion admin (ADMIN):')
  console.log('  Email: admin@example.com')
  console.log('  Mot de passe: admin123')
  console.log('')
  console.log('🔑 Connexion utilisateur test (USER):')
  console.log('  Email: user@example.com')
  console.log('  Mot de passe: password123')
  console.log('')
  console.log('🔑 Connexion modérateur (MODERATOR):')
  console.log('  Email: moderator@example.com')
  console.log('  Mot de passe: moderator123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })