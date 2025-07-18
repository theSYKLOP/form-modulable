import prisma from '~/server/utils/prisma'
import { handleApiError, formatSuccessResponse } from '~/server/utils/error-handler'
import type { FormConfig } from '~/types/form'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10))
    const search = query.search as string
    const sortBy = ['title', 'createdAt', 'updatedAt'].includes(query.sortBy as string) 
      ? query.sortBy as string 
      : 'createdAt'
    const sortOrder = ['asc', 'desc'].includes(query.sortOrder as string) 
      ? query.sortOrder as 'asc' | 'desc' 
      : 'desc'

    // Construire les conditions de recherche sécurisées
    const where: any = {}
    if (search?.trim()) {
      const searchTerm = search.trim()
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    // Calculer l'offset pour la pagination
    const skip = (page - 1) * limit

    // Récupérer les formulaires avec pagination
    const [forms, totalCount] = await Promise.all([
      prisma.form.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          layout: true,
          spacing: true,
          createdAt: true,
          updatedAt: true,
          steps: true,
          fields: true
        }
      }),
      prisma.form.count({ where })
    ])

    // Transformer les données pour le frontend
    const transformedForms = forms.map(form => {
      const steps = Array.isArray(form.steps) ? form.steps as any[] : []
      const fields = Array.isArray(form.fields) ? form.fields as any[] : []
      
      return {
        id: form.id,
        title: form.title,
        description: form.description,
        layout: form.layout,
        spacing: form.spacing,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        stepsCount: steps.length,
        fieldsCount: fields.length
      }
    })

    return formatSuccessResponse(
      {
        forms: transformedForms,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      },
      `${transformedForms.length} formulaire(s) récupéré(s)`
    )

  } catch (error: any) {
    return handleApiError(error, 'LIST_FORMS')
  }
})
