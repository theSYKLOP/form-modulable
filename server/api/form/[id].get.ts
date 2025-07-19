import { PrismaClient } from '@prisma/client'
import { validateId } from '~/server/utils/form-validator'
import { handleApiError, formatSuccessResponse } from '~/server/utils/error-handler'
import type { FormConfig } from '~/types/form'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    // Validation de l'ID
    const validation = validateId(id)
    if (!validation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID invalide',
        data: { errors: validation.errors }
      })
    }

    // Récupérer le formulaire
    const form = await prisma.form.findUnique({
      where: { id: id! },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true
          }
        },
        template: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true
          }
        },
        submissions: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Dernières 10 soumissions
        },
        _count: {
          select: {
            submissions: true
          }
        }
      }
    })

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formulaire non trouvé'
      })
    }

    // ✅ Calcul des statistiques depuis la nouvelle structure steps
    let fieldsCount = 0
    let stepsWithApiValidation = 0
    
    if (form.steps && Array.isArray(form.steps)) {
      fieldsCount = form.steps.reduce((count: number, step: any) => {
        // Compter les champs
        const stepFieldsCount = Array.isArray(step.fields) ? step.fields.length : 0
        
        // Compter les étapes avec validation API
        if (step.apiConfig?.enabled) {
          stepsWithApiValidation++
        }
        
        return count + stepFieldsCount
      }, 0)
    }

    // ✅ Structure de réponse optimisée
    const formData = {
      id: form.id,
      title: form.title,
      description: form.description,
      layout: form.layout,
      spacing: form.spacing,
      mode: form.mode,
      submitButtonText: form.submitButtonText,
      cancelButtonText: form.cancelButtonText,
      resetButtonText: form.resetButtonText,
      validateOnSubmit: form.validateOnSubmit,
      validateOnBlur: form.validateOnBlur,
      validateOnChange: form.validateOnChange,
      isPublished: form.isPublished,
      isTemplate: form.isTemplate,
      templateId: form.templateId,
      // ✅ Structure steps directe (compatible localStorage)
      steps: form.steps,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      publishedAt: form.publishedAt,
      // Relations
      user: form.user,
      template: form.template,
      submissions: form.submissions,
      // Statistiques
      stats: {
        stepsCount: Array.isArray(form.steps) ? form.steps.length : 0,
        fieldsCount,
        submissionsCount: form._count.submissions,
        stepsWithApiValidation,
        lastSubmissionAt: form.submissions.length > 0 ? form.submissions[0].createdAt : null
      }
    }

    return formatSuccessResponse(formData)
  } catch (error: any) {
    console.error('Erreur lors de la récupération du formulaire:', error)
    
    // ✅ Gestion d'erreur détaillée
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur de base de données',
      data: {
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      }
    })
  } finally {
    await prisma.$disconnect()
  }
})