<template>
  <div class="form-preview">
    <div class="preview-container">
      <div v-if="!formConfig" class="preview-empty">
        <p>Aucune donnée de formulaire à prévisualiser</p>
      </div>
      <div v-else class="preview-content">
        <h2>{{ formConfig.title }}</h2>
        <p v-if="formConfig.description">{{ formConfig.description }}</p>
        <!-- Contenu à implémenter ultérieurement -->
        <p>Aperçu du formulaire (à implémenter)</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  formConfig: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.form-preview {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.preview-container {
  padding: 1.5rem;
}

.preview-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #6b7280;
}

.preview-content h2 {
  margin-top: 0;
  font-size: 1.5rem;
  color: #1f2937;
}
</style>
