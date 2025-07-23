import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // ✅ Validation des champs obligatoires
    if (!body.title?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le titre est requis'
      })
    }

    if (!body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'L\'ID utilisateur est requis'
      })
    }

    // ✅ Vérification que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { id: true }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur non trouvé'
      })
    }

    // ✅ Validation des steps si fournies
    if (body.steps && !Array.isArray(body.steps)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le format des étapes est invalide'
      })
    }

    // ✅ Vérification du template si fourni
    if (body.templateId) {
      const template = await prisma.formTemplate.findUnique({
        where: { id: body.templateId },
        select: { id: true }
      })

      if (!template) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Template non trouvé'
        })
      }
    }

    // ✅ Création du formulaire avec validation des types
    const newForm = await prisma.form.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || '',
        icon: body.icon?.trim() || 'heroicons:document-text', // ✅ Nouveau champ
        layout: ['VERTICAL', 'HORIZONTAL'].includes(body.layout) ? body.layout : 'VERTICAL',
        spacing: ['COMPACT', 'NORMAL', 'RELAXED'].includes(body.spacing) ? body.spacing : 'NORMAL',
        mode: ['EDIT', 'READONLY', 'PREVIEW'].includes(body.mode) ? body.mode : 'EDIT',
        submitButtonText: body.submitButtonText?.trim() || 'Soumettre',
        cancelButtonText: body.cancelButtonText?.trim() || 'Annuler',
        resetButtonText: body.resetButtonText?.trim() || 'Réinitialiser',
        validateOnSubmit: Boolean(body.validateOnSubmit ?? true),
        validateOnBlur: Boolean(body.validateOnBlur ?? false),
        validateOnChange: Boolean(body.validateOnChange ?? false),
        isPublished: Boolean(body.isPublished ?? false),
        isTemplate: Boolean(body.isTemplate ?? false),
        templateId: body.templateId || null,
        userId: body.userId,
        // ✅ Steps avec validation de structure
        steps: Array.isArray(body.steps) ? body.steps : []
      },
      include: {
        user: {
          select: {
            id: true,
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
        }
      }
    })

    // ✅ Calcul des statistiques optimisé
    const stats = calculateFormStats(newForm.steps as any[])

    const responseData = {
      ...newForm,
      stats: {
        ...stats,
        submissionsCount: 0
      }
    }

    return {
      success: true,
      data: responseData,
      message: 'Formulaire créé avec succès'
    }

  } catch (error: any) {
    console.error('Erreur lors de la création du formulaire:', error)
    
    // ✅ Gestion d'erreur unifiée
    if (error.statusCode) {
      throw error
    }

    // ✅ Erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Un formulaire avec ce nom existe déjà'
      })
    }

    if (error.code === 'P2003') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Référence invalide (utilisateur ou template)'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la création du formulaire',
      data: process.env.NODE_ENV === 'development' ? { 
        error: error.message,
        code: error.code 
      } : undefined
    })
  } finally {
    await prisma.$disconnect()
  }
})

// ✅ Fonction utilitaire pour calculer les statistiques
function calculateFormStats(steps: any[]) {
  if (!Array.isArray(steps)) {
    return {
      stepsCount: 0,
      fieldsCount: 0,
      stepsWithApiValidation: 0
    }
  }

  let fieldsCount = 0
  let stepsWithApiValidation = 0

  steps.forEach(step => {
    if (Array.isArray(step.fields)) {
      fieldsCount += step.fields.length
    }
    if (step.apiConfig?.enabled) {
      stepsWithApiValidation++
    }
  })

  return {
    stepsCount: steps.length,
    fieldsCount,
    stepsWithApiValidation
  }
}
