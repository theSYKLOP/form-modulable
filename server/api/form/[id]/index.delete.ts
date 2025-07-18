import prisma from '~/server/utils/prisma'
import { validateId } from '~/server/utils/form-validator'
import { handleApiError, formatSuccessResponse } from '~/server/utils/error-handler'

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

    // Vérifier que le formulaire existe et récupérer les stats
    const existingForm = await prisma.form.findUnique({
      where: { id: id! },
      select: {
        id: true,
        title: true,
        steps: true,
        fields: true
      }
    })

    if (!existingForm) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formulaire non trouvé'
      })
    }

    // Préparer les statistiques de suppression
    const steps = Array.isArray(existingForm.steps) ? existingForm.steps as any[] : []
    const fields = Array.isArray(existingForm.fields) ? existingForm.fields as any[] : []
    
    const deletionStats = {
      deletedFormId: id,
      formTitle: existingForm.title,
      deletedStepsCount: steps.length,
      deletedFieldsCount: fields.length
    }

    // Supprimer le formulaire
    await prisma.form.delete({
      where: { id: id! }
    })

    return formatSuccessResponse(
      deletionStats,
      'Formulaire supprimé avec succès'
    )

  } catch (error: any) {
    return handleApiError(error, 'DELETE_FORM')
  }
})
