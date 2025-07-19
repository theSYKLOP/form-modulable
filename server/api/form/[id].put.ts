import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const formId = getRouterParam(event, 'id')
    const body = await readBody(event)

    // ✅ Validation de l'ID
    if (!formId || typeof formId !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID du formulaire invalide'
      })
    }

    // ✅ Vérifier l'existence du formulaire avec toutes les données nécessaires
    const existingForm = await prisma.form.findUnique({
      where: { id: formId },
      select: { 
        id: true, 
        userId: true, 
        isPublished: true,
        title: true 
      }
    })

    if (!existingForm) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formulaire non trouvé'
      })
    }

    // ✅ Vérification des permissions (optionnel - à activer si vous gérez les permissions)
    // if (body.requestUserId && body.requestUserId !== existingForm.userId) {
    //   throw createError({
    //     statusCode: 403,
    //     statusMessage: 'Accès non autorisé'
    //   })
    // }

    // ✅ Validation des données si fournies
    if (body.title !== undefined && (!body.title?.trim())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le titre ne peut pas être vide'
      })
    }

    if (body.steps !== undefined && !Array.isArray(body.steps)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le format des étapes est invalide'
      })
    }

    if (body.userId !== undefined && body.userId !== existingForm.userId) {
      // Vérifier que le nouvel utilisateur existe
      const newUser = await prisma.user.findUnique({
        where: { id: body.userId },
        select: { id: true }
      })

      if (!newUser) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Nouvel utilisateur non trouvé'
        })
      }
    }

    // ✅ Vérification du template si fourni
    if (body.templateId !== undefined && body.templateId !== null) {
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

    // ✅ Préparation des données de mise à jour avec validation
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || ''
    if (body.layout !== undefined) {
      updateData.layout = ['VERTICAL', 'HORIZONTAL'].includes(body.layout) ? body.layout : 'VERTICAL'
    }
    if (body.spacing !== undefined) {
      updateData.spacing = ['COMPACT', 'NORMAL', 'RELAXED'].includes(body.spacing) ? body.spacing : 'NORMAL'
    }
    if (body.mode !== undefined) {
      updateData.mode = ['EDIT', 'READONLY', 'PREVIEW'].includes(body.mode) ? body.mode : 'EDIT'
    }
    if (body.submitButtonText !== undefined) updateData.submitButtonText = body.submitButtonText?.trim() || 'Soumettre'
    if (body.cancelButtonText !== undefined) updateData.cancelButtonText = body.cancelButtonText?.trim() || 'Annuler'
    if (body.resetButtonText !== undefined) updateData.resetButtonText = body.resetButtonText?.trim() || 'Réinitialiser'
    if (body.validateOnSubmit !== undefined) updateData.validateOnSubmit = Boolean(body.validateOnSubmit)
    if (body.validateOnBlur !== undefined) updateData.validateOnBlur = Boolean(body.validateOnBlur)
    if (body.validateOnChange !== undefined) updateData.validateOnChange = Boolean(body.validateOnChange)
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished)
    if (body.isTemplate !== undefined) updateData.isTemplate = Boolean(body.isTemplate)
    if (body.templateId !== undefined) updateData.templateId = body.templateId
    if (body.userId !== undefined) updateData.userId = body.userId
    
    // ✅ Mise à jour des steps avec validation
    if (body.steps !== undefined) {
      updateData.steps = Array.isArray(body.steps) ? body.steps : []
    }

    // ✅ Gestion correcte de publishedAt
    if (body.isPublished !== undefined) {
      if (body.isPublished && !existingForm.isPublished) {
        updateData.publishedAt = new Date()
      } else if (!body.isPublished && existingForm.isPublished) {
        updateData.publishedAt = null
      }
    }

    // ✅ Mise à jour avec gestion d'erreur
    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: updateData,
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
        },
        _count: {
          select: {
            submissions: true
          }
        }
      }
    })

    // ✅ Calcul des statistiques
    const stats = calculateFormStats(updatedForm.steps as any[])

    const responseData = {
      ...updatedForm,
      stats: {
        ...stats,
        submissionsCount: updatedForm._count.submissions
      }
    }

    return {
      success: true,
      data: responseData,
      message: 'Formulaire mis à jour avec succès'
    }

  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du formulaire:', error)
    
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

    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formulaire non trouvé'
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
      statusMessage: 'Erreur lors de la mise à jour du formulaire',
      data: process.env.NODE_ENV === 'development' ? { 
        error: error.message,
        code: error.code 
      } : undefined
    })
  } finally {
    await prisma.$disconnect()
  }
})

// ✅ Fonction utilitaire réutilisable
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
