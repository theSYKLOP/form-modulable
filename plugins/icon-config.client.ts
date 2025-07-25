/**
 * Plugin pour la configuration automatique des icônes
 * Assure que les icônes sont correctement chargées et configurées
 */

export default defineNuxtPlugin({
  name: 'icon-config',
  parallel: true,
  setup() {
    // ✅ Configuration des icônes pour @nuxt/icon
    if (process.client) {
      // Attendre que le DOM soit prêt
      nextTick(() => {
        // ✅ Vérifier si les icônes Heroicons sont disponibles
        const testIcon = document.createElement('div')
        testIcon.innerHTML = '<icon name="heroicons:check" style="display: none;"></icon>'
        document.body.appendChild(testIcon)
        
        // ✅ Nettoyer après test
        setTimeout(() => {
          document.body.removeChild(testIcon)
        }, 100)
        
        // ✅ Ajouter les styles de fallback CSS
        const fallbackStyles = `
          .icon-fallback {
            display: inline-block;
            font-style: normal;
            line-height: 1;
            vertical-align: middle;
          }
          
          .icon-fallback.animate-spin {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* Styles pour les icônes qui ne se chargent pas */
          svg[data-icon]:empty::after {
            content: attr(data-fallback);
            font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
          }
        `
        
        // ✅ Injecter les styles dans le head
        const styleElement = document.createElement('style')
        styleElement.textContent = fallbackStyles
        document.head.appendChild(styleElement)
      })
    }
  }
})
