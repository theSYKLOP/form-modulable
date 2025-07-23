import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const formId = getRouterParam(event, 'id')
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token manquant'
      })
    }

    let userId
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      userId = decoded.userId
    } catch {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide'
      })
    }

    if (!formId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de formulaire requis'
      })
    }

    // Récupérer le brouillon le plus récent pour ce formulaire
    const draft = await prisma.formSubmission.findFirst({
      where: {
        userId: userId,
        formId: formId,
        status: 'DRAFT'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!draft) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Brouillon non trouvé'
      })
    }

    return {
      success: true,
      data: {
        id: draft.id,
        formId: draft.formId,
        data: draft.data,
        currentStep: draft.currentStep || 0,
        savedAt: draft.updatedAt
      }
    }

  } catch (error: any) {
    console.error('Erreur API form-drafts/[id]:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erreur serveur'
    })
  }
})
