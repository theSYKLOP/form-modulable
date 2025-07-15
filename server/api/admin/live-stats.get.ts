export default defineEventHandler(async (event) => {
  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())

    // Données de démonstration - remplacez par vos vraies requêtes
    const [
      usersToday,
      submissionsToday,
      submissionsThisHour,
      onlineUsers
    ] = await Promise.all([
      Promise.resolve(12), // usersToday
      Promise.resolve(45), // submissionsToday
      Promise.resolve(8),  // submissionsThisHour
      Promise.resolve(24)  // onlineUsers
    ])

    return {
      usersToday,
      submissionsToday,
      submissionsThisHour,
      onlineUsers,
      lastUpdate: now.toISOString()
    }
  } catch (error) {
    console.error('Erreur live stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des statistiques temps réel'
    })
  }
})