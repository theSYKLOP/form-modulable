import prisma from '~/server/utils/prisma'
import { validateFormConfig, validateId } from '~/server/utils/form-validator'
import { handleApiError, formatSuccessResponse } from '~/server/utils/error-handler'
import type { FormConfig } from '~/types/form'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event) as FormConfig

    // Validation de l'ID
    const idValidation = validateId(id)
    if (!idValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID invalide',
        data: { errors: idValidation.errors }
      })
    }

    // Validation des données
    const dataValidation = validateFormConfig(body)
    if (!dataValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Données invalides',
        data: { errors: dataValidation.errors }
      })
    }

    // Vérifier l'existence du formulaire
    const existingForm = await prisma.form.findUnique({
      where: { id: id! },
      select: { id: true }
    })

    if (!existingForm) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formulaire non trouvé'
      })
    }

    // Mettre à jour le formulaire
    const updatedForm = await prisma.form.update({
      where: { id: id! },
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || '',
        layout: body.layout || 'VERTICAL',
        spacing: body.spacing || 'NORMAL',
        steps: JSON.parse(JSON.stringify(body.steps || [])),
        fields: JSON.parse(JSON.stringify(body.steps?.flatMap(step => step.fields) || []))
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
      id: updatedForm.id,
      title: updatedForm.title,
      description: updatedForm.description || '',
      layout: updatedForm.layout as 'VERTICAL' | 'HORIZONTAL',
      spacing: updatedForm.spacing as 'COMPACT' | 'NORMAL' | 'RELAXED',
      steps: Array.isArray(updatedForm.steps) ? updatedForm.steps as any[] : []
    }

    return formatSuccessResponse(
      responseData,
      'Formulaire mis à jour avec succès'
    )

  } catch (error: any) {
    return handleApiError(error, 'UPDATE_FORM')
  }
})
