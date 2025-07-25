/**
 * Composable pour la gestion optimisée des icônes avec fallback
 * Résout les problèmes d'affichage des icônes Heroicons
 */

export const useIconManager = () => {
  /**
   * Mapping des icônes avec fallback emoji et alternatives
   */
  const iconMap = {
    // Icônes d'authentification et sécurité
    'heroicons:shield-check': { emoji: '🛡️', alt: 'security' },
    'heroicons:arrow-right-on-rectangle': { emoji: '🔑', alt: 'login' },
    'heroicons:home': { emoji: '🏠', alt: 'home' },
    'heroicons:document-text': { emoji: '📄', alt: 'document' },
    
    // Icônes d'état
    'heroicons:check-circle': { emoji: '✅', alt: 'success' },
    'heroicons:check': { emoji: '✅', alt: 'check' },
    'heroicons:exclamation-triangle': { emoji: '⚠️', alt: 'warning' },
    'heroicons:x-mark': { emoji: '❌', alt: 'close' },
    'heroicons:arrow-path': { emoji: '↻', alt: 'refresh' },
    
    // Icônes de navigation
    'heroicons:chevron-left': { emoji: '‹', alt: 'previous' },
    'heroicons:chevron-right': { emoji: '›', alt: 'next' },
    'heroicons:arrow-left': { emoji: '←', alt: 'back' },
    
    // Icônes d'action
    'heroicons:heart': { emoji: '❤️', alt: 'favorite' },
    'heroicons:magnifying-glass': { emoji: '🔍', alt: 'search' },
    'heroicons:play': { emoji: '▶️', alt: 'play' },
    'heroicons:clock': { emoji: '🕐', alt: 'time' },
    'heroicons:queue-list': { emoji: '📋', alt: 'list' },
    'heroicons:tag': { emoji: '🏷️', alt: 'tag' },
    'heroicons:document-duplicate': { emoji: '📄', alt: 'duplicate' },
  }

  /**
   * Vérifie si une icône est disponible
   */
  const isIconAvailable = (iconName: string): boolean => {
    return !!iconMap[iconName]
  }

  /**
   * Obtient l'emoji de fallback pour une icône
   */
  const getIconFallback = (iconName: string): string => {
    return iconMap[iconName]?.emoji || '●'
  }

  /**
   * Obtient le texte alternatif pour une icône
   */
  const getIconAlt = (iconName: string): string => {
    return iconMap[iconName]?.alt || 'icon'
  }

  /**
   * Génère les props optimisées pour un composant Icon
   */
  const getIconProps = (iconName: string, fallback?: string) => {
    return {
      name: iconName,
      fallback: fallback || getIconFallback(iconName),
      alt: getIconAlt(iconName),
      role: 'img',
      'aria-label': getIconAlt(iconName)
    }
  }

  /**
   * Vérifie si le module @nuxt/icon est disponible
   */
  const checkIconModule = () => {
    try {
      // Vérification de la disponibilité du module
      return process.client && window.nuxt?.app?.config?.icon !== undefined
    } catch {
      return false
    }
  }

  /**
   * Rendu conditionnel d'icône avec fallback intelligent
   */
  const renderIcon = (iconName: string, classes: string = '', fallback?: string) => {
    const props = getIconProps(iconName, fallback)
    const iconClasses = `inline-block ${classes}`
    
    return {
      component: 'Icon',
      props: {
        ...props,
        class: iconClasses
      }
    }
  }

  return {
    iconMap,
    isIconAvailable,
    getIconFallback,
    getIconAlt,
    getIconProps,
    checkIconModule,
    renderIcon
  }
}

/**
 * Types TypeScript pour le système d'icônes
 */
export interface IconConfig {
  emoji: string
  alt: string
}

export interface IconProps {
  name: string
  fallback?: string
  alt?: string
  role?: string
  'aria-label'?: string
}
