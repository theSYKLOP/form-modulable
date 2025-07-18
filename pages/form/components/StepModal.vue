<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ step ? 'Modifier l\'étape' : 'Nouvelle étape' }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <Icon name="heroicons:x-mark" />
        </button>
      </div>
      <div class="modal-body">
        <!-- Contenu à implémenter ultérieurement -->
        <p>Fonctionnalité à venir</p>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-btn">Annuler</button>
        <button @click="$emit('save', {})" class="save-btn">Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  step: {
    type: Object,
    default: null
  }
})

defineEmits(['close', 'save'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
}

.save-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}
</style>
