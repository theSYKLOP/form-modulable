/**
 * ✅ Composable pour une navigation optimisée entre layouts
 */
export const useOptimizedNavigation = () => {
  const route = useRoute()
  const router = useRouter()
  
  // ✅ Navigation intelligente avec gestion des layouts
  const navigateToAdmin = async (path = '/admin') => {
    try {
      // ✅ Redirection vers la page de chargement qui gère l'auth et les rôles
      const loadingPath = `/admin/loading?redirect=${encodeURIComponent(path)}`
      
      if (process.client) {
        // Préchargement de la page de loading
        await preloadRouteComponents('/admin/loading')
        
        // Navigation vers la page de chargement
        await router.push(loadingPath)
      } else {
        await router.push(loadingPath)
      }
    } catch (error) {
      console.error('Erreur navigation admin:', error)
      // Fallback vers la page de loading
      if (process.client) {
        window.location.href = `/admin/loading?redirect=${encodeURIComponent(path)}`
      }
    }
  }
  
  // ✅ Navigation vers les pages publiques
  const navigateToPublic = async (path: string) => {
    try {
      await router.push(path)
    } catch (error) {
      console.error('Erreur navigation:', error)
      if (process.client) {
        window.location.href = path
      }
    }
  }
  
  // ✅ Indicateur de chargement réutilisable
  const showLoadingIndicator = (message = 'Chargement...') => {
    if (!process.client) return
    
    // Supprimer l'indicateur existant
    const existing = document.getElementById('navigation-loader')
    if (existing) existing.remove()
    
    const loadingIndicator = document.createElement('div')
    loadingIndicator.id = 'navigation-loader'
    loadingIndicator.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(4px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 32px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        ">
          <div style="
            width: 24px;
            height: 24px;
            border: 3px solid #3b82f6;
            border-top: 3px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          <span style="
            color: #374151;
            font-weight: 500;
            font-size: 16px;
          ">${message}</span>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      </style>
    `
    
    document.body.appendChild(loadingIndicator)
    
    // Auto-nettoyage après 10 secondes max
    setTimeout(() => {
      const indicator = document.getElementById('navigation-loader')
      if (indicator) indicator.remove()
    }, 10000)
  }
  
  // ✅ Navigation avec gestion du layout automatique
  const smartNavigate = async (path: string) => {
    if (path.startsWith('/admin')) {
      await navigateToAdmin(path)
    } else {
      await navigateToPublic(path)
    }
  }
  
  return {
    navigateToAdmin,
    navigateToPublic,
    smartNavigate,
    showLoadingIndicator
  }
}
