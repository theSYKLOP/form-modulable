<template>
  <div v-if="isVisible" class="field-renderer" :class="[field.class, field.width || 'full', { preview: isPreview }]">
    <div class="field-header" v-if="showLabels !== false">
      <label class="field-label" :for="field.id">
        <span v-if="field.icon" class="field-icon">
          <Icon :name="field.icon" />
        </span>
        {{ field.label }}
        <span v-if="field.validation?.required || field.required" class="required">*</span>
      </label>
      <div v-if="isBuilder" class="field-actions">
        <button @click="emit('click', field.id)" class="action-btn edit">
          <Icon name="i-heroicons-pencil" />
        </button>
        <button @click="emit('duplicate', field.id)" class="action-btn">
          <Icon name="i-heroicons-document-duplicate" />
        </button>
        <button @click="emit('delete', field.id)" class="action-btn delete">
          <Icon name="i-heroicons-trash" />
        </button>
      </div>
    </div>

    <div class="field-input-wrapper">
      <span v-if="field.prefix" class="field-affix prefix">{{ field.prefix }}</span>
      
      <div class="field-input">
      <!-- Input de base -->
      <input
        v-if="['text', 'email', 'password', 'number', 'tel', 'url'].includes(field.type)"
        :type="field.type"
        :value="currentValue"
        :placeholder="field.placeholder"
        :disabled="isFieldDisabled"
        :min="field.type === 'number' ? field.min : undefined"
        :max="field.type === 'number' ? field.max : undefined"
        :step="field.type === 'number' ? field.step : undefined"
        @input="updateValue"
        class="form-input"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :value="currentValue"
        :placeholder="field.placeholder"
        :disabled="isFieldDisabled"
        :rows="field.rows || 4"
        @input="updateValue"
        class="form-textarea"
      />

      <!-- Select -->
      <select
        v-else-if="field.type === 'select'"
        :value="currentValue"
        :disabled="isFieldDisabled"
        :multiple="field.multiple"
        @change="updateValue"
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
        :value="currentValue"
        :disabled="isFieldDisabled"
        multiple
        @change="updateValue"
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
            :checked="currentValue === option.value"
            :disabled="isFieldDisabled"
            @change="updateValue"
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
            :checked="Array.isArray(currentValue) ? currentValue.includes(option.value) : currentValue === option.value"
            :disabled="isFieldDisabled"
            @change="updateValue"
            class="checkbox-input"
          />
          <span class="checkbox-label">{{ option.label }}</span>
        </label>
      </div>

      <!-- Date -->
      <input
        v-else-if="['date', 'datetime-local'].includes(field.type)"
        :type="field.type"
        :disabled="isFieldDisabled"
        class="form-input"
      />

      <!-- File -->
      <input
        v-else-if="field.type === 'file'"
        type="file"
        :accept="field.accept"
        :multiple="field.multiple"
        :disabled="isFieldDisabled"
        class="form-input"
      />

      <!-- Switch -->
      <label v-else-if="field.type === 'switch'" class="switch">
        <input 
          type="checkbox"
          :disabled="isFieldDisabled"
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
        :disabled="isFieldDisabled"
        class="form-range"
      />
    </div>
      
      <span v-if="field.suffix" class="field-affix suffix">{{ field.suffix }}</span>
    </div>

    <div v-if="field.helpText" class="field-help">
      {{ field.helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormFieldData, ConditionalLogic } from '../../../types/form'

interface Props {
  field: FormFieldData
  value?: any
  isBuilder?: boolean
  isPreview?: boolean
  formValues?: Record<string, any>
  showLabels?: boolean
  disabled?: boolean
    conditionalLogic?: {
      enabled: boolean
      action: 'show' | 'hide'
      logicalOperator: 'AND' | 'OR'
      rules: Array<{
        fieldId: string
        operator: string
        value: any
      }>
    }
  }
 

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: any]
  delete: [fieldId: string]
  duplicate: [fieldId: string]
  click: [fieldId: string]
}>()

// Mode builder ou preview
const isBuilder = computed(() => props.isBuilder ?? true)

// Calculer si le champ doit être désactivé
const isFieldDisabled = computed(() => {
  // En mode preview, toujours permettre l'interaction
  if (props.isPreview) return props.disabled || false
  // En mode builder, toujours désactiver
  return isBuilder.value || props.disabled || false
})

// Valeur courante du champ
const currentValue = computed({
  get: () => props.value ?? props.field.defaultValue ?? '',
  set: (value) => emit('update:value', value)
})

// Méthode pour mettre à jour la valeur
const updateValue = (event: Event) => {
  // Permettre les modifications en mode preview même si isBuilder est true
  if (isBuilder.value && !props.isPreview) return;
  
  const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  let newValue: any = target.value;
  
  // Gestion spéciale pour les checkboxes multiples
  if (props.field.type === 'checkbox' && props.field.options && props.field.options.length > 1) {
    const currentValues = Array.isArray(currentValue.value) ? currentValue.value : [];
    if ((target as HTMLInputElement).checked) {
      newValue = [...currentValues, target.value];
    } else {
      newValue = currentValues.filter((v: any) => v !== target.value);
    }
  }
  // Gestion spéciale pour select multiple
  else if (props.field.type === 'multiselect') {
    const select = target as HTMLSelectElement;
    newValue = Array.from(select.selectedOptions).map(option => option.value);
  }
  // Conversion selon le type
  else if (props.field.type === 'number') {
    newValue = newValue === '' ? null : Number(newValue);
  } else if (props.field.type === 'checkbox' && (!props.field.options || props.field.options.length <= 1)) {
    newValue = (target as HTMLInputElement).checked;
  }
  
  currentValue.value = newValue;
};

// Détermine si le champ devrait être affiché en fonction de sa logique conditionnelle
const isVisible = computed(() => {
  if (!props.field.conditionalLogic?.enabled || !props.formValues) {
    return true
  }
  
  const { conditionalLogic } = props.field
  const { rules, action, logicalOperator } = conditionalLogic
  
  if (!rules || rules.length === 0) {
    return true
  }
  
  const results = rules.map((rule) => {
    // S'assurer que formValues existe
    const fieldValue = props.formValues?.[rule.targetFieldId]
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value
      case 'not_equals':
        return fieldValue !== rule.value
      case 'contains':
        return String(fieldValue || '').includes(String(rule.value || ''))
      case 'not_contains':
        return !String(fieldValue || '').includes(String(rule.value || ''))
      case 'empty':
        return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)
      case 'not_empty':
        return !!fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0)
      case 'greater_than':
        return Number(fieldValue) > Number(rule.value)
      case 'less_than':
        return Number(fieldValue) < Number(rule.value)
      default:
        return true
    }
  })
  
  const conditionMet = logicalOperator === 'AND' 
    ? results.every(Boolean) 
    : results.some(Boolean)
  
  return action === 'show' ? conditionMet : !conditionMet
})
</script>

<style scoped>
.field-renderer {
  width: 100%;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.field-renderer.half {
  width: 48%;
  display: inline-block;
}

.field-renderer.third {
  width: 32%;
  display: inline-block;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
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

.action-btn.edit:hover {
  background: #eef6ff;
  color: #3b82f6;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.field-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.field-affix {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  color: #6b7280;
  user-select: none;
  pointer-events: none;
}

.field-affix.prefix {
  left: 0.75rem;
}

.field-affix.suffix {
  right: 0.75rem;
}

.field-input {
  flex: 1;
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