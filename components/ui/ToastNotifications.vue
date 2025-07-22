<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup
      name="toast"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
        :class="getNotificationClasses(notification.type)"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <Icon
                :name="getIconName(notification.type)"
                class="h-6 w-6"
                :class="getIconClasses(notification.type)"
              />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">
                {{ notification.title }}
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Fermer</span>
                <Icon name="heroicons:x-mark" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const { notifications, removeNotification } = useNotifications()

const getNotificationClasses = (type) => {
  switch (type) {
    case 'success':
      return 'border-l-4 border-green-400'
    case 'error':
      return 'border-l-4 border-red-400'
    case 'warning':
      return 'border-l-4 border-yellow-400'
    case 'info':
      return 'border-l-4 border-blue-400'
    default:
      return 'border-l-4 border-gray-400'
  }
}

const getIconName = (type) => {
  switch (type) {
    case 'success':
      return 'heroicons:check-circle'
    case 'error':
      return 'heroicons:x-circle'
    case 'warning':
      return 'heroicons:exclamation-triangle'
    case 'info':
      return 'heroicons:information-circle'
    default:
      return 'heroicons:bell'
  }
}

const getIconClasses = (type) => {
  switch (type) {
    case 'success':
      return 'text-green-400'
    case 'error':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'info':
      return 'text-blue-400'
    default:
      return 'text-gray-400'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
