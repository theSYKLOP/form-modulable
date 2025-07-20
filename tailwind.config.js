/** @type {import('tailwindcss').Config} */
module.exports = {
  // ✅ Configuration optimisée pour les performances
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  
  // ✅ Mode JIT pour des performances optimales
  mode: 'jit',
  
  // ✅ Thème optimisé avec variables CSS
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          500: '#6b7280',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      // ✅ Tailles optimisées pour le responsive
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
  },
  
  // ✅ Plugins optimisés pour les performances
  plugins: [
    // Plugin pour les utilitaires de performance
    function({ addUtilities }) {
      const performanceUtilities = {
        '.gpu-accelerated': {
          'transform': 'translateZ(0)',
          'will-change': 'transform',
        },
        '.smooth-scroll': {
          'scroll-behavior': 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
        '.critical-render': {
          'contain': 'layout style paint',
        },
        '.loading-skeleton': {
          'background': 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          'background-size': '200% 100%',
          'animation': 'loading 1.5s infinite',
        }
      }
      addUtilities(performanceUtilities)
    }
  ],
  
  // ✅ Optimisation de la purge CSS
  safelist: [
    // Classes critiques à toujours inclure
    'animate-fade-in',
    'animate-slide-up',
    'loading-skeleton',
    'gpu-accelerated',
    'smooth-scroll',
    // Classes d'état dynamiques
    /^(bg|text|border)-(red|green|yellow|blue)-(100|500|600)$/,
    // Classes de grille responsive
    /^(grid-cols|col-span)-(1|2|3|4|6|12)$/,
  ],
}
