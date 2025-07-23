import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const method = getMethod(event)
    
    if (method === 'GET') {
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
    }

    if (method === 'POST') {
      // Sauvegarder un brouillon
      const body = await readBody(event)
      const { formId, data, currentStep } = body

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

      // Vérifier si un brouillon existe déjà
      const existingDraft = await prisma.formSubmission.findFirst({
        where: {
          userId: userId,
          formId: formId,
          status: 'DRAFT'
        }
      })

      let draft
      if (existingDraft) {
        // Mettre à jour le brouillon existant
        draft = await prisma.formSubmission.update({
          where: { id: existingDraft.id },
          data: {
            data: data,
            currentStep: currentStep,
            updatedAt: new Date()
          }
        })
      } else {
        // Créer un nouveau brouillon
        draft = await prisma.formSubmission.create({
          data: {
            userId: userId,
            formId: formId,
            data: data,
            currentStep: currentStep,
            status: 'DRAFT'
          }
        })
      }

      return {
        success: true,
        data: draft
      }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Méthode non autorisée'
    })

  } catch (error: any) {
    console.error('Erreur API form-drafts:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erreur serveur'
    })
  }
})
