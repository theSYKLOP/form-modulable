<!--
  FieldItem.vue - Individual form field component
  
  @description Renders different types of form fields based on the field type.
  Supports all FormFieldType values with proper validation and styling.
  Uses v-model pattern for two-way data binding.
  
  @example
  <FieldItem 
    :field="fieldConfig" 
    :value="fieldValue" 
    @input="onFieldChange"
  />
-->
<template>
  <div class="field-item">
    <!-- Field container -->
    <div
      class="field-container"
      :class="{
        'field-container--full': field.width === 'full',
        'field-container--half': field.width === 'half',
        'field-container--third': field.width === 'third',
        'field-container--error': hasError,
        'field-container--disabled': field.disabled,
        'field-container--readonly': field.readonly
      }"
    >
      <!-- Label slot -->
      <div v-if="field.label" class="field-label-container">
        <slot name="label">
          <label
            :for="fieldId"
            class="field-label"
            :class="{ 'field-label--required': isRequired }"
          >
            <Icon v-if="field.icon" :name="field.icon" class="field-label-icon" />
            {{ field.label }}
            <span v-if="isRequired" class="field-required-indicator">*</span>
          </label>
        </slot>
      </div>

      <!-- Input container -->
      <div class="field-input-container">
        <slot name="input">
          <!-- Text input -->
          <input
            v-if="isTextInput"
            :id="fieldId"
            :type="field.type"
            :value="modelValue"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            :readonly="field.readonly"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :accept="field.accept"
            :multiple="field.multiple"
            class="field-input"
            @input="onInput"
            @blur="onBlur"
            @focus="onFocus"
          />

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="fieldId"
            :value="modelValue"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            :readonly="field.readonly"
            :rows="field.rows || 3"
            class="field-textarea"
            @input="onInput"
            @blur="onBlur"
            @focus="onFocus"
          />

          <!-- Select -->
          <select
            v-else-if="field.type === 'select'"
            :id="fieldId"
            :value="modelValue"
            :disabled="field.disabled"
            :multiple="field.multiple"
            class="field-select"
            @change="onSelectChange"
            @blur="onBlur"
            @focus="onFocus"
          >
            <option
              v-if="field.placeholder && !field.multiple"
              value=""
              disabled
            >
              {{ field.placeholder }}
            </option>
            <option
              v-for="option in field.options"
              :key="option.value"
              :value="option.value"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </option>
          </select>

          <!-- Radio buttons -->
          <div
            v-else-if="field.type === 'radio'"
            class="field-radio-group"
          >
            <div
              v-for="option in field.options"
              :key="option.value"
              class="field-radio-item"
            >
              <input
                :id="`${fieldId}_${option.value}`"
                type="radio"
                :name="fieldId"
                :value="option.value"
                :checked="modelValue === option.value"
                :disabled="field.disabled || option.disabled"
                class="field-radio-input"
                @change="onRadioChange"
                @blur="onBlur"
                @focus="onFocus"
              />
              <label
                :for="`${fieldId}_${option.value}`"
                class="field-radio-label"
              >
                {{ option.label }}
                <span v-if="option.description" class="field-option-description">
                  {{ option.description }}
                </span>
              </label>
            </div>
          </div>

          <!-- Checkboxes -->
          <div
            v-else-if="field.type === 'checkbox'"
            class="field-checkbox-group"
          >
            <div
              v-for="option in field.options"
              :key="option.value"
              class="field-checkbox-item"
            >
              <input
                :id="`${fieldId}_${option.value}`"
                type="checkbox"
                :value="option.value"
                :checked="isChecked(option.value)"
                :disabled="field.disabled || option.disabled"
                class="field-checkbox-input"
                @change="onCheckboxChange"
                @blur="onBlur"
                @focus="onFocus"
              />
              <label
                :for="`${fieldId}_${option.value}`"
                class="field-checkbox-label"
              >
                {{ option.label }}
                <span v-if="option.description" class="field-option-description">
                  {{ option.description }}
                </span>
              </label>
            </div>
          </div>

          <!-- Switch -->
          <div
            v-else-if="field.type === 'switch'"
            class="field-switch-container"
          >
            <button
              type="button"
              :id="fieldId"
              :disabled="field.disabled"
              class="field-switch"
              :class="{ 'field-switch--active': modelValue }"
              @click="onSwitchToggle"
              @blur="onBlur"
              @focus="onFocus"
            >
              <span class="field-switch-handle" />
            </button>
          </div>

          <!-- Range -->
          <div
            v-else-if="field.type === 'range'"
            class="field-range-container"
          >
            <input
              :id="fieldId"
              type="range"
              :value="modelValue"
              :min="field.min || 0"
              :max="field.max || 100"
              :step="field.step || 1"
              :disabled="field.disabled"
              class="field-range"
              @input="onInput"
              @blur="onBlur"
              @focus="onFocus"
            />
            <div class="field-range-value">
              {{ modelValue || field.defaultValue || 0 }}
            </div>
          </div>
        </slot>

        <!-- Prefix/Suffix -->
        <div v-if="field.prefix" class="field-prefix">{{ field.prefix }}</div>
        <div v-if="field.suffix" class="field-suffix">{{ field.suffix }}</div>
      </div>

      <!-- Help text slot -->
      <div v-if="field.helpText || hasError" class="field-help-container">
        <slot name="helpText">
          <p v-if="hasError" class="field-error-text">
            <Icon name="i-heroicons-exclamation-triangle" class="field-error-icon" />
            {{ errorMessage }}
          </p>
          <p v-else-if="field.helpText" class="field-help-text">
            {{ field.helpText }}
          </p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { StepFormField } from '~/types/form'

