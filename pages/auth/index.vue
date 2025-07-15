<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
    <!-- Background overlay pour améliorer le contraste -->
    <div class="absolute inset-0 bg-black/30"></div>
    
    <!-- Formes décoratives avec meilleur contraste -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
    <div class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/25 rounded-full translate-y-32 -translate-x-32 animate-bounce"></div>
    
    <!-- Particules flottantes plus subtiles -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        v-for="i in 15" 
        :key="i"
        class="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
        :style="{ 
          left: Math.random() * 100 + '%', 
          top: Math.random() * 100 + '%',
          animationDelay: Math.random() * 5 + 's',
          animationDuration: (Math.random() * 3 + 3) + 's'
        }"
      ></div>
    </div>

    <!-- Formulaires centrés avec meilleur contraste -->
    <div class="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 ring-1 ring-black/5">
        <!-- Transition entre les formulaires -->
        <div class="relative">
          <Transition
            :name="transitionName"
            mode="out-in"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @leave="onLeave"
          >
            <LoginForm 
              v-if="currentForm === 'login'"
              key="login"
              @switch-to-register="switchToRegister"
            />
            <RegisterForm 
              v-else
              key="register"
              @switch-to-login="switchToLogin"
            />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Layout auth
definePageMeta({
  layout: 'auth'
})

// Détection du formulaire initial via query params
const route = useRoute()
const currentForm = ref(route.query.form === 'register' ? 'register' : 'login')
const transitionName = ref('slide-right')

// Changer vers inscription
const switchToRegister = () => {
  transitionName.value = 'slide-left'
  currentForm.value = 'register'
  // Mettre à jour l'URL sans recharger la page
  navigateTo('/auth?form=register', { replace: true })
}

// Changer vers connexion
const switchToLogin = () => {
  transitionName.value = 'slide-right'
  currentForm.value = 'login'
  // Mettre à jour l'URL sans recharger la page
  navigateTo('/auth?form=login', { replace: true })
}

// Hooks d'animation
const onBeforeEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateX(50px)'
}

const onEnter = (el) => {
  el.style.transition = 'all 0.5s ease-out'
  el.style.opacity = '1'
  el.style.transform = 'translateX(0)'
}

const onLeave = (el) => {
  el.style.transition = 'all 0.5s ease-in'
  el.style.opacity = '0'
  el.style.transform = 'translateX(-50px)'
}

// Meta données dynamiques
useHead({
  title: computed(() => currentForm.value === 'login' ? 'Connexion - Form Modulable' : 'Inscription - Form Modulable'),
  meta: [
    { 
      name: 'description', 
      content: computed(() => currentForm.value === 'login' 
        ? 'Connectez-vous à votre compte Form Modulable' 
        : 'Créez votre compte Form Modulable gratuitement'
      )
    }
  ]
})
</script>

<style scoped>
/* Animations de transition améliorées */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

/* Animation des particules plus fluide */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-15px) rotate(180deg);
    opacity: 0.6;
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

/* Animations plus subtiles pour les formes décoratives */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-5px) scale(1.02);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.03);
    opacity: 0.25;
  }
}

/* Amélioration du focus et de l'accessibilité */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Responsive amélioré */
@media (max-width: 640px) {
  .animate-float {
    animation-duration: 6s;
  }
}

/* Réduction des animations pour les utilisateurs qui préfèrent moins de mouvement */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-bounce,
  .animate-pulse {
    animation: none;
  }
  
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .slide-right-enter-from,
  .slide-left-enter-from {
    transform: none;
  }
  
  .slide-right-leave-to,
  .slide-left-leave-to {
    transform: none;
  }
}
</style>