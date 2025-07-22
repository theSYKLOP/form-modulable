export type FieldWidth = 'full' | 'half' | 'third' | 'quarter';
export type FieldPosition = 'default' | 'left' | 'right' | 'center';

export interface FormFieldData {
  id: string
  name: string
  type: FormFieldType
  label: string
  placeholder?: string
  helpText?: string
  defaultValue?: any
  validation?: FieldValidation
  options?: FormFieldOption[]
  width?: FieldWidth
  order: number
  stepId: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  class?: string
  icon?: string
  prefix?: string
  suffix?: string
  
  // Support pour la logique conditionnelle
  conditionalLogic?: ConditionalLogic | null
  
  // Configuration API
  hasApi?: boolean
  apiConfig?: ApiConfig
  
  // Propriétés spécifiques aux champs
  min?: number        // Pour number, range
  max?: number        // Pour number, range
  accept?: string     // Pour file
  step?: number       // Pour number, range
  multiple?: boolean  // Pour file, select
  rows?: number       // Pour textarea
  position?: FieldPosition
}

// Pour rétrocompatibilité
export interface FormField extends FormFieldData {}

// ...existing code...

export interface ApiFieldMapping {
  fieldId: string
  parameterName: string
  fieldLabel?: string // Pour l'affichage dans l'interface
}

export interface StepApiConfig {
  enabled: boolean
  endpoint: string
  method: 'POST' | 'GET'
  headers?: Record<string, string>
  staticParams?: Record<string, any> // Paramètres statiques
  fieldMappings: ApiFieldMapping[] // Mapping champs -> paramètres API
  validationRequired?: boolean // Si true, l'étape ne peut pas être validée sans succès API
  successMessage?: string
  errorMessage?: string
}

export interface FormStep {
  id: string
  title: string
  description?: string
  order: number
  fields: FormField[]
  apiConfig?: StepApiConfig | null // ✅ Permettre null explicitement
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
  responsePath?: string
  labelKey?: string
  valueKey?: string
  cacheTime?: number
  headers?: Record<string, string>
  params?: Record<string, any>
}

export interface FormFieldOption {
  label: string
  value: string | number
  disabled?: boolean
}

// Pour rétrocompatibilité
export interface FieldOption extends FormFieldOption {}

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  email?: boolean
}

export interface ConditionalRule {
  targetFieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'empty' | 'not_empty' | 'greater_than' | 'less_than'
  value: any
}

export interface ConditionalLogic {
  enabled: boolean
  action: 'show' | 'hide' | 'require' | 'disable'
  logicalOperator: 'AND' | 'OR'
  rules: ConditionalRule[]
}

// ✅ Interface principale pour le formulaire basée sur le modèle Prisma
export interface Form {
  id: string
  title: string
  description?: string | null
  mode: 'EDIT' | 'VIEW'
  submitButtonText?: string | null
  cancelButtonText?: string | null
  resetButtonText?: string | null
  validateOnSubmit: boolean
  validateOnBlur: boolean
  validateOnChange: boolean
  layout: 'VERTICAL' | 'HORIZONTAL'
  spacing: 'COMPACT' | 'NORMAL' | 'RELAXED'
  isPublished: boolean
  isTemplate: boolean
  templateId?: string | null
  steps?: FormStep[] | null // JSON des étapes
  createdAt: Date | string
  updatedAt: Date | string
  publishedAt?: Date | string | null
  userId: string
}