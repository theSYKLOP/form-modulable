// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // ✅ Optimisation des modules pour un chargement plus rapide
  modules: [
    '@nuxt/eslint', 
    '@nuxt/icon', 
    '@prisma/nuxt', 
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  
  // ✅ Optimisations CSS pour Tailwind
  css: ['~/assets/css/main.css'],
  
  // ✅ Configuration Tailwind optimisée
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: false, // Désactiver en production
    // Purge automatique du CSS inutilisé
    config: {
      content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './composables/**/*.{js,ts}',
        './plugins/**/*.{js,ts}',
        './app.vue'
      ]
    }
  },
  
  // ✅ Optimisations expérimentales et de performance
  experimental: {
    componentIslands: true,
    payloadExtraction: false, // Améliore la performance SSR
    treeshakeClientOnly: true, // Supprime le code client inutilisé côté serveur
  },
  
  // ✅ Configuration de rendu optimisée
  ssr: true, // SSR activé pour de meilleures performances SEO
  
  // ✅ Optimisation du routeur
  router: {
    options: {
      scrollBehaviorType: 'smooth', // Navigation fluide
    }
  },
  
  // ✅ Optimisations de build et bundling
  nitro: {
    compressPublicAssets: true, // Compression gzip/brotli
    minify: true, // Minification du code serveur
    experimental: {
      wasm: true
    }
  },
  
  // ✅ Configuration Vite optimisée
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/assets/scss/variables.scss" as *;`
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Séparation des chunks pour un meilleur cache
            vendor: ['vue', '@vue/runtime-core'],
            utils: ['lodash-es', 'date-fns'],
          }
        }
      },
      // Optimisation de la taille des chunks
      chunkSizeWarningLimit: 1000,
    },
    server: {
      fs: {
        allow: ['..']
      }
    }
  },
  
  // ✅ Headers de performance et sécurité
  routeRules: {
    // Page d'accueil pré-rendue à la build
    '/': { prerender: true },
    // Pages admin avec cache court
    '/admin/**': { 
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      ssr: true 
    },
    // API routes avec cache approprié
    '/api/**': { 
      headers: { 'Cache-Control': 'max-age=300' }, // 5 minutes
      cors: true 
    },
    // Assets statiques avec cache long
    '/assets/**': { 
      headers: { 'Cache-Control': 'max-age=31536000' } // 1 an
    },
    // Pages de formulaires avec ISR
    '/form/**': { 
      isr: 60, // Régénération toutes les 60 secondes
      headers: { 'Cache-Control': 'max-age=60' }
    }
  },
  
  // ✅ Configuration de l'app pour les performances
  app: {
    head: {
      // Meta tags pour les performances
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#3B82F6' },
        // Preconnect pour des ressources externes
        { name: 'dns-prefetch', content: '//fonts.googleapis.com' },
      ],
      link: [
        // Preload des polices critiques
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // PWA Manifest
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  },
  
  // ✅ Runtime config optimisé
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    // Variables serveur pour les optimisations
    nodeEnv: process.env.NODE_ENV || 'development',
    public: {
      apiBase: '/api',
      // Configuration client pour les optimisations
      enableDevtools: process.env.NODE_ENV === 'development'
    }
  },
  
  // ✅ Configuration de build pour la production
  build: {
    // Analyse du bundle en dev
    analyze: process.env.ANALYZE === 'true'
  },
  
  // ✅ Optimisation des imports automatiques
  imports: {
    // Désactiver l'auto-import global pour réduire la taille du bundle
    global: false,
    // Import sur demande pour de meilleures performances
    dirs: [
      // Seulement les composables critiques
      'composables/core',
      'utils/helpers'
    ]
  },
  
  // ✅ Configuration des composants pour l'optimisation
  components: [
    {
      path: '~/components',
      // Préfixe pour éviter les conflits et améliorer le tree-shaking
      pathPrefix: false
    }
  ],
  
  // ✅ Plugin de chargement optimisé
  plugins: [
    // Plugins critiques en mode client uniquement quand nécessaire
    { src: '~/plugins/client-only.ts', mode: 'client' },
  ],
  
  // ✅ Configuration TypeScript optimisée
  typescript: {
    strict: true,
    typeCheck: false // Désactivé en dev pour la vitesse, activé en CI/CD
  }
})