import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification et les permissions admin
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token d\'authentification manquant'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (!decoded.userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide'
      })
    }

    // Vérifier que l'utilisateur est admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Permissions administrateur requises'
      })
    }

    const userId = getRouterParam(event, 'id')
    const body = await readBody(event)

    // Récupérer les données à mettre à jour
    const updateData: any = {}
    
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.email !== undefined) updateData.email = body.email
    if (body.username !== undefined) updateData.username = body.username
    if (body.role !== undefined) updateData.role = body.role
    if (body.emailVerified !== undefined) {
      updateData.emailVerified = body.emailVerified ? new Date() : null
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    return {
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès'
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email ou nom d\'utilisateur déjà utilisé'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la mise à jour de l\'utilisateur'
    })
  } finally {
    await prisma.$disconnect()
  }
})
