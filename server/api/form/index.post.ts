import prisma from '~/server/utils/prisma'
import { validateFormConfig } from '~/server/utils/form-validator'
import { handleApiError, formatSuccessResponse } from '~/server/utils/error-handler'
import type { FormConfig } from '~/types/form'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as FormConfig

    // Validation des données
    const validation = validateFormConfig(body)
    if (!validation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Données invalides',
        data: { errors: validation.errors }
      })
    }

    // Créer le formulaire avec les données JSON
    const newForm = await prisma.form.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || '',
        layout: body.layout || 'VERTICAL',
        spacing: body.spacing || 'NORMAL',
        steps: JSON.parse(JSON.stringify(body.steps || [])),
        fields: JSON.parse(JSON.stringify(body.steps?.flatMap(step => step.fields) || [])),
        userId: '1' // TODO: Récupérer l'ID de l'utilisateur connecté depuis la session
      }
    })

    const responseData: FormConfig = {
      id: newForm.id,
      title: newForm.title,
      description: newForm.description || '',
      layout: newForm.layout as 'VERTICAL' | 'HORIZONTAL',
      spacing: newForm.spacing as 'COMPACT' | 'NORMAL' | 'RELAXED',
      steps: Array.isArray(newForm.steps) ? newForm.steps as any[] : []
    }

    return formatSuccessResponse(
      responseData,
      'Formulaire créé avec succès'
    )

  } catch (error: any) {
    return handleApiError(error, 'CREATE_FORM')
  }
})
