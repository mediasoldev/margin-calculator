<!-- frontend/src/components/settings/BitrixIntegration.vue -->

<template>
  <div class="bitrix-integration">
    <a-spin :spinning="loading">
      <a-space direction="vertical" style="width: 100%" :size="16">
        
        <!-- Storage Status -->
        <a-card :title="$t('settings.storageStatus')" size="small">
          <a-space direction="vertical" style="width: 100%">
            <a-alert
              v-if="!storageStatus.checked"
              message="Sprawdzanie i konfiguracja magazynów..."
              type="info"
              show-icon
            />
            <template v-else>
              <a-descriptions bordered size="small" :column="2">
                <a-descriptions-item :label="$t('settings.productSuppliersStorage')">
                  <a-space size="small">
                    <a-tag :color="storageStatus.product_suppliers ? 'success' : 'error'">
                      {{ storageStatus.product_suppliers ? $t('settings.created') : $t('settings.notCreated') }}
                    </a-tag>
                    <a-tag v-if="storageStatus.product_suppliers_rights" :color="storageStatus.product_suppliers_rights === 'X' ? 'green' : 'orange'">
                      {{ storageStatus.product_suppliers_rights }}
                    </a-tag>
                  </a-space>
                </a-descriptions-item>
                
                <a-descriptions-item :label="$t('settings.calculationsStorage')">
                  <a-space size="small">
                    <a-tag :color="storageStatus.m_calculations ? 'success' : 'error'">
                      {{ storageStatus.m_calculations ? $t('settings.created') : $t('settings.notCreated') }}
                    </a-tag>
                    <a-tag v-if="storageStatus.m_calculations_rights" :color="storageStatus.m_calculations_rights === 'X' ? 'green' : 'orange'">
                      {{ storageStatus.m_calculations_rights }}
                    </a-tag>
                  </a-space>
                </a-descriptions-item>
              </a-descriptions>
            </template>
          </a-space>
        </a-card>

        <!-- Field Mapping -->
        <a-card :title="$t('settings.fieldMapping')" size="small">
          <a-form layout="vertical">
            <a-form-item :label="$t('settings.totalMarginField')">
              <a-select
                v-model:value="fieldMapping.totalMargin"
                show-search
                :placeholder="$t('settings.selectField')"
                :filter-option="filterFieldOption"
                :loading="loadingFields"
                allow-clear
                @change="onFieldMappingChange"
              >
                <a-select-option 
                  v-for="field in filteredFields" 
                  :key="field.id"
                  :value="field.id"
                  :label="field.label"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center">
                    <span>{{ field.title }}</span>
                    <a-space size="small">
                      <a-tag v-if="field.isDynamic" color="blue" style="margin: 0">{{ field.id }}</a-tag>
                      <a-tag :color="field.type === 'integer' ? 'green' : 'orange'" style="margin: 0">
                        {{ field.type }}
                      </a-tag>
                    </a-space>
                  </div>
                </a-select-option>
              </a-select>
              <div style="margin-top: 8px">
                <a-typography-text type="secondary" style="font-size: 12px">
                  {{ $t('settings.totalMarginFieldHint') }}
                </a-typography-text>
              </div>
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button 
                  type="primary" 
                  @click="saveFieldMapping"
                  :loading="saving"
                  :disabled="!hasChanges"
                >
                  <SaveOutlined /> {{ $t('settings.save') }}
                </a-button>
                <a-button 
                  @click="resetFieldMapping"
                  :disabled="!fieldMapping.totalMargin"
                >
                  <DeleteOutlined /> {{ $t('settings.clearMapping') }}
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>

          <a-divider />

          <a-descriptions bordered size="small" :column="1" :title="$t('settings.currentMapping')">
            <a-descriptions-item :label="$t('settings.totalMarginField')">
              <template v-if="savedFieldMapping.totalMargin">
                <a-tag color="success">{{ getFieldTitle(savedFieldMapping.totalMargin) }}</a-tag>
                <a-typography-text type="secondary" style="font-size: 12px; margin-left: 8px">
                  ({{ savedFieldMapping.totalMargin }})
                </a-typography-text>
              </template>
              <a-tag v-else color="default">{{ $t('settings.notConfigured') }}</a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

      </a-space>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { ReloadOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()

interface DealField {
  id: string
  title: string
  type: string
  isDynamic: boolean
  label: string
}

const loading = ref(false)
const loadingFields = ref(false)
const saving = ref(false)

const storageStatus = reactive({
  checked: false,
  product_suppliers: false,
  m_calculations: false,
  product_suppliers_rights: '',
  m_calculations_rights: ''
})

const dealFields = ref<DealField[]>([])
const fieldMapping = reactive({
  totalMargin: ''
})

const savedFieldMapping = reactive({
  totalMargin: ''
})

const hasChanges = computed(() => {
  return fieldMapping.totalMargin !== savedFieldMapping.totalMargin
})

const filteredFields = computed(() => {
  return dealFields.value.filter(f => f.type === 'integer' || f.type === 'string')
})

const checkStorages = async () => {
  loading.value = true
  try {
    const result: any = await new Promise((resolve) => {
      window.BX24.callMethod('entity.get', {}, (r: any) => {
        resolve(r.data())
      })
    })

    const hasProductSuppliers = result.some((e: any) => e.ENTITY === 'product_suppliers')
    const hasCalculations = result.some((e: any) => e.ENTITY === 'm_calculations')

    if (!hasProductSuppliers) {
      await createStorageSilent('product_suppliers')
      await checkAndFixRights('product_suppliers')
    } else {
      await checkAndFixRights('product_suppliers')
    }
    
    if (!hasCalculations) {
      await createStorageSilent('m_calculations')
      await checkAndFixRights('m_calculations')
    } else {
      await checkAndFixRights('m_calculations')
    }

    const finalResult: any = await new Promise((resolve) => {
      window.BX24.callMethod('entity.get', {}, (r: any) => {
        resolve(r.data())
      })
    })

    storageStatus.product_suppliers = finalResult.some((e: any) => e.ENTITY === 'product_suppliers')
    storageStatus.m_calculations = finalResult.some((e: any) => e.ENTITY === 'm_calculations')
    storageStatus.checked = true
  } catch (error) {
    console.error('[BitrixIntegration] Error checking storages:', error)
    message.error(t('settings.checkStorageError'))
    storageStatus.checked = true
  } finally {
    loading.value = false
  }
}

const checkAndFixRights = async (entityName: string): Promise<void> => {
  try {
    const rights: any = await new Promise((resolve) => {
      window.BX24.callMethod('entity.rights', {
        ENTITY: entityName
      }, (r: any) => {
        resolve(r.data())
      })
    })

    console.log(`[BitrixIntegration] Rights for ${entityName}:`, rights)

    const currentRight = rights?.AU || 'none'
    
    if (entityName === 'product_suppliers') {
      storageStatus.product_suppliers_rights = currentRight
    } else if (entityName === 'm_calculations') {
      storageStatus.m_calculations_rights = currentRight
    }

    if (rights && rights.AU !== 'X') {
      console.log(`[BitrixIntegration] Fixing rights for ${entityName}: ${rights.AU} -> X`)
      
      await new Promise((resolve, reject) => {
        window.BX24.callMethod('entity.rights', {
          ENTITY: entityName,
          ACCESS: {
            AU: 'X'
          }
        }, (r: any) => {
          if (r.error()) {
            reject(r.error())
          } else {
            resolve(r.data())
          }
        })
      })

      console.log(`[BitrixIntegration] Rights fixed for ${entityName}`)
      
      if (entityName === 'product_suppliers') {
        storageStatus.product_suppliers_rights = 'X'
      } else if (entityName === 'm_calculations') {
        storageStatus.m_calculations_rights = 'X'
      }
    }
  } catch (error) {
    console.error(`[BitrixIntegration] Error checking/fixing rights for ${entityName}:`, error)
  }
}

const createStorageSilent = async (entityName: string): Promise<void> => {
  try {
    const entityConfig: any = {
      ENTITY: entityName,
      ACCESS: { AU: 'X' }
    }

    if (entityName === 'product_suppliers') {
      entityConfig.NAME = 'Product Suppliers Storage'
    } else if (entityName === 'm_calculations') {
      entityConfig.NAME = 'Pricing Calculations Storage'
    }

    await new Promise((resolve, reject) => {
      window.BX24.callMethod('entity.add', entityConfig, (r: any) => {
        if (r.error()) {
          if (r.error().error !== 'ERROR_ENTITY_ALREADY_EXISTS') {
            reject(r.error())
          } else {
            resolve(r.data())
          }
        } else {
          console.log(`[BitrixIntegration] Created ${entityName} with AU: 'X' rights`)
          
          if (entityName === 'product_suppliers') {
            storageStatus.product_suppliers_rights = 'X'
          } else if (entityName === 'm_calculations') {
            storageStatus.m_calculations_rights = 'X'
          }
          
          resolve(r.data())
        }
      })
    })
  } catch (error: any) {
    console.error('[BitrixIntegration] Error creating storage:', entityName, error)
  }
}

const loadDealFields = async () => {
  loadingFields.value = true
  try {
    const fields: any = await new Promise((resolve) => {
      window.BX24.callMethod('crm.deal.fields', {}, (r: any) => {
        resolve(r.data())
      })
    })

    const mapped: DealField[] = []

    for (const [key, value] of Object.entries(fields)) {
      const field = value as any
      
      if (field.type === 'integer' || field.type === 'string') {
        const isDynamic = key.startsWith('UF_')
        const title = isDynamic ? (field.formLabel || field.listLabel || field.title || key) : field.title
        
        mapped.push({
          id: key,
          title: title,
          type: field.type,
          isDynamic: isDynamic,
          label: `${title} (${key}) [${field.type}]`
        })
      }
    }

    dealFields.value = mapped.sort((a, b) => {
      if (a.isDynamic === b.isDynamic) {
        return a.title.localeCompare(b.title)
      }
      return a.isDynamic ? 1 : -1
    })
  } catch (error) {
    console.error('[BitrixIntegration] Error loading fields:', error)
    message.error(t('settings.loadFieldsError'))
  } finally {
    loadingFields.value = false
  }
}

const loadSavedMapping = () => {
  if (!window.BX24?.appOption) return

  try {
    const totalMargin: any = window.BX24.appOption.get('deal_field_total_margin')
    if (totalMargin) {
      fieldMapping.totalMargin = totalMargin
      savedFieldMapping.totalMargin = totalMargin
    }
  } catch (error) {
    console.error('[BitrixIntegration] Error loading saved mapping:', error)
  }
}

const saveFieldMapping = async () => {
  saving.value = true
  try {
    if (fieldMapping.totalMargin) {
      await new Promise((resolve) => {
        window.BX24.appOption.set('deal_field_total_margin', fieldMapping.totalMargin, resolve)
      })
    } else {
      await new Promise((resolve) => {
        window.BX24.appOption.set('deal_field_total_margin', '', resolve)
      })
    }

    savedFieldMapping.totalMargin = fieldMapping.totalMargin
    message.success(t('settings.saveSuccess'))
  } catch (error) {
    console.error('[BitrixIntegration] Error saving mapping:', error)
    message.error(t('settings.saveError'))
  } finally {
    saving.value = false
  }
}

const resetFieldMapping = () => {
  fieldMapping.totalMargin = ''
}

const onFieldMappingChange = () => {
  // Auto-save disabled, user must click Save
}

const filterFieldOption = (input: string, option: any) => {
  const field = filteredFields.value.find(f => f.id === option.value)
  if (!field) return false
  
  const searchText = input.toLowerCase()
  return (
    field.id.toLowerCase().includes(searchText) ||
    field.title.toLowerCase().includes(searchText) ||
    field.type.toLowerCase().includes(searchText)
  )
}

const getFieldTitle = (fieldId: string): string => {
  const field = dealFields.value.find(f => f.id === fieldId)
  return field ? field.title : fieldId
}

onMounted(async () => {
  await checkStorages()
  await loadDealFields()
  loadSavedMapping()
})
</script>

<style scoped>
.bitrix-integration {
  padding: 0;
}
</style>