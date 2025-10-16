// frontend/src/composables/useColumnManagement.ts

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ColumnConfig } from '@/types/pricing.types'
import { STORAGE_KEYS } from '@/types/pricing.types'

import { DEFAULT_COLUMNS, DYNAMIC_FIELDS_MOCK } from '@/config/defaultColumns.config'

export function useColumnManagement() {
  const { t } = useI18n()

  const allColumns = ref<ColumnConfig[]>([])

  /**
   * Get default columns configuration
   */
  const getDefaultColumns = (): ColumnConfig[] => {
    // Map and add translations
    const staticColumns = DEFAULT_COLUMNS.map(col => ({
      ...col,
      title: t(`pricing.${col.key}`)
    }))
    
    const dynamicFields = DYNAMIC_FIELDS_MOCK.map(col => ({
      ...col,
      title: col.key // або title з API
    }))
    
    return [...staticColumns, ...dynamicFields]
  }


  /**
   * Load columns configuration from localStorage
   */
  const loadColumnsConfig = (): void => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COLUMNS_CONFIG)
      if (saved) {
        const parsed = JSON.parse(saved) as ColumnConfig[]
        const defaultCols = getDefaultColumns()
        const savedKeys = new Set(parsed.map(c => c.key))
        
        // Merge saved with defaults (add new columns that don't exist in saved)
        const merged = [...parsed]
        defaultCols.forEach(defCol => {
          if (!savedKeys.has(defCol.key)) {
            merged.push(defCol)
          }
        })
        
        allColumns.value = merged.sort((a, b) => a.order - b.order)
      } else {
        allColumns.value = getDefaultColumns()
      }
    } catch (error) {
      console.error('Error loading columns config:', error)
      allColumns.value = getDefaultColumns()
    }
  }

  /**
   * Save columns configuration to localStorage
   */
  const saveColumnsConfig = (columns: ColumnConfig[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.COLUMNS_CONFIG, JSON.stringify(columns))
      allColumns.value = columns
    } catch (error) {
      console.error('Error saving columns config:', error)
      throw error
    }
  }

  /**
   * Reset columns to default
   */
  const resetColumnsToDefault = (): void => {
    const defaultColumns = getDefaultColumns()
    saveColumnsConfig(defaultColumns)
  }

  /**
   * Get visible columns sorted by order
   */
  const visibleColumns = computed(() => {
    return allColumns.value
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order)
  })

  /**
   * Check if column is dynamic (read-only Bitrix24 field)
   */
  const isDynamicColumn = (key: string): boolean => {
    return allColumns.value.find(col => col.key === key)?.isDynamic || false
  }

  /**
   * Get column by key
   */
  const getColumnByKey = (key: string): ColumnConfig | undefined => {
    return allColumns.value.find(col => col.key === key)
  }

  return {
    allColumns,
    visibleColumns,
    loadColumnsConfig,
    saveColumnsConfig,
    resetColumnsToDefault,
    isDynamicColumn,
    getColumnByKey,
    getDefaultColumns,
  }
}