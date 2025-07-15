import { PrismaClient } from '@prisma/client'
import type { DashboardResponse, ChartDataPoint } from '~/types/admin'

const prisma = new PrismaClient()

export default defineEventHandler(async (event): Promise<DashboardResponse> => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      totalForms,
      publishedForms,
      totalSubmissions,
      submissionsToday,
      completedSubmissions,
      monthlyUsers,
      dailySubmissions,
      recentUsers,
      recentSubmissions
    ] = await Promise.all([
      // Comptages principaux
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.form.count(),
      prisma.form.count(), // Remove status filter since 'status' field doesn't exist
      
      // Changez 'submission' par le nom correct de votre table
      // Vérifiez dans votre schema.prisma le nom exact
      prisma.formSubmission.count(), // ou prisma.responses.count() selon votre schema
      prisma.formSubmission.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.formSubmission.count(), // Removed invalid status filter
      
      // Données graphiques - Inscriptions par mois
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
          return prisma.user.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextMonth
              }
            }
          }).then((count: number): ChartDataPoint => ({
            label: date.toLocaleDateString('fr-FR', { month: 'short' }),
            value: count
          }))
        })
      ),
      
      // Données graphiques - Soumissions par jour
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)
          return prisma.formSubmission.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDay
              }
            }
          }).then((count: number): ChartDataPoint => ({
            label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            value: count
          }))
        })
      ),
      
      // Utilisateurs récents
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true
        }
      }),
      
      // Soumissions récentes - Adaptez selon votre schema
      prisma.formSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          form: {
            select: {
              title: true
            }
          },
          user: {
            select: {
              email: true
            }
          }
        }
      })
    ])

    // Calculs dérivés
    const userGrowth = usersLastMonth > 0 
      ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
      : usersThisMonth > 0 ? 100 : 0

    const successRate = totalSubmissions > 0 
      ? Math.round((completedSubmissions / totalSubmissions) * 100)
      : 0

    // Formatage des données de soumissions récentes
    const formattedRecentSubmissions = recentSubmissions.map(submission => ({
      id: parseInt(submission.id),
      formTitle: submission.form?.title || 'Titre non disponible',
      userEmail: submission.user?.email || 'Email non disponible',
      createdAt: submission.createdAt
    }))

    // Format recent users with proper ID conversion
    const formattedRecentUsers = recentUsers.map(user => ({
      id: parseInt(user.id),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt
    }))

    return {
      stats: {
        users: {
          total: totalUsers,
          growth: userGrowth
        },
        forms: {
          total: totalForms,
          published: publishedForms
        },
        submissions: {
          total: totalSubmissions,
          today: submissionsToday
        },
        successRate
      },
      
      chartData: {
        registrations: monthlyUsers.reverse(),
        submissions: dailySubmissions.reverse()
      },
      
      recentActivity: {
        users: formattedRecentUsers,
        submissions: formattedRecentSubmissions
      }
    }
  } catch (error) {
    console.error('Erreur dashboard:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des données du dashboard'
    })
  } finally {
    await prisma.$disconnect()
  }
})