// frontend/src/composables/useColumnManagement.ts

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ColumnConfig } from '@/types/pricing.types'
import { STORAGE_KEYS } from '@/types/pricing.types'

export function useColumnManagement() {
  const { t } = useI18n()

  const allColumns = ref<ColumnConfig[]>([])

  /**
   * Get default columns configuration
   */
  const getDefaultColumns = (): ColumnConfig[] => {
    return [
      { 
        key: 'product', 
        title: t('pricing.product'), 
        required: true, 
        locked: true, 
        visible: true, 
        order: 1, 
        width: 200 
      },
      { 
        key: 'quantity', 
        title: t('pricing.quantity'), 
        required: true, 
        locked: true, 
        visible: true, 
        order: 2, 
        width: 100 
      },
      { 
        key: 'salePrice', 
        title: t('pricing.salePrice'), 
        required: true, 
        locked: true, 
        visible: true, 
        order: 3, 
        width: 200 
      },
      { 
        key: 'purchasePrice', 
        title: t('pricing.purchasePrice'), 
        required: true, 
        locked: true, 
        visible: true, 
        order: 4, 
        width: 200 
      },
      { 
        key: 'totalMargin', 
        title: t('pricing.totalMargin'), 
        required: true, 
        locked: true, 
        visible: true, 
        order: 5, 
        width: 160 
      },
      { 
        key: 'supplier', 
        title: t('pricing.supplier'), 
        required: false, 
        locked: false, 
        visible: true, 
        order: 6, 
        width: 180 
      },
      { 
        key: 'transportCost', 
        title: t('pricing.transportCost'), 
        required: false, 
        locked: false, 
        visible: true, 
        order: 7, 
        width: 200 
      },
      { 
        key: 'packagingCost', 
        title: t('pricing.packagingCost'), 
        required: false, 
        locked: false, 
        visible: true, 
        order: 8, 
        width: 200 
      },
      { 
        key: 'marginPercent', 
        title: t('pricing.marginPercent'), 
        required: false, 
        locked: false, 
        visible: true, 
        order: 9, 
        width: 120 
      },
      { 
        key: 'marginPerUnit', 
        title: t('pricing.marginPerUnit'), 
        required: false, 
        locked: false, 
        visible: true, 
        order: 10, 
        width: 150 
      },
      { 
        key: 'marginAmount', 
        title: t('pricing.marginAmount'), 
        required: false, 
        locked: false, 
        visible: false, 
        order: 11, 
        width: 150 
      },
      { 
        key: 'action', 
        title: t('pricing.action'), 
        required: true, 
        locked: true, 
        visible: true, 
        order: 12, 
        width: 80 
      },
      // Dynamic fields (mock)
      { 
        key: 'PRODUCT_ID', 
        title: 'Product ID', 
        required: false, 
        locked: false, 
        visible: false, 
        order: 100, 
        width: 120, 
        isDynamic: true 
      },
      { 
        key: 'MEASURE_NAME', 
        title: 'Unit of Measure', 
        required: false, 
        locked: false, 
        visible: false, 
        order: 101, 
        width: 150, 
        isDynamic: true 
      },
      { 
        key: 'DISCOUNT_RATE', 
        title: 'Discount Rate', 
        required: false, 
        locked: false, 
        visible: false, 
        order: 102, 
        width: 120, 
        isDynamic: true 
      },
      { 
        key: 'TAX_RATE', 
        title: 'Tax Rate', 
        required: false, 
        locked: false, 
        visible: false, 
        order: 103, 
        width: 100, 
        isDynamic: true 
      },
    ]
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