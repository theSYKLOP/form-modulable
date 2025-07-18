import prisma from '~/server/utils/prisma'
import { validateId } from '~/server/utils/form-validator'
import { handleApiError, formatSuccessResponse } from '~/server/utils/error-handler'
import type { FormConfig } from '~/types/form'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const customTitle = body?.title

    // Validation de l'ID
    const validation = validateId(id)
    if (!validation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID invalide',
        data: { errors: validation.errors }
      })
    }

    // Validation du titre personnalisé
    if (customTitle && (typeof customTitle !== 'string' || customTitle.trim().length === 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le titre personnalisé doit être une chaîne non vide'
      })
    }

    // Récupérer le formulaire à dupliquer
    const originalForm = await prisma.form.findUnique({
      where: { id: id! },
      select: {
        id: true,
        title: true,
        description: true,
        layout: true,
        spacing: true,
        steps: true,
        fields: true
      }
    })

    if (!originalForm) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formulaire non trouvé'
      })
    }

    // Dupliquer le formulaire
    const duplicatedForm = await prisma.form.create({
      data: {
        title: customTitle?.trim() || `${originalForm.title} (Copie)`,
        description: originalForm.description,
        layout: originalForm.layout,
        spacing: originalForm.spacing,
        steps: originalForm.steps ? JSON.parse(JSON.stringify(originalForm.steps)) : [],
        fields: originalForm.fields ? JSON.parse(JSON.stringify(originalForm.fields)) : [],
        userId: '1' // TODO: Récupérer l'ID de l'utilisateur connecté
      },
      select: {
        id: true,
        title: true,
        description: true,
        layout: true,
        spacing: true,
        steps: true,
        fields: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const responseData: FormConfig = {
      id: duplicatedForm.id,
      title: duplicatedForm.title,
      description: duplicatedForm.description || '',
      layout: duplicatedForm.layout as 'VERTICAL' | 'HORIZONTAL',
      spacing: duplicatedForm.spacing as 'COMPACT' | 'NORMAL' | 'RELAXED',
      steps: Array.isArray(duplicatedForm.steps) ? duplicatedForm.steps as any[] : []
    }

    return formatSuccessResponse(
      responseData,
      'Formulaire dupliqué avec succès'
    )

  } catch (error: any) {
    return handleApiError(error, 'DUPLICATE_FORM')
  }
})
