import type { FieldTemplate } from '../types/form'

export function useFieldTypes() {
  const fieldTemplates: FieldTemplate[] = [
    // Input
    {
      type: 'text',
      label: 'Texte',
      icon: 'i-heroicons-pencil-square',
      category: 'input',
      defaultProps: { placeholder: 'Saisissez votre texte...' }
    },
    {
      type: 'email',
      label: 'Email',
      icon: 'i-heroicons-at-symbol',
      category: 'input',
      defaultProps: { 
        placeholder: 'exemple@domaine.com',
        validation: { email: true }
      }
    },
    {
      type: 'password',
      label: 'Mot de passe',
      icon: 'i-heroicons-lock-closed',
      category: 'input',
      defaultProps: { placeholder: '••••••••' }
    },
    {
      type: 'number',
      label: 'Nombre',
      icon: 'i-heroicons-hashtag',
      category: 'input',
      defaultProps: { placeholder: '0' }
    },
    {
      type: 'tel',
      label: 'Téléphone',
      icon: 'i-heroicons-phone',
      category: 'input',
      defaultProps: { placeholder: '+33 1 23 45 67 89' }
    },
    {
      type: 'textarea',
      label: 'Zone de texte',
      icon: 'i-heroicons-document-text',
      category: 'input',
      defaultProps: { placeholder: 'Votre message...' }
    },
    
    // Select
    {
      type: 'select',
      label: 'Liste déroulante',
      icon: 'i-heroicons-chevron-down',
      category: 'select',
      hasOptions: true,
      defaultProps: {
        placeholder: 'Choisissez une option',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ]
      }
    },
    {
      type: 'radio',
      label: 'Boutons radio',
      icon: 'i-heroicons-radio',
      category: 'select',
      hasOptions: true,
      defaultProps: {
        options: [
          { label: 'Choix 1', value: 'choice1' },
          { label: 'Choix 2', value: 'choice2' }
        ]
      }
    },
    {
      type: 'checkbox',
      label: 'Cases à cocher',
      icon: 'i-heroicons-check-circle',
      category: 'select',
      hasOptions: true,
      defaultProps: {
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' }
        ]
      }
    },
    
    // Date
    {
      type: 'date',
      label: 'Date',
      icon: 'i-heroicons-calendar-days',
      category: 'date'
    },
    {
      type: 'datetime-local',
      label: 'Date et heure',
      icon: 'i-heroicons-clock',
      category: 'date'
    },
    
    // File
    {
      type: 'file',
      label: 'Fichier',
      icon: 'i-heroicons-document-arrow-up',
      category: 'file',
      defaultProps: { accept: '*' }
    },
    
    // Controls
    {
      type: 'switch',
      label: 'Interrupteur',
      icon: 'i-heroicons-power',
      category: 'control'
    },
    {
      type: 'range',
      label: 'Curseur',
      icon: 'i-heroicons-adjustments-horizontal',
      category: 'control',
      defaultProps: { min: 0, max: 100 }
    }
  ]

  const getFieldsByCategory = (category: string) => {
    return fieldTemplates.filter(template => template.category === category)
  }

  const getFieldTemplate = (type: string) => {
    return fieldTemplates.find(template => template.type === type)
  }

  const fieldCategories = [
    { id: 'input', label: 'Saisie', icon: 'i-heroicons-pencil-square' },
    { id: 'select', label: 'Sélection', icon: 'i-heroicons-check-circle' },
    { id: 'date', label: 'Date', icon: 'i-heroicons-calendar-days' },
    { id: 'file', label: 'Fichier', icon: 'i-heroicons-document-arrow-up' },
    { id: 'control', label: 'Contrôles', icon: 'i-heroicons-adjustments-horizontal' }
  ]

  return {
    fieldTemplates,
    fieldCategories,
    getFieldsByCategory,
    getFieldTemplate
  }
}