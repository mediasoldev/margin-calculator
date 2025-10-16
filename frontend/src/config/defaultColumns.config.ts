// frontend/src/config/defaultColumns.config.ts

import type { ColumnConfig } from '@/types/pricing.types'

/**
 * ✅ UNIFIED: All columns in one place
 * No more "dynamic" vs "static" - just editable vs read-only
 * 
 * Column properties:
 * - required: Cannot be hidden (e.g. product name, action buttons)
 * - locked: Same as required (for UI consistency)
 * - visible: Show by default
 * - editable: User can edit this field (vs read-only from Bitrix24)
 * - order: Display order
 */
export const DEFAULT_COLUMNS: Omit<ColumnConfig, 'title'>[] = [
  // ========================================
  // EDITABLE FIELDS (User inputs)
  // ========================================
  { 
    key: 'product', 
    required: true, 
    locked: true, 
    visible: true, 
    editable: true,
    order: 1, 
    width: 280 
  },
  { 
    key: 'quantity', 
    required: true, 
    locked: true, 
    visible: true, 
    editable: true,
    order: 2, 
    width: 100 
  },
  { 
    key: 'salePrice', 
    required: true, 
    locked: true, 
    visible: true, 
    editable: true,
    order: 3, 
    width: 200 
  },
  { 
    key: 'purchasePrice', 
    required: true, 
    locked: true, 
    visible: true, 
    editable: true,
    order: 4, 
    width: 200 
  },
  { 
    key: 'totalMargin', 
    required: true, 
    locked: true, 
    visible: true, 
    editable: true,
    order: 5, 
    width: 160 
  },
  { 
    key: 'supplier', 
    required: false, 
    locked: false, 
    visible: true, 
    editable: true,
    order: 6, 
    width: 180 
  },
  { 
    key: 'transportCost', 
    required: false, 
    locked: false, 
    visible: true, 
    editable: true,
    order: 7, 
    width: 200 
  },
  { 
    key: 'packagingCost', 
    required: false, 
    locked: false, 
    visible: true, 
    editable: true,
    order: 8, 
    width: 200 
  },
  { 
    key: 'marginPercent', 
    required: false, 
    locked: false, 
    visible: true, 
    editable: true,
    order: 9, 
    width: 120 
  },
  { 
    key: 'marginPerUnit', 
    required: false, 
    locked: false, 
    visible: true, 
    editable: true,
    order: 10, 
    width: 150 
  },
  { 
    key: 'action', 
    required: true, 
    locked: true, 
    visible: true, 
    editable: false,
    order: 11, 
    width: 80 
  },

  // ========================================
  // READ-ONLY FIELDS (From Bitrix24 ProductRow)
  // Hidden by default, can be shown in column settings
  // ========================================
  { 
    key: 'ID', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 100, 
    width: 80 
  },
  { 
    key: 'OWNER_ID', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 101, 
    width: 100 
  },
  { 
    key: 'OWNER_TYPE', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 102, 
    width: 120 
  },
  { 
    key: 'PRODUCT_ID', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 103, 
    width: 100 
  },
  { 
    key: 'ORIGINAL_PRODUCT_NAME', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 104, 
    width: 250 
  },
  { 
    key: 'PRODUCT_DESCRIPTION', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 105, 
    width: 300 
  },
  { 
    key: 'PRICE_EXCLUSIVE', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 106, 
    width: 150 
  },
  { 
    key: 'PRICE_NETTO', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 107, 
    width: 120 
  },
  { 
    key: 'PRICE_BRUTTO', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 108, 
    width: 120 
  },
  { 
    key: 'PRICE_ACCOUNT', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 109, 
    width: 150 
  },
  { 
    key: 'DISCOUNT_TYPE_ID', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 110, 
    width: 130 
  },
  { 
    key: 'DISCOUNT_RATE', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 111, 
    width: 130 
  },
  { 
    key: 'DISCOUNT_SUM', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 112, 
    width: 130 
  },
  { 
    key: 'TAX_RATE', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 113, 
    width: 100 
  },
  { 
    key: 'TAX_INCLUDED', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 114, 
    width: 120 
  },
  { 
    key: 'CUSTOMIZED', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 115, 
    width: 120 
  },
  { 
    key: 'MEASURE_CODE', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 116, 
    width: 120 
  },
  { 
    key: 'MEASURE_NAME', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 117, 
    width: 150 
  },
  { 
    key: 'SORT', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 118, 
    width: 80 
  },
  { 
    key: 'XML_ID', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 119, 
    width: 150 
  },
  { 
    key: 'TYPE', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 120, 
    width: 80 
  },
  { 
    key: 'STORE_ID', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 121, 
    width: 100 
  },
  { 
    key: 'RESERVE_ID', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 122, 
    width: 100 
  },
  { 
    key: 'RESERVE_QUANTITY', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 123, 
    width: 150 
  },
  { 
    key: 'DATE_RESERVE_END', 
    required: false, 
    locked: false, 
    visible: false, 
    editable: false,
    order: 124, 
    width: 150 
  },
]