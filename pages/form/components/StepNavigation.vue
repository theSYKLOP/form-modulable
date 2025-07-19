<template>
  <div class="step-navigation">
    <div class="steps-container">
      <div 
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-item"
        :class="{ active: index === activeIndex }"
        @click="$emit('stepClick', index)"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-info">
          <div class="step-title">
            {{ step.title }}
            <Icon 
              v-if="step.apiConfig?.enabled"
              name="heroicons:link"
              class="api-indicator"
              :class="{ 'validation-required': step.apiConfig.validationRequired }"
            />
          </div>
          <div class="step-fields">{{ step.fields.length }} champs</div>
        </div>
        <div class="step-actions">
          <button @click.stop="$emit('stepEdit', step.id)" class="edit-btn">
            <Icon name="i-heroicons-pencil" />
          </button>
          <button 
            v-if="steps.length > 1"
            @click.stop="$emit('stepDelete', step.id)" 
            class="delete-btn"
          >
            <Icon name="i-heroicons-trash" />
          </button>
        </div>
      </div>
    </div>
    
    <button 
      v-if="steps.length < 10"
      @click="$emit('stepAdd')"
      class="add-step-btn"
    >
      <Icon name="i-heroicons-plus" />
      Ajouter une étape
    </button>
  </div>
</template>

<script setup lang="ts">
import type { FormStep } from '../../../types/form'

defineProps<{
  steps: FormStep[]
  activeIndex: number
}>()

defineEmits<{
  stepClick: [index: number]
  stepAdd: []
  stepDelete: [stepId: string]
  stepEdit: [stepId: string]
}>()
</script>

<style scoped>
.step-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.steps-container {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.step-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.step-item.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  font-size: 0.75rem;
  font-weight: 600;
}

.step-item.active .step-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.step-title {
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.api-indicator {
  width: 1rem;
  height: 1rem;
  color: #10b981;
}

.api-indicator.validation-required {
  color: #f59e0b;
}

.step-fields {
  font-size: 0.75rem;
  opacity: 0.7;
}

.step-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.step-item:hover .step-actions {
  opacity: 1;
}

.edit-btn,
.delete-btn {
  padding: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.1);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.add-step-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px dashed #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.add-step-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>