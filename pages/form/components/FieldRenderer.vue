<template>
  <div class="field-renderer">
    <div class="field-header">
      <label class="field-label">
        {{ field.label }}
        <span v-if="field.validation?.required || field.required" class="required">*</span>
      </label>
      <div v-if="isBuilder" class="field-actions">
        <button @click="$emit('duplicate')" class="action-btn">
          <Icon name="i-heroicons-document-duplicate" />
        </button>
        <button @click="$emit('delete')" class="action-btn delete">
          <Icon name="i-heroicons-trash" />
        </button>
      </div>
    </div>

    <div class="field-input">
      <!-- Input de base -->
      <input
        v-if="['text', 'email', 'password', 'number', 'tel', 'url'].includes(field.type)"
        :type="field.type"
        :placeholder="field.placeholder"
        :disabled="isBuilder"
        :min="field.type === 'number' ? field.min : undefined"
        :max="field.type === 'number' ? field.max : undefined"
        :step="field.type === 'number' ? field.step : undefined"
        class="form-input"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :placeholder="field.placeholder"
        :disabled="isBuilder"
        :rows="field.rows || 4"
        class="form-textarea"
      />

      <!-- Select -->
      <select
        v-else-if="field.type === 'select'"
        :disabled="isBuilder"
        :multiple="field.multiple"
        class="form-select"
      >
        <option value="">{{ field.placeholder || 'Choisir...' }}</option>
        <option 
          v-for="option in field.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Multiselect -->
      <select
        v-else-if="field.type === 'multiselect'"
        :disabled="isBuilder"
        multiple
        class="form-select"
      >
        <option 
          v-for="option in field.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Radio -->
      <div v-else-if="field.type === 'radio'" class="radio-group">
        <label 
          v-for="option in field.options"
          :key="option.value"
          class="radio-option"
        >
          <input 
            type="radio"
            :name="field.id"
            :value="option.value"
            :disabled="isBuilder"
            class="radio-input"
          />
          <span class="radio-label">{{ option.label }}</span>
        </label>
      </div>

      <!-- Checkbox -->
      <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
        <label 
          v-for="option in field.options"
          :key="option.value"
          class="checkbox-option"
        >
          <input 
            type="checkbox"
            :value="option.value"
            :disabled="isBuilder"
            class="checkbox-input"
          />
          <span class="checkbox-label">{{ option.label }}</span>
        </label>
      </div>

      <!-- Date -->
      <input
        v-else-if="['date', 'datetime-local'].includes(field.type)"
        :type="field.type"
        :disabled="isBuilder"
        class="form-input"
      />

      <!-- File -->
      <input
        v-else-if="field.type === 'file'"
        type="file"
        :accept="field.accept"
        :multiple="field.multiple"
        :disabled="isBuilder"
        class="form-input"
      />

      <!-- Switch -->
      <label v-else-if="field.type === 'switch'" class="switch">
        <input 
          type="checkbox"
          :disabled="isBuilder"
          class="switch-input"
        />
        <span class="switch-slider"></span>
      </label>

      <!-- Range -->
      <input
        v-else-if="field.type === 'range'"
        type="range"
        :min="field.min || 0"
        :max="field.max || 100"
        :step="field.step || 1"
        :disabled="isBuilder"
        class="form-range"
      />
    </div>

    <div v-if="field.helpText" class="field-help">
      {{ field.helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormField } from '../types/form'

defineProps<{
  field: FormField
  isBuilder?: boolean
}>()

defineEmits<{
  update: [data: Partial<FormField>]
  delete: []
  duplicate: []
}>()
</script>

<style scoped>
.field-renderer {
  width: 100%;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.field-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  padding: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.25rem;
  color: #6b7280;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.field-input {
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  min-height: 4rem;
  resize: vertical;
}

.form-select[multiple] {
  min-height: 6rem;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-input,
.checkbox-input {
  margin: 0;
}

.radio-label,
.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
}

.switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.switch-input {
  display: none;
}

.switch-slider {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background: #d1d5db;
  border-radius: 9999px;
  transition: background 0.2s;
}

.switch-slider::before {
  content: '';
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.switch-input:checked + .switch-slider {
  background: #3b82f6;
}

.switch-input:checked + .switch-slider::before {
  transform: translateX(1.5rem);
}

.form-range {
  width: 100%;
  height: 0.5rem;
  background: #d1d5db;
  border-radius: 0.25rem;
  appearance: none;
  cursor: pointer;
}

.form-range::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.field-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>