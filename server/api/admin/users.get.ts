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

    // Récupérer les paramètres de requête
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const search = query.search as string || ''
    const sortBy = query.sortBy as string || 'createdAt'
    const sortOrder = query.sortOrder as string || 'desc'

    // Construire les conditions de recherche
    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Calculer l'offset
    const offset = (page - 1) * limit

    // Récupérer les utilisateurs avec pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    }

  } catch (error: any) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)

    // Si c'est une erreur de token JWT
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide ou expiré'
      })
    }

    // Si c'est déjà une erreur HTTP, la relancer
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  } finally {
    await prisma.$disconnect()
  }
})
