import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { formId, data, completedAt } = body

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

    // Vérifier que le formulaire existe et est publié
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        isPublished: true
      }
    })

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formulaire non trouvé ou non publié'
      })
    }

    // Supprimer les brouillons existants pour ce formulaire
    await prisma.formSubmission.deleteMany({
      where: {
        userId: userId,
        formId: formId,
        status: 'DRAFT'
      }
    })

    // Créer la soumission finale
    const submission = await prisma.formSubmission.create({
      data: {
        userId: userId,
        formId: formId,
        data: data,
        status: 'COMPLETED',
        submittedAt: completedAt ? new Date(completedAt) : new Date()
      }
    })

    return {
      success: true,
      data: {
        id: submission.id,
        submittedAt: submission.submittedAt
      },
      message: 'Formulaire soumis avec succès'
    }

  } catch (error: any) {
    console.error('Erreur API form-submission:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erreur lors de la soumission'
    })
  }
})
