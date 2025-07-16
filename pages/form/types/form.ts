export interface FormField {
  id: string
  type: FormFieldType
  label: string
  placeholder?: string
  helpText?: string
  defaultValue?: any
  validation?: FieldValidation
  options?: FieldOption[]
  width?: 'full' | 'half' | 'third'
  order: number
  stepId: string
  required?: boolean
  apiConfig?: ApiConfig
  
  // Propriétés spécifiques aux champs
  min?: number        // Pour number, range
  max?: number        // Pour number, range
  accept?: string     // Pour file
  step?: number       // Pour number, range
  multiple?: boolean  // Pour file, select
  rows?: number       // Pour textarea
}

// ...existing code...

export interface FormStep {
  id: string
  title: string
  description?: string
  order: number
  fields: FormField[]
}

export interface FormConfig {
  id: string
  title: string
  description?: string
  steps: FormStep[]
  layout: 'VERTICAL' | 'HORIZONTAL'
  spacing: 'COMPACT' | 'NORMAL' | 'RELAXED'
}

export type FormFieldType = 
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox'
  | 'date' | 'datetime-local' | 'file' | 'switch' | 'range'

export interface FieldTemplate {
  type: FormFieldType
  label: string
  icon: string
  category: 'input' | 'select' | 'date' | 'file' | 'control'
  hasOptions?: boolean
  defaultProps?: Partial<FormField>
}

export interface ApiConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  headers?: Record<string, string>
  params?: Record<string, any>
}

export interface FieldOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  email?: boolean
}