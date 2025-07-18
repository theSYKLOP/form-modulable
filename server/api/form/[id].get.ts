import prisma from '~/server/utils/prisma'
import { validateId } from '~/server/utils/form-validator'
import { handleApiError, formatSuccessResponse } from '~/server/utils/error-handler'
import type { FormConfig } from '~/types/form'

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

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formulaire non trouvé'
      })
    }

    const responseData: FormConfig = {
      id: form.id,
      title: form.title,
      description: form.description || '',
      layout: form.layout as 'VERTICAL' | 'HORIZONTAL',
      spacing: form.spacing as 'COMPACT' | 'NORMAL' | 'RELAXED',
      steps: Array.isArray(form.steps) ? form.steps as any[] : []
    }

    return formatSuccessResponse(responseData)

  } catch (error: any) {
    return handleApiError(error, 'GET_FORM')
  }
})