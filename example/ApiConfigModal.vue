<!--
  ApiConfigModal.vue - Modal de configuration des appels API pour les champs
  
  @description Interface pour configurer les routes API (méthode, endpoint, headers, params)
  pour les fonctions appliquées aux champs de formulaire avec test et simulation
  
  @example
  <ApiConfigModal :functionTemplate="template" :targetField="field" />
-->
<template>
  <div class="api-config-modal">
    <!-- Header du modal -->
    <div class="modal-header">
      <div class="header-icon">
        <Icon name="i-heroicons-cog-6-tooth" class="w-6 h-6" />
      </div>
      <div class="header-content">
        <h2 class="modal-title">Configuration API</h2>
        <p class="modal-subtitle">{{ functionTemplateComputed?.title }}</p>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="modal-content" ref="modalContent">
      <div v-if="!targetFieldComputed" class="no-field-selected">
        <Icon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-orange-500 mb-2" />
        <p class="text-gray-600">Aucun champ sélectionné</p>
      </div>

      <div v-else class="config-form">
        <!-- Informations du champ cible avec simulation -->
        <div class="field-info" ref="fieldInfoSection">
          <h3 class="section-title">Champ cible</h3>
          <div class="field-preview">
            <Icon :name="getFieldIcon(targetFieldComputed.type)" class="w-5 h-5" />
            <span class="field-label">{{ targetFieldComputed.label }}</span>
            <span class="field-type">{{ targetFieldComputed.type }}</span>
          </div>
          
          <!-- Simulation du champ avec données API -->
          <div v-if="showFieldSimulation" class="field-simulation">
            <h4 class="simulation-title">
              <Icon name="i-heroicons-play" class="w-4 h-4" />
              Simulation avec données API
            </h4>
            
            <!-- État de chargement -->
            <div v-if="testing" class="simulation-loading">
              <div class="loading-spinner"></div>
              <p class="loading-text">Test de la connexion API...</p>
            </div>
            
            <!-- Simulation du champ -->
            <div v-else-if="apiTestResult.success" class="simulation-field">
              <FieldItem
                :field="simulatedField"
                :value="simulatedFieldValue"
                @input="onSimulatedFieldInput"
                @focus="onSimulatedFieldFocus"
                @blur="onSimulatedFieldBlur"
              />
              
              <!-- Informations sur la réponse API -->
              <div class="api-response-info">
                <div class="response-stats">
                  <span class="stat-item">
                    <Icon name="i-heroicons-clock" class="w-4 h-4" />
                    {{ apiTestResult.responseTime }}ms
                  </span>
                  <span class="stat-item">
                    <Icon name="i-heroicons-server" class="w-4 h-4" />
                    {{ apiTestResult.statusCode }}
                  </span>
                  <span class="stat-item">
                    <Icon name="i-heroicons-list-bullet" class="w-4 h-4" />
                    {{ getDataCount() }} éléments
                  </span>
                </div>
                
                <!-- Données brutes (collapsible) -->
                <div class="raw-data-section">
                  <button
                    @click="showRawData = !showRawData"
                    class="raw-data-toggle"
                    type="button"
                  >
                    <Icon :name="showRawData ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-4 h-4" />
                    Données brutes
                  </button>
                  
                  <div v-if="showRawData" class="raw-data-content">
                    <pre class="json-preview">{{ JSON.stringify(apiTestResult.data, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- État d'erreur -->
            <div v-else-if="apiTestResult.error" class="simulation-error">
              <Icon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-500" />
              <p class="error-message">{{ apiTestResult.error }}</p>
              <button
                @click="retryTest"
                class="retry-btn"
                type="button"
              >
                <Icon name="i-heroicons-arrow-path" class="w-4 h-4" />
                Réessayer
              </button>
            </div>
          </div>
        </div>

        <!-- Configuration de la méthode HTTP -->
        <div class="config-section">
          <h3 class="section-title">
            <Icon name="i-heroicons-arrow-path" class="w-4 h-4" />
            Méthode HTTP
          </h3>
          <select v-model="apiConfig.method" class="method-select">
            <option value="">Sélectionner une méthode</option>
            <option 
              v-for="method in httpMethods" 
              :key="method.value"
              :value="method.value"
            >
              {{ method.value }} - {{ method.description }}
            </option>
          </select>
        </div>

        <!-- Configuration de l'endpoint -->
        <div class="config-section">
          <h3 class="section-title">
            <Icon name="i-heroicons-link" class="w-4 h-4" />
            Endpoint
          </h3>
          <input
            v-model="apiConfig.endpoint"
            type="text"
            placeholder="/api/endpoint"
            class="endpoint-input"
          />
          <small class="help-text">
            Exemple: /api/countries ou https://api.example.com/data
          </small>
        </div>

        <!-- Configuration des headers -->
        <div class="config-section">
          <div class="section-header">
            <h3 class="section-title">
              <Icon name="i-heroicons-document-text" class="w-4 h-4" />
              Headers HTTP
            </h3>
            <button
              @click="addHeader"
              class="add-btn"
              type="button"
            >
              <Icon name="i-heroicons-plus" class="w-4 h-4" />
              Ajouter
            </button>
          </div>
          
          <div v-if="headersList.length === 0" class="empty-state">
            <p class="empty-text">Aucun header configuré</p>
            <button
              @click="addCommonHeaders"
              class="add-common-btn"
              type="button"
            >
              <Icon name="i-heroicons-plus" class="w-4 h-4" />
              Ajouter headers courants
            </button>
          </div>

          <div v-else class="headers-list">
            <div 
              v-for="(header, index) in headersList" 
              :key="index"
              class="header-row"
            >
              <input
                v-model="header.key"
                type="text"
                placeholder="Nom du header"
                class="header-input"
              />
              <input
                v-model="header.value"
                type="text"
                placeholder="Valeur"
                class="header-input"
              />
              <button
                @click="removeHeader(index)"
                class="remove-btn"
                type="button"
              >
                <Icon name="i-heroicons-trash" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Configuration des paramètres -->
        <div class="config-section">
          <div class="section-header">
            <h3 class="section-title">
              <Icon name="i-heroicons-adjustments-horizontal" class="w-4 h-4" />
              Paramètres de requête
            </h3>
            <button
              @click="addParam"
              class="add-btn"
              type="button"
            >
              <Icon name="i-heroicons-plus" class="w-4 h-4" />
              Ajouter
            </button>
          </div>

          <div v-if="paramsList.length === 0" class="empty-state">
            <p class="empty-text">Aucun paramètre configuré</p>
            <button
              @click="addCommonParams"
              class="add-common-btn"
              type="button"
            >
              <Icon name="i-heroicons-plus" class="w-4 h-4" />
              Ajouter paramètres courants
            </button>
          </div>

          <div v-else class="params-list">
            <div 
              v-for="(param, index) in paramsList" 
              :key="index"
              class="param-row"
            >
              <input
                v-model="param.key"
                type="text"
                placeholder="Nom du paramètre"
                class="param-input"
              />
              <input
                v-model="param.value"
                type="text"
                placeholder="Valeur ou ${variable}"
                class="param-input"
              />
              <button
                @click="removeParam(index)"
                class="remove-btn"
                type="button"
              >
                <Icon name="i-heroicons-trash" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Aperçu de la configuration -->
        <div class="config-preview">
          <h3 class="section-title">
            <Icon name="i-heroicons-eye" class="w-4 h-4" />
            Aperçu de la requête
          </h3>
          <div class="preview-content">
            <div class="request-line">
              <span class="method" :class="getMethodColor(apiConfig.method)">
                {{ apiConfig.method || 'METHOD' }}
              </span>
              <span class="endpoint">{{ apiConfig.endpoint || '/api/endpoint' }}</span>
            </div>
            
            <div v-if="Object.keys(finalHeaders).length > 0" class="request-section">
              <strong>Headers:</strong>
              <pre class="code-block">{{ JSON.stringify(finalHeaders, null, 2) }}</pre>
            </div>
            
            <div v-if="Object.keys(finalParams).length > 0" class="request-section">
              <strong>Params:</strong>
              <pre class="code-block">{{ JSON.stringify(finalParams, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer avec actions -->
    <div class="modal-footer">
      <button
        @click="closeDialog"
        class="btn btn-secondary"
        type="button"
      >
        <Icon name="i-heroicons-x-mark" class="w-4 h-4" />
        Annuler
      </button>
      <button
        @click="testConnection"
        class="btn btn-outlined"
        type="button"
        :disabled="testing || !isConfigValid"
      >
        <Icon :name="testing ? 'i-heroicons-arrow-path' : 'i-heroicons-play'" class="w-4 h-4" :class="{ 'animate-spin': testing }" />
        {{ testing ? 'Test en cours...' : 'Tester l\'API' }}
      </button>
      <button
        @click="saveConfiguration"
        class="btn btn-primary"
        type="button"
        :disabled="!isConfigValid"
      >
        <Icon name="i-heroicons-check" class="w-4 h-4" />
        Appliquer
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import type { StepFormField, ApiConfig, ApiMethod } from '~/types/form'
import { defineComponent, ref, computed, inject, onMounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import FieldItem from './FieldItem.vue'

interface FunctionTemplate {
  id: string
  type: string
  title: string
  description: string
  icon: string
  tags: string[]
  config: Partial<ApiConfig>
}

interface HeaderItem {
  key: string
  value: string
}

interface ParamItem {
  key: string
  value: string
}

interface ApiTestResult {
  success: boolean
  statusCode?: number
  responseTime?: number
  data?: any
  error?: string
  headers?: Record<string, string>
}

export default defineComponent({
  name: 'ApiConfigModal',
  
  components: {
    FieldItem
  },
  
  setup() {
    // *** RÉCUPÉRATION DES DONNÉES VIA DYNAMICDIALOG ***
    const dialogRef = inject('dialogRef') as any
    const toast = useToast()
    
    // Refs pour le scroll
    const fieldInfoSection = ref<HTMLElement>()
    const modalContent = ref<HTMLElement>()
    
    // État réactif
    const testing = ref(false)
    const showFieldSimulation = ref(false)
    const showRawData = ref(false)
    const simulatedFieldValue = ref<any>(null)
    
    const apiConfig = ref<ApiConfig>({
      method: 'GET' as ApiMethod,
      endpoint: '',
      headers: {},
      params: {}
    })
    
    const headersList = ref<HeaderItem[]>([])
    const paramsList = ref<ParamItem[]>([])
    
    const apiTestResult = ref<ApiTestResult>({
      success: false
    })
    
    const httpMethods = [
      { 
        value: 'GET', 
        label: 'GET', 
        description: 'Récupérer des données' 
      },
      { 
        value: 'POST', 
        label: 'POST', 
        description: 'Envoyer des données' 
      },
      { 
        value: 'PUT', 
        label: 'PUT', 
        description: 'Mettre à jour des données' 
      },
      { 
        value: 'DELETE', 
        label: 'DELETE', 
        description: 'Supprimer des données' 
      }
    ]

    // Données injectées depuis le parent
    const injectedData = computed(() => {
      if (!dialogRef?.value?.data) {
        console.warn('⚠️ Aucune donnée reçue via DynamicDialog dans ApiConfigModal')
        return {}
      }
      return dialogRef.value.data    
    })

    // Computed properties
    const functionTemplateComputed = computed((): FunctionTemplate | null => {
      const data = injectedData.value
      const fromData = data?.functionTemplate || data?.functionData
      return fromData || null
    })

    const targetFieldComputed = computed((): StepFormField | null => {
      const data = injectedData.value
      const fromData = data?.targetField
      return fromData || null
    })

    const finalHeaders = computed((): Record<string, string> => {
      const headers: Record<string, string> = {}
      headersList.value.forEach(header => {
        if (header.key && header.value) {
          headers[header.key] = header.value
        }
      })
      return headers
    })

    const finalParams = computed((): Record<string, any> => {
      const params: Record<string, any> = {}
      paramsList.value.forEach(param => {
        if (param.key && param.value) {
          params[param.key] = param.value
        }
      })
      return params
    })

    const isConfigValid = computed((): boolean => {
      return !!(apiConfig.value.method && apiConfig.value.endpoint)
    })

    // Champ simulé avec données API
    const simulatedField = computed((): StepFormField => {
      if (!targetFieldComputed.value) return {} as StepFormField
      
      const baseField = { ...targetFieldComputed.value }
      
      // Pour les champs select/multiselect, on utilise les données de l'API
      if ((baseField.type === 'select' || baseField.type === 'multiselect') && apiTestResult.value.success) {
        baseField.options = transformApiDataToOptions(apiTestResult.value.data)
      }
      
      return baseField
    })

    // Methods
    const scrollToFieldInfo = async () => {
      await nextTick()
      if (fieldInfoSection.value) {
        fieldInfoSection.value.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
      toast.add({
        severity,
        summary,
        detail,
        life: 4000
      })
    }

    const closeDialog = (data?: any) => {
      dialogRef?.value?.close(data)
    }

    const transformApiDataToOptions = (data: any): Array<{ label: string; value: any }> => {
      if (!data) return []
      
      // Si c'est un tableau d'objets
      if (Array.isArray(data)) {
        return data.map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            // Essayer de trouver des propriétés communes pour label/value
            const labelKey = Object.keys(item).find(key => 
              key.toLowerCase().includes('name') || 
              key.toLowerCase().includes('label') || 
              key.toLowerCase().includes('title')
            ) || Object.keys(item)[0]
            
            const valueKey = Object.keys(item).find(key => 
              key.toLowerCase().includes('id') || 
              key.toLowerCase().includes('value') || 
              key.toLowerCase().includes('code')
            ) || Object.keys(item)[0]
            
            return {
              label: String(item[labelKey] || item[Object.keys(item)[0]] || `Option ${index + 1}`),
              value: item[valueKey] || item[Object.keys(item)[0]] || index
            }
          } else {
            return {
              label: String(item),
              value: item
            }
          }
        })
      }
      
      // Si c'est un objet avec des propriétés
      if (typeof data === 'object' && data !== null) {
        return Object.entries(data).map(([key, value]) => ({
          label: String(value || key),
          value: key
        }))
      }
      
      return []
    }

    const getDataCount = (): number => {
      if (!apiTestResult.value.data) return 0
      if (Array.isArray(apiTestResult.value.data)) {
        return apiTestResult.value.data.length
      }
      if (typeof apiTestResult.value.data === 'object') {
        return Object.keys(apiTestResult.value.data).length
      }
      return 1
    }

    const testConnection = async () => {
      if (!isConfigValid.value) {
        showToast('warn', 'Configuration incomplète', 'Veuillez remplir la méthode et l\'endpoint')
        return
      }

      testing.value = true
      showFieldSimulation.value = true
      
      // Scroll vers la section field-info
      await scrollToFieldInfo()
      
      const startTime = Date.now()
      
      try {
        // Construction de l'URL avec paramètres
        const url = new URL(apiConfig.value.endpoint, window.location.origin)
        Object.entries(finalParams.value).forEach(([key, value]) => {
          url.searchParams.append(key, String(value))
        })

        // Configuration de la requête
        const requestConfig: RequestInit = {
          method: apiConfig.value.method,
          headers: {
            'Content-Type': 'application/json',
            ...finalHeaders.value
          }
        }

        // Exécution de la requête
        const response = await fetch(url.toString(), requestConfig)
        const responseTime = Date.now() - startTime
        
        if (response.ok) {
          const data = await response.json()
          
          apiTestResult.value = {
            success: true,
            statusCode: response.status,
            responseTime,
            data,
            headers: Object.fromEntries(response.headers.entries())
          }
          
          showToast(
            'success', 
            `Connexion réussie (${response.status})`, 
            `Réponse reçue en ${responseTime}ms avec ${getDataCount()} éléments`
          )
          
        } else {
          const errorText = await response.text()
          
          apiTestResult.value = {
            success: false,
            statusCode: response.status,
            responseTime,
            error: `Erreur ${response.status}: ${response.statusText}`
          }
          
          showToast(
            'error', 
            `Erreur ${response.status}`, 
            `${response.statusText} - ${errorText.slice(0, 100)}...`
          )
        }
        
      } catch (error: any) {
        const responseTime = Date.now() - startTime
        
        apiTestResult.value = {
          success: false,
          responseTime,
          error: error.message || 'Erreur de connexion'
        }
        
        showToast(
          'error', 
          'Erreur de connexion', 
          error.message || 'Impossible de se connecter à l\'API'
        )
      } finally {
        testing.value = false
      }
    }

    const retryTest = () => {
      testConnection()
    }

    const onSimulatedFieldInput = (value: any) => {
      simulatedFieldValue.value = value
      console.log('Simulated field input:', value)
    }

    const onSimulatedFieldFocus = (event: Event) => {
      console.log('Simulated field focused')
    }

    const onSimulatedFieldBlur = () => {
      console.log('Simulated field blurred')
    }

    const initializeConfig = () => {
      if (functionTemplateComputed.value?.config) {
        apiConfig.value = { ...apiConfig.value, ...functionTemplateComputed.value.config }
      }
      
      // Initialiser les listes depuis la config existante
      if (apiConfig.value.headers) {
        headersList.value = Object.entries(apiConfig.value.headers).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      }
      
      if (apiConfig.value.params) {
        paramsList.value = Object.entries(apiConfig.value.params).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      }
    }

    const addHeader = () => {
      headersList.value.push({ key: '', value: '' })
    }

    const removeHeader = (index: number) => {
      headersList.value.splice(index, 1)
    }

    const addCommonHeaders = () => {
      headersList.value.push(
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Accept', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer ${token}' }
      )
    }

    const addParam = () => {
      paramsList.value.push({ key: '', value: '' })
    }

    const removeParam = (index: number) => {
      paramsList.value.splice(index, 1)
    }

    const addCommonParams = () => {
      paramsList.value.push(
        { key: 'page', value: '1' },
        { key: 'limit', value: '50' },
        { key: 'sort', value: 'name' }
      )
    }

    const getFieldIcon = (type: string): string => {
      const icons: Record<string, string> = {
        text: 'i-heroicons-pencil-square',
        email: 'i-heroicons-at-symbol',
        number: 'i-heroicons-hashtag',
        select: 'i-heroicons-chevron-down',
        multiselect: 'i-heroicons-queue-list',
        tel: 'i-heroicons-phone',
        url: 'i-heroicons-link'
      }
      return icons[type] || 'i-heroicons-rectangle-stack'
    }

    const getMethodColor = (method: string): string => {
      const colors: Record<string, string> = {
        GET: 'method-get',
        POST: 'method-post',
        PUT: 'method-put',
        DELETE: 'method-delete'
      }
      return colors[method] || 'method-default'
    }

    const saveConfiguration = () => {
      // Construire la configuration finale
      const finalConfig: ApiConfig = {
        method: apiConfig.value.method,
        endpoint: apiConfig.value.endpoint,
        headers: finalHeaders.value,
        params: finalParams.value
      }

      // Fermer le dialog avec la configuration
      closeDialog({
        success: true,
        targetField: targetFieldComputed.value,
        apiConfig: finalConfig,
        functionTemplate: functionTemplateComputed.value
      })
      
      showToast('success', 'Configuration sauvegardée', 'La configuration API a été appliquée au champ')
    }

    // Lifecycle
    onMounted(() => {
      initializeConfig()
    })

    return {
      // Refs
      fieldInfoSection,
      modalContent,
      
      // État
      testing,
      showFieldSimulation,
      showRawData,
      simulatedFieldValue,
      apiConfig,
      headersList,
      paramsList,
      apiTestResult,
      httpMethods,
      
      // Computed
      injectedData,
      functionTemplateComputed,
      targetFieldComputed,
      finalHeaders,
      finalParams,
      isConfigValid,
      simulatedField,
      
      // Methods
      closeDialog,
      testConnection,
      retryTest,
      onSimulatedFieldInput,
      onSimulatedFieldFocus,
      onSimulatedFieldBlur,
      addHeader,
      removeHeader,
      addCommonHeaders,
      addParam,
      removeParam,
      addCommonParams,
      getFieldIcon,
      getMethodColor,
      getDataCount,
      saveConfiguration,
      
      // Helper method for template compatibility
      hasDialogRef: () => !!dialogRef?.value
    }
  }
})
</script>

<style scoped>
.api-config-modal {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  width: 100%;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
}

.header-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 0.75rem;
  margin-right: 1rem;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Contenu */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.no-field-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 10rem;
  text-align: center;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Sections */
.field-info {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.field-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
}

.field-label {
  font-weight: 500;
  color: #1f2937;
}

.field-type {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 0.375rem;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Inputs */
.method-select,
.endpoint-input,
.header-input,
.param-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.method-select:focus,
.endpoint-input:focus,
.header-input:focus,
.param-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  font-size: 0.75rem;
  color: #6b7280;
}

/* État vide */
.empty-state {
  padding: 1.5rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  text-align: center;
}

.empty-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

/* Boutons */
.add-btn,
.add-common-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover,
.add-common-btn:hover {
  background: #3b82f6;
  color: white;
}

.remove-btn {
  padding: 0.5rem;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #ef4444;
  color: white;
}

/* Listes de headers/params */
.headers-list,
.params-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-row,
.param-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Aperçu */
.config-preview {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.method {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
}

.method-get {
  background: #dcfce7;
  color: #166534;
}

.method-post {
  background: #dbeafe;
  color: #1e40af;
}

.method-put {
  background: #fed7aa;
  color: #c2410c;
}

.method-delete {
  background: #fecaca;
  color: #991b1b;
}

.method-default {
  background: #f3f4f6;
  color: #374151;
}

.endpoint {
  font-family: monospace;
  font-size: 0.875rem;
  color: #374151;
}

.request-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.code-block {
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.375rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: #374151;
  overflow-x: auto;
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-outlined {
  background: white;
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-outlined:hover:not(:disabled) {
  background: #eff6ff;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-header {
    padding: 1rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .header-row,
  .param-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Nouveaux styles pour la simulation */
.field-simulation {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 0.5rem;
}

.simulation-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 1rem;
}

.simulation-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #64748b;
  font-size: 0.875rem;
}

.simulation-field {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.api-response-info {
  padding: 1rem;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.response-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
  padding: 0.25rem 0.5rem;
  background: #f1f5f9;
  border-radius: 0.25rem;
}

.raw-data-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.raw-data-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0;
}

.raw-data-toggle:hover {
  color: #334155;
}

.raw-data-content {
  margin-top: 0.5rem;
}

.json-preview {
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.75rem;
}

.simulation-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 1rem 0;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #3b82f6;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #3b82f6;
  color: white;
}

/* Animation pour le bouton test */
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
