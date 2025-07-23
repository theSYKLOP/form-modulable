import { PrismaClient } from '@prisma/client'
import { handleApiError, formatSuccessResponse } from '~/server/utils/error-handler'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    // Paramètres de pagination avec valeurs par défaut
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 12
    const sortBy = (query.sortBy as string) || 'createdAt'
    const sortOrder = (query.sortOrder as string) || 'desc'
    const search = query.search as string
    const status = query.status as string
    const isPublished = query.isPublished as string
    const userId = query.userId as string

    // Construction du where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Support du paramètre isPublished direct
    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true'
    } else if (status === 'published') {
      where.isPublished = true
    } else if (status === 'draft') {
      where.isPublished = false
    }
    
    if (userId) {
      where.userId = userId
    }

    // Calcul de l'offset pour la pagination
    const offset = (page - 1) * limit

    // Construction de l'orderBy
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Requête principale avec la nouvelle structure
    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
        select: {
          id: true,
          title: true,
          description: true,
          icon: true, // ✅ Nouveau champ
          layout: true,
          spacing: true,
          isPublished: true,
          isTemplate: true,
          templateId: true,
          // ✅ Utilisation de la nouvelle colonne steps
          steps: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
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
      }),
      prisma.form.count({ where })
    ])

    // Calcul des métadonnées de pagination
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Transformation des données pour inclure les statistiques
    const formsWithStats = forms.map(form => {
      console.log('Debug Form:', {
        id: form.id,
        title: form.title,
        stepsType: typeof form.steps,
        stepsIsArray: Array.isArray(form.steps),
        stepsLength: Array.isArray(form.steps) ? form.steps.length : 0,
        stepsContent: form.steps
      })

      // ✅ Calcul du nombre de champs depuis la nouvelle structure steps
      let fieldsCount = 0
      if (form.steps && Array.isArray(form.steps)) {
        fieldsCount = form.steps.reduce((count: number, step: any) => {
          return count + (Array.isArray(step.fields) ? step.fields.length : 0)
        }, 0)
      }

      const stepsCount = Array.isArray(form.steps) ? form.steps.length : 0
      
      console.log('Calculated stats for form', form.id, ':', {
        stepsCount,
        fieldsCount
      })

      return {
        id: form.id,
        title: form.title,
        description: form.description,
        icon:form.icon, // ✅ Nouveau champ
        layout: form.layout,
        spacing: form.spacing,
        isPublished: form.isPublished,
        isTemplate: form.isTemplate,
        templateId: form.templateId,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        publishedAt: form.publishedAt,
        // ✅ Statistiques calculées depuis steps
        stepsCount,
        fieldsCount,
        submissionsCount: form._count.submissions,
        // Relations
        user: form.user,
        template: form.template
      }
    })

    return formatSuccessResponse(
      {
        forms: formsWithStats,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage
        },
        filters: {
          search: search || null,
          status: status || null,
          userId: userId || null,
          sortBy,
          sortOrder
        }
      },
      `${formsWithStats.length} formulaire(s) récupéré(s)`
    )
  } catch (error: any) {
    console.error('Erreur lors de la récupération des formulaires:', error)
    
    // ✅ Gestion d'erreur plus détaillée pour le debug
    return handleApiError(error, 'LIST_FORMS')
  } finally {
    await prisma.$disconnect()
  }
})
