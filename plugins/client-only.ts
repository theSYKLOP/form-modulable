// ✅ Plugin côté client pour les optimisations de performance
export default defineNuxtPlugin(() => {
  // ✅ Optimisations de performance côté client uniquement
  if (process.client) {
    // Préchargement intelligent des routes
    const router = useRouter()
    const { $router } = useNuxtApp()
    
    // Observer d'intersection pour le lazy loading
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement
          const href = link.getAttribute('href')
          if (href && href.startsWith('/')) {
            // Précharger la route avec navigateTo
            preloadRouteComponents(href).catch(() => {
              // Gestion silencieuse des erreurs
            })
          }
        }
      })
    }
    
    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '50px'
    })
    
    // Observer les liens pour le préchargement
    const observeLinks = () => {
      const links = document.querySelectorAll('a[href^="/"]')
      links.forEach(link => observer.observe(link))
    }
    
    // Observer les changements de route
    router.afterEach(() => {
      nextTick(() => {
        observeLinks()
      })
    })
    
    // Initialiser l'observation
    onMounted(() => {
      observeLinks()
    })
    
    // ✅ Optimisation des images lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.classList.remove('loading-skeleton')
            imageObserver.unobserve(img)
          }
        }
      })
    })
    
    // ✅ Optimisation du scroll
    let scrollTimer: number | null = null
    const optimizeScroll = () => {
      document.body.style.pointerEvents = 'none'
      if (scrollTimer) clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(() => {
        document.body.style.pointerEvents = 'auto'
      }, 150)
    }
    
    window.addEventListener('scroll', optimizeScroll, { passive: true })
    
    // ✅ Nettoyage lors de la destruction
    onBeforeUnmount(() => {
      observer.disconnect()
      imageObserver.disconnect()
      window.removeEventListener('scroll', optimizeScroll)
      if (scrollTimer) clearTimeout(scrollTimer)
    })
    
    // ✅ Service Worker pour la mise en cache (si PWA)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Service worker non disponible
        })
      })
    }
  }
})
