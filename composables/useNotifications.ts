/**
 * ✅ Composable pour les notifications toast
 */
export const useNotifications = () => {
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>>([])

  const addNotification = (notification: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }) => {
    const id = Date.now().toString()
    const newNotification = {
      id,
      duration: 5000,
      ...notification
    }

    notifications.value.push(newNotification)

    // Auto-remove après la durée spécifiée
    setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Méthodes utilitaires
  const success = (title: string, message: string, duration?: number) =>
    addNotification({ type: 'success', title, message, duration })

  const error = (title: string, message: string, duration?: number) =>
    addNotification({ type: 'error', title, message, duration })

  const warning = (title: string, message: string, duration?: number) =>
    addNotification({ type: 'warning', title, message, duration })

  const info = (title: string, message: string, duration?: number) =>
    addNotification({ type: 'info', title, message, duration })

  return {
    notifications: readonly(notifications),
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  }
}
