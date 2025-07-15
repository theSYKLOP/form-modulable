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
      config: {
        steps: [
          {
            id: 'step1',
            title: 'Contact',
            description: 'Informations de contact',
            order: 1,
            fields: ['name', 'email', 'subject', 'message']
          }
        ],
        fields: [
          {
            id: 'name',
            type: 'TEXT',
            label: 'Nom complet',
            placeholder: 'Votre nom',
            required: true,
            width: 'FULL',
            order: 1
          },
          {
            id: 'email',
            type: 'EMAIL',
            label: 'Email',
            placeholder: 'votre@email.com',
            required: true,
            width: 'FULL',
            order: 2
          },
          {
            id: 'subject',
            type: 'TEXT',
            label: 'Sujet',
            placeholder: 'Sujet de votre message',
            required: true,
            width: 'FULL',
            order: 3
          },
          {
            id: 'message',
            type: 'TEXTAREA',
            label: 'Message',
            placeholder: 'Votre message...',
            required: true,
            width: 'FULL',
            order: 4
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
      steps: [
        {
          id: 'step1',
          title: 'Contact',
          description: 'Remplissez vos informations de contact',
          order: 1,
          fields: ['name', 'email', 'subject', 'message']
        }
      ],
      fields: [
        {
          id: 'name',
          type: 'TEXT',
          label: 'Nom complet',
          placeholder: 'Votre nom complet',
          required: true,
          width: 'FULL',
          order: 1
        },
        {
          id: 'email',
          type: 'EMAIL',
          label: 'Email',
          placeholder: 'votre@email.com',
          required: true,
          width: 'FULL',
          order: 2
        },
        {
          id: 'subject',
          type: 'SELECT',
          label: 'Sujet',
          required: true,
          width: 'FULL',
          order: 3,
          options: [
            { value: 'info', label: 'Demande d\'information' },
            { value: 'support', label: 'Support technique' },
            { value: 'business', label: 'Partenariat' }
          ]
        },
        {
          id: 'message',
          type: 'TEXTAREA',
          label: 'Message',
          placeholder: 'Votre message...',
          required: true,
          width: 'FULL',
          order: 4
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
      title: 'Inscription Événement',
      description: 'Formulaire d\'inscription pour notre événement annuel',
      userId: admin.id,
      templateId: registrationTemplate.id,
      isPublished: true,
      mode: 'EDIT',
      layout: 'VERTICAL',
      spacing: 'NORMAL',
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
          title: 'Informations professionnelles',
          description: 'Votre contexte professionnel',
          order: 2,
          fields: ['company', 'position', 'industry', 'experience']
        },
        {
          id: 'step3',
          title: 'Préférences',
          description: 'Vos préférences pour l\'événement',
          order: 3,
          fields: ['dietary', 'sessions', 'networking', 'newsletter']
        }
      ],
      fields: [
        // Étape 1 - Informations personnelles
        {
          id: 'firstname',
          type: 'TEXT',
          label: 'Prénom',
          placeholder: 'Votre prénom',
          required: true,
          width: 'HALF',
          order: 1
        },
        {
          id: 'lastname',
          type: 'TEXT',
          label: 'Nom',
          placeholder: 'Votre nom',
          required: true,
          width: 'HALF',
          order: 2
        },
        {
          id: 'email',
          type: 'EMAIL',
          label: 'Email',
          placeholder: 'votre@email.com',
          required: true,
          width: 'FULL',
          order: 3
        },
        {
          id: 'phone',
          type: 'TEL',
          label: 'Téléphone',
          placeholder: '+33 1 23 45 67 89',
          required: false,
          width: 'FULL',
          order: 4
        },
        
        // Étape 2 - Informations professionnelles
        {
          id: 'company',
          type: 'TEXT',
          label: 'Entreprise',
          placeholder: 'Nom de votre entreprise',
          required: false,
          width: 'FULL',
          order: 5
        },
        {
          id: 'position',
          type: 'TEXT',
          label: 'Poste',
          placeholder: 'Votre poste actuel',
          required: false,
          width: 'HALF',
          order: 6
        },
        {
          id: 'industry',
          type: 'SELECT',
          label: 'Secteur d\'activité',
          required: false,
          width: 'HALF',
          order: 7,
          options: [
            { value: 'tech', label: 'Technologie' },
            { value: 'finance', label: 'Finance' },
            { value: 'healthcare', label: 'Santé' },
            { value: 'education', label: 'Éducation' },
            { value: 'retail', label: 'Commerce' },
            { value: 'other', label: 'Autre' }
          ]
        },
        {
          id: 'experience',
          type: 'RADIO',
          label: 'Expérience professionnelle',
          required: true,
          width: 'FULL',
          order: 8,
          options: [
            { value: 'junior', label: 'Moins de 2 ans' },
            { value: 'intermediate', label: '2-5 ans' },
            { value: 'senior', label: '5-10 ans' },
            { value: 'expert', label: 'Plus de 10 ans' }
          ]
        },
        
        // Étape 3 - Préférences
        {
          id: 'dietary',
          type: 'RADIO',
          label: 'Régime alimentaire',
          required: true,
          width: 'FULL',
          order: 9,
          options: [
            { value: 'none', label: 'Aucun' },
            { value: 'vegetarian', label: 'Végétarien' },
            { value: 'vegan', label: 'Végan' },
            { value: 'gluten_free', label: 'Sans gluten' },
            { value: 'other', label: 'Autre (préciser en commentaire)' }
          ]
        },
        {
          id: 'sessions',
          type: 'MULTISELECT',
          label: 'Sessions d\'intérêt',
          required: true,
          width: 'FULL',
          order: 10,
          options: [
            { value: 'ai', label: 'Intelligence Artificielle' },
            { value: 'blockchain', label: 'Blockchain' },
            { value: 'cybersecurity', label: 'Cybersécurité' },
            { value: 'cloud', label: 'Cloud Computing' },
            { value: 'ux', label: 'UX/UI Design' },
            { value: 'data', label: 'Data Science' }
          ]
        },
        {
          id: 'networking',
          type: 'CHECKBOX',
          label: 'Je souhaite participer au networking',
          required: false,
          width: 'FULL',
          order: 11
        },
        {
          id: 'newsletter',
          type: 'CHECKBOX',
          label: 'Je souhaite recevoir la newsletter',
          required: false,
          width: 'FULL',
          order: 12
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