import type { ColumnConfig } from '@/types/pricing.types'

/**
 * Default columns configuration
 * Single source of truth for all column definitions
 */
export const DEFAULT_COLUMNS: Omit<ColumnConfig, 'title'>[] = [
  { key: 'product', required: true, locked: true, visible: true, order: 1 },
//   { key: 'product', required: true, locked: true, visible: true, order: 1, width: 200 },
  { key: 'quantity', required: true, locked: true, visible: true, order: 2, width: 100 },
  { key: 'salePrice', required: true, locked: true, visible: true, order: 3, width: 200 },
  { key: 'purchasePrice', required: true, locked: true, visible: true, order: 4, width: 200 },
  { key: 'totalMargin', required: true, locked: true, visible: true, order: 5, width: 160 },
  { key: 'supplier', required: false, locked: false, visible: true, order: 6, width: 180 },
  { key: 'transportCost', required: false, locked: false, visible: true, order: 7, width: 200 },
  { key: 'packagingCost', required: false, locked: false, visible: true, order: 8, width: 200 },
  { key: 'marginPercent', required: false, locked: false, visible: true, order: 9, width: 120 },
  { key: 'marginPerUnit', required: false, locked: false, visible: true, order: 10, width: 150 },
  { key: 'action', required: true, locked: true, visible: true, order: 11, width: 80 },
]

/**
 * Dynamic fields mock (will be fetched from Bitrix24 in production)
 */
export const DYNAMIC_FIELDS_MOCK: Omit<ColumnConfig, 'title'>[] = [
  { key: 'PRODUCT_ID', required: false, locked: false, visible: false, order: 100, width: 120, isDynamic: true },
  { key: 'MEASURE_NAME', required: false, locked: false, visible: false, order: 101, width: 150, isDynamic: true },
  { key: 'DISCOUNT_RATE', required: false, locked: false, visible: false, order: 102, width: 120, isDynamic: true },
  { key: 'TAX_RATE', required: false, locked: false, visible: false, order: 103, width: 100, isDynamic: true },
]