// frontend/src/composables/useColumnManagement.ts

import { ref, computed } from 'vue'
import { DEFAULT_COLUMNS } from '@/config/defaultColumns.config'
import { STORAGE_KEYS } from '@/types/pricing.types'
import type { ColumnConfig } from '@/types/pricing.types'
import { useI18n } from 'vue-i18n'

/**
 * ✅ SIMPLIFIED: Column management without dynamic loading
 * All columns are predefined, just manage visibility and order
 */
export function useColumnManagement() {
  const { t } = useI18n()
  
  // All available columns
  const allColumns = ref<ColumnConfig[]>([])
  
  // Visible columns (filtered and sorted)
  const visibleColumns = computed(() => {
    return allColumns.value
      .filter(col => col.visible)
      .sort((a, b) => a.order - b.order)
  })

  /**
   * Initialize columns with translations
   * Load from localStorage or use defaults
   */
  const initializeColumns = () => {
    console.log('[ColumnManagement] Initializing columns...')

    // Try to load saved configuration
    const savedConfig = loadColumnsConfig()
    
    if (savedConfig && savedConfig.length > 0) {
      console.log('[ColumnManagement] Using saved configuration:', savedConfig.length)
      
      // Apply translations to saved config
      allColumns.value = savedConfig.map(col => ({
        ...col,
        title: t(`pricing.${col.key}`)
      }))
    } else {
      console.log('[ColumnManagement] Using default configuration')
      
      // Create from defaults with translations
      allColumns.value = DEFAULT_COLUMNS.map(col => ({
        ...col,
        title: t(`pricing.${col.key}`)
      }))
    }

    console.log('[ColumnManagement] Initialized columns:', {
      total: allColumns.value.length,
      visible: visibleColumns.value.length,
      editable: allColumns.value.filter(c => c.editable).length,
      readOnly: allColumns.value.filter(c => !c.editable).length
    })
  }

  /**
   * Load columns configuration from localStorage
   */
  const loadColumnsConfig = (): ColumnConfig[] | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COLUMNS_CONFIG)
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('[ColumnManagement] Loaded saved config:', parsed.length)
        return parsed
      }
    } catch (error) {
      console.error('[ColumnManagement] Error loading config:', error)
    }
    return null
  }

  /**
   * Save columns configuration to localStorage
   */
  const saveColumnsConfig = (columns: ColumnConfig[]) => {
    try {
      // Don't save titles (they're language-dependent)
      const toSave = columns.map(col => {
        const { title, ...rest } = col
        return rest
      })
      
      localStorage.setItem(STORAGE_KEYS.COLUMNS_CONFIG, JSON.stringify(toSave))
      
      // Update allColumns with new configuration but keep translations
      allColumns.value = columns.map(col => ({
        ...col,
        title: t(`pricing.${col.key}`) || col.title
      }))
      
      console.log('[ColumnManagement] Saved configuration:', columns.length)
    } catch (error) {
      console.error('[ColumnManagement] Error saving config:', error)
    }
  }

  /**
   * Reset to default columns
   */
  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.COLUMNS_CONFIG)
    allColumns.value = DEFAULT_COLUMNS.map(col => ({
      ...col,
      title: t(`pricing.${col.key}`)
    }))
    console.log('[ColumnManagement] Reset to defaults')
  }

  /**
   * Check if column is read-only (from Bitrix24)
   */
  const isReadOnlyColumn = (key: string): boolean => {
    const col = allColumns.value.find(c => c.key === key)
    return col ? !col.editable : false
  }

  /**
   * Toggle column visibility
   */
  const toggleColumnVisibility = (key: string, visible: boolean) => {
    const col = allColumns.value.find(c => c.key === key)
    if (col && !col.locked) {
      col.visible = visible
      saveColumnsConfig(allColumns.value)
    }
  }

  /**
   * Reorder columns
   */
  const reorderColumns = (columns: ColumnConfig[]) => {
    allColumns.value = columns.map((col, index) => ({
      ...col,
      order: index + 1
    }))
    saveColumnsConfig(allColumns.value)
  }

  return {
    allColumns,
    visibleColumns,
    initializeColumns,
    loadColumnsConfig,
    saveColumnsConfig,
    resetToDefaults,
    isReadOnlyColumn,
    toggleColumnVisibility,
    reorderColumns
  }
}