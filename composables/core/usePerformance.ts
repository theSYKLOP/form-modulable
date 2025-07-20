/**
 * ✅ Composable pour l'optimisation des performances
 */
export const usePerformance = () => {
  // ✅ Lazy loading intelligent des composants
  const lazyComponent = (componentImport: () => Promise<any>) => {
    return defineAsyncComponent({
      loader: componentImport,
      loadingComponent: defineComponent({
        template: '<div class="loading-skeleton h-20 w-full rounded animate-pulse"></div>'
      }),
      errorComponent: defineComponent({
        template: '<div class="text-red-500 p-4">Erreur de chargement du composant</div>'
      }),
      delay: 100,
      timeout: 10000
    })
  }
  
  // ✅ Debounce optimisé pour les performances
  const useOptimizedDebounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300
  ) => {
    return useDebounceFn(fn, delay, { maxWait: delay * 3 })
  }
  
  // ✅ Throttle pour les événements de scroll
  const useScrollThrottle = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 16
  ) => {
    return useThrottleFn(fn, delay)
  }
  
  // ✅ Observer d'intersection optimisé
  const useIntersectionObserver = (
    target: Ref<HTMLElement | null>,
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) => {
    const observer = ref<IntersectionObserver | null>(null)
    
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    }
    
    const startObserving = () => {
      if (!process.client || !target.value) return
      
      observer.value = new IntersectionObserver(callback, defaultOptions)
      observer.value.observe(target.value)
    }
    
    const stopObserving = () => {
      if (observer.value) {
        observer.value.disconnect()
        observer.value = null
      }
    }
    
    onMounted(() => {
      nextTick(startObserving)
    })
    
    onBeforeUnmount(() => {
      stopObserving()
    })
    
    return {
      startObserving,
      stopObserving
    }
  }
  
  // ✅ Préchargement intelligent des ressources
  const preloadRoute = (route: string) => {
    if (process.client) {
      preloadRouteComponents(route).catch(() => {
        // Gestion silencieuse des erreurs de préchargement
      })
    }
  }
  
  // ✅ Optimisation des images
  const optimizeImage = (
    src: string,
    options?: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'jpg' | 'png'
    }
  ) => {
    const { width = 800, height, quality = 80, format = 'webp' } = options || {}
    
    // Simulation d'une optimisation d'image (à adapter selon votre CDN)
    if (src.startsWith('http')) {
      return `${src}?w=${width}&q=${quality}&f=${format}${height ? `&h=${height}` : ''}`
    }
    return src
  }
  
  // ✅ Cache en mémoire avec TTL
  const useMemoryCache = <T>(key: string, ttl: number = 300000) => { // 5 minutes par défaut
    const cache = new Map<string, { data: T; expires: number }>()
    
    const get = (): T | null => {
      const item = cache.get(key)
      if (!item) return null
      
      if (Date.now() > item.expires) {
        cache.delete(key)
        return null
      }
      
      return item.data
    }
    
    const set = (data: T) => {
      cache.set(key, {
        data,
        expires: Date.now() + ttl
      })
    }
    
    const clear = () => {
      cache.delete(key)
    }
    
    return { get, set, clear }
  }
  
  // ✅ Performance monitoring
  const measurePerformance = (name: string, fn: () => void) => {
    if (process.client && 'performance' in window) {
      const start = performance.now()
      fn()
      const end = performance.now()
      console.debug(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
    } else {
      fn()
    }
  }
  
  return {
    lazyComponent,
    useOptimizedDebounce,
    useScrollThrottle,
    useIntersectionObserver,
    preloadRoute,
    optimizeImage,
    useMemoryCache,
    measurePerformance
  }
}
