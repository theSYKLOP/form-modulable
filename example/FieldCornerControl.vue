<!--
  FieldCornerControl.vue - Interactive corner control for field resizing
  
  @description A corner button that allows interactive resizing of form fields
  with real-time preview and visual feedback.
  
  @example
  <FieldCornerControl
    :field="field"
    :is-active="isActive"
    @resize-start="onResizeStart"
    @resize="onResize"
    @resize-end="onResizeEnd"
  />
-->
<template>
  <div 
    class="field-corner-control"
    :class="{ 'field-corner-control--active': isActive }"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    title="Redimensionner le champ"
  >
    <!-- Resize icon -->
    <Icon 
      name="i-heroicons-arrows-right-left" 
      class="corner-icon"
    />
    
    <!-- Active indicator -->
    <div v-if="isActive" class="corner-indicator"></div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { StepFormField } from '~/types/form'

export default {
  name: 'FieldCornerControl',

  props: {
    /**
     * Field being controlled
     */
    field: {
      type: Object as PropType<StepFormField>,
      required: true
    },

    /**
     * Whether the control is active
     */
    isActive: {
      type: Boolean,
      default: false
    }
  },

  emits: ['resize-start', 'resize', 'resize-end'],  data() {
    return {
      isDragging: false,
      startX: 0,
      startWidth: 'full' as 'full' | 'half' | 'third',
      currentPreviewWidth: null as 'full' | 'half' | 'third' | null,
      widthSteps: ['third', 'half', 'full'] as const,
      widthLabels: {
        'third': '1/3 - Compact',
        'half': '1/2 - Moyen', 
        'full': 'Pleine largeur'
      } as const,
      widthPercentages: {
        'third': 33.33,
        'half': 50,
        'full': 100
      } as const
    }
  },

  methods: {
    /**
     * Handle mouse down
     */
    handleMouseDown(event: MouseEvent): void {
      event.preventDefault()
      event.stopPropagation()
      this.startResize(event.clientX)
    },

    /**
     * Handle touch start
     */
    handleTouchStart(event: TouchEvent): void {
      event.preventDefault()
      event.stopPropagation()

      if (event.touches.length > 0) {
        this.startResize(event.touches[0].clientX)
      }
    },

    /**
     * Start resize operation
     */
    startResize(startX: number): void {
      this.isDragging = true
      this.startX = startX
      this.startWidth = this.field.width || 'full'

      this.$emit('resize-start', {
        field: this.field,
        startWidth: this.startWidth
      })

      // Add event listeners
      document.addEventListener('mousemove', this.handleMouseMove)
      document.addEventListener('mouseup', this.handleMouseUp)
      document.addEventListener('touchmove', this.handleTouchMove)
      document.addEventListener('touchend', this.handleTouchEnd)

      // Prevent text selection
      document.body.style.userSelect = 'none'
    },

    /**
     * Handle mouse move during resize
     */
    handleMouseMove(event: MouseEvent): void {
      if (!this.isDragging) return
      this.handleResize(event.clientX)
    },

    /**
     * Handle touch move during resize
     */
    handleTouchMove(event: TouchEvent): void {
      if (!this.isDragging || event.touches.length === 0) return
      event.preventDefault()
      this.handleResize(event.touches[0].clientX)
    },    /**
     * Handle resize calculation with real-time preview
     */
    handleResize(currentX: number): void {
      const deltaX = currentX - this.startX
      const sensitivity = 35 // Sensibilité optimisée pour les 3 tailles
      
      const startIndex = this.widthSteps.indexOf(this.startWidth)
      const steps = Math.round(deltaX / sensitivity)
      const newIndex = Math.max(0, Math.min(this.widthSteps.length - 1, startIndex + steps))
      const newWidth = this.widthSteps[newIndex]

      // Mettre à jour la prévisualisation locale
      this.currentPreviewWidth = newWidth

      // Émettre la prévisualisation en temps réel avec plus d'informations
      this.$emit('resize', {
        field: this.field,
        width: newWidth,
        widthLabel: this.widthLabels[newWidth],
        widthPercentage: this.widthPercentages[newWidth],
        deltaX,
        steps,
        startWidth: this.startWidth,
        preview: true
      })
    },

    /**
     * Handle mouse up (end resize)
     */
    handleMouseUp(): void {
      this.endResize()
    },

    /**
     * Handle touch end (end resize)
     */
    handleTouchEnd(): void {
      this.endResize()
    },    /**
     * End resize operation
     */
    endResize(): void {
      if (!this.isDragging) return

      this.isDragging = false

      // Remove event listeners
      document.removeEventListener('mousemove', this.handleMouseMove)
      document.removeEventListener('mouseup', this.handleMouseUp)
      document.removeEventListener('touchmove', this.handleTouchMove)
      document.removeEventListener('touchend', this.handleTouchEnd)

      // Restore text selection
      document.body.style.userSelect = ''

      // Émettre l'événement final avec la taille actuelle ou prévisualisée
      const finalWidth = this.currentPreviewWidth || this.field.width || 'full'
      this.$emit('resize-end', {
        field: this.field,
        width: finalWidth,
        widthLabel: this.widthLabels[finalWidth],
        widthPercentage: this.widthPercentages[finalWidth]
      })

      // Reset preview
      this.currentPreviewWidth = null
    }
  },

  beforeUnmount() {
    // Cleanup event listeners if component is destroyed during drag
    if (this.isDragging) {
      this.endResize()
    }
  }
}
</script>

<style scoped>
.field-corner-control {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field-corner-control:hover {
  transform: scale(1.1);
  border-color: #f59e0b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background: #fffbeb;
}

.field-corner-control--active {
  border-color: #f59e0b;
  background: #fef3c7;
}

.corner-icon {
  width: 12px;
  height: 12px;
  color: #f59e0b;
}

.corner-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

/* Resize cursor during drag */
.field-corner-control:active {
  cursor: ew-resize;
}

/* Enhanced visual feedback for the 3 predefined sizes */
.field-corner-control:hover .corner-icon {
  transform: scale(1.1);
}

.field-corner-control--active .corner-icon {
  animation: pulse-icon 1.5s infinite ease-in-out;
}

@keyframes pulse-icon {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* Smooth transitions for better UX */
.corner-icon {
  transition: all 0.2s ease-in-out;
}

/* Visual hints for the 3 width steps */
.field-corner-control::after {
  content: '';
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 3px;
  height: 3px;
  background: #f59e0b;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.field-corner-control:hover::after {
  opacity: 0.7;
}
</style>