/**
 * FieldItem - Individual form field component
 * 
 * @component
 * @example
 * <FieldItem :field="fieldConfig" :value="fieldValue" @input="onFieldChange" />
 */
export default {
  name: 'FieldItem',

  props: {
    /**
     * Field configuration object
     */
    field: {
      type: Object as PropType<StepFormField>,
      required: true
    },

    /**
     * Current field value
     */
    value: {
      type: [String, Number, Array, Boolean] as PropType<string | number | Array<unknown> | boolean | null>,
      default: null
    },    /**
     * Error message for this field
     */
    error: {
      type: String,
      default: undefined
    }
  },

  emits: ['input', 'focus', 'blur'],

  data() {
    return {
      /** Internal focus state */
      isFocused: false as boolean
    }
  },

  computed: {
    /**
     * Unique field ID
     */
    fieldId(): string {
      return `field_${this.field.id}`
    },

    /**
     * Current field value with fallback to default
     */
    modelValue(): string | number | Array<unknown> | boolean | null {
      return this.value !== null && this.value !== undefined 
        ? this.value 
        : this.field.defaultValue
    },

    /**
     * Whether this field is required
     */
    isRequired(): boolean {
      return this.field.validation?.required === true
    },

    /**
     * Whether this field has an error
     */
    hasError(): boolean {
      return Boolean(this.error)
    },

    /**
     * Error message to display
     */
    errorMessage(): string {
      return this.error || ''
    },

    /**
     * Whether this is a text-based input
     */
    isTextInput(): boolean {
      const textTypes = [
        'text', 'email', 'password', 'number', 'tel', 'url', 
        'date', 'datetime-local', 'file'
      ]
      return textTypes.includes(this.field.type)
    }
  },

  methods: {
    /**
     * Handle input change
     */
    onInput(event: Event): void {
      const target = event.target as HTMLInputElement
      let value: string | number | null = target.value

      // Type conversion for specific field types
      if (this.field.type === 'number' || this.field.type === 'range') {
        value = target.value ? Number(target.value) : null
      }

      this.$emit('input', value)
    },

    /**
     * Handle select change
     */
    onSelectChange(event: Event): void {
      const target = event.target as HTMLSelectElement
      let value: string | string[]

      if (this.field.multiple) {
        value = Array.from(target.selectedOptions, option => option.value)
      } else {
        value = target.value
      }

      this.$emit('input', value)
    },

    /**
     * Handle radio button change
     */
    onRadioChange(event: Event): void {
      const target = event.target as HTMLInputElement
      this.$emit('input', target.value)
    },

    /**
     * Handle checkbox change
     */
    onCheckboxChange(event: Event): void {
      const target = event.target as HTMLInputElement
      const value = target.value
      let newValue: string | string[] | boolean | null

      if (this.field.multiple) {
        const currentValue = Array.isArray(this.modelValue) ? this.modelValue : []
        if (target.checked) {
          newValue = [...currentValue, value]
        } else {
          newValue = currentValue.filter(v => v !== value)
        }
      } else {
        newValue = target.checked ? value : null
      }

      this.$emit('input', newValue)
    },

    /**
     * Handle switch toggle
     */
    onSwitchToggle(): void {
      this.$emit('input', !this.modelValue)
    },

    /**
     * Handle field focus
     */
    onFocus(event: Event): void {
      this.isFocused = true
      this.$emit('focus', event)
    },

    /**
     * Handle field blur
     */
    onBlur(event: Event): void {
      this.isFocused = false
      this.$emit('blur', event)
    },

    /**
     * Check if a checkbox option is checked
     */
    isChecked(value: string): boolean {
      if (this.field.multiple) {
        return Array.isArray(this.modelValue) && this.modelValue.includes(value)
      }
      return this.modelValue === value
    }
  }
}
</script>

