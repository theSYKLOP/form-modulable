import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Récupérer les brouillons de l'utilisateur
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

    const drafts = await prisma.formSubmission.findMany({
      where: {
        userId: userId,
        status: 'DRAFT'
      },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            icon: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return {
      success: true,
      data: drafts.map(draft => ({
        id: draft.id,
        formId: draft.formId,
        formTitle: draft.form?.title,
        formIcon: draft.form?.icon,
        data: draft.data,
        currentStep: draft.currentStep || 0,
        savedAt: draft.updatedAt
      }))
    }

  } catch (error: any) {
    console.error('Erreur API form-drafts GET:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erreur serveur'
    })
  }
})
