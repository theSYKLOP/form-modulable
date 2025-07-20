/**
 * ✅ Utilitaires helper pour les performances
 */

// ✅ Formatage optimisé des dates
export const formatDate = (date: string | Date, locale: string = 'fr-FR'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj)
  } catch {
    return 'Date invalide'
  }
}

// ✅ Formatage optimisé des nombres
export const formatNumber = (num: number, locale: string = 'fr-FR'): string => {
  return new Intl.NumberFormat(locale).format(num)
}

// ✅ Validation rapide des emails
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ✅ Génération d'ID optimisée
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// ✅ Deep clone optimisé
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const cloned = {} as T
    Object.keys(obj as object).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key])
    })
    return cloned
  }
  return obj
}

// ✅ Sanitization rapide
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// ✅ Génération de classes CSS conditionnelles
export const cn = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// ✅ Truncate optimisé
export const truncate = (text: string, length: number = 100): string => {
  if (text.length <= length) return text
  return text.substring(0, length).trimEnd() + '...'
}

// ✅ Conversion de taille de fichier
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// ✅ Capitalisation optimisée
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