<style scoped>
/* Field container */
.field-item {
  margin-bottom: 1rem;
}

.field-container {
  position: relative;
}

.field-container--full {
  width: 100%;
}

.field-container--half {
  width: 100%;
}

.field-container--third {
  width: 100%;
}

.field-container--quarter {
  width: 25%;
}

.field-container--error {
  border-color: #fca5a5;
}

.field-container--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-container--readonly {
  opacity: 0.75;
}

/* Label styles */
.field-label-container {
  margin-bottom: 0.5rem;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
}

.field-label--required {
  color: #111827;
}

.field-label-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  color: #6b7280;
}

.field-required-indicator {
  color: #ef4444;
  margin-left: 0.25rem;
}

/* Input container */
.field-input-container {
  position: relative;
}

/* Base input styles */
.field-input,
.field-textarea,
.field-select {
  display: block;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.field-input:focus,
.field-textarea:focus,
.field-select:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-input:disabled,
.field-textarea:disabled,
.field-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.field-textarea {
  resize: vertical;
}

/* Radio and checkbox styles */
.field-radio-group,
.field-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-radio-item,
.field-checkbox-item {
  display: flex;
  align-items: flex-start;
}

.field-radio-input,
.field-checkbox-input {
  margin-top: 0.25rem;
  margin-right: 0.75rem;
  border-color: #d1d5db;
  color: #3b82f6;
}

.field-radio-input:focus,
.field-checkbox-input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-radio-label,
.field-checkbox-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.field-option-description {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Switch styles */
.field-switch-container {
  display: flex;
  align-items: center;
}

.field-switch {
  position: relative;
  display: inline-flex;
  height: 1.5rem;
  width: 2.75rem;
  align-items: center;
  border-radius: 9999px;
  background-color: #e5e7eb;
  transition: background-color 0.2s;
  cursor: pointer;
  border: none;
}

.field-switch:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-switch--active {
  background-color: #3b82f6;
}

.field-switch-handle {
  display: inline-block;
  height: 1rem;
  width: 1rem;
  transform: translateX(0.25rem);
  border-radius: 9999px;
  background-color: white;
  transition: transform 0.2s;
}

.field-switch--active .field-switch-handle {
  transform: translateX(1.5rem);
}

/* Range styles */
.field-range-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.field-range {
  flex: 1;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  appearance: none;
  cursor: pointer;
}

.field-range::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  background-color: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

.field-range::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  background-color: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.field-range-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  min-width: 3rem;
  text-align: center;
}

/* Prefix/Suffix */
.field-prefix,
.field-suffix {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
  height: 100%;
}

.field-prefix {
  left: 0;
}

.field-suffix {
  right: 0;
}

/* Help text and errors */
.field-help-container {
  margin-top: 0.5rem;
}

.field-help-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.field-error-text {
  color: #ef4444;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.field-error-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}
</style>

