// frontend/src/types/pricing.types.ts

/**
 * Product entity with all pricing fields
 */
export interface Product {
  // Core fields
  id: string
  name: string
  quantity: number
  
  // Sale price
  salePrice: number
  saleCurrency: Currency
  
  // Purchase price
  purchasePrice: number
  purchaseCurrency: Currency
  
  // Additional costs (per row, not per unit)
  transportCost: number
  transportCurrency: Currency
  packagingCost: number
  packagingCurrency: Currency
  
  // Supplier
  supplierId?: string
  supplierName?: string
  
  // Internal computed fields (used for UI inputs)
  _totalMarginInput?: number      // Total margin (editable)
  _marginPercentInput?: number    // Margin % (editable)
  _marginPerUnitInput?: number    // Margin per unit (editable)
  _marginAmount?: number          // Margin per unit (calculated, read-only)
  
  // ✅ ALL Bitrix24 ProductRow fields (read-only)
  productId: string
  ID?: string
  OWNER_ID?: string
  OWNER_TYPE?: string
  PRODUCT_ID?: number
  ORIGINAL_PRODUCT_NAME?: string
  PRODUCT_DESCRIPTION?: string
  PRICE_EXCLUSIVE?: number
  PRICE_NETTO?: number
  PRICE_BRUTTO?: number
  PRICE_ACCOUNT?: string
  DISCOUNT_TYPE_ID?: number
  DISCOUNT_RATE?: number
  DISCOUNT_SUM?: number
  TAX_RATE?: number | null
  TAX_INCLUDED?: string
  CUSTOMIZED?: string
  MEASURE_CODE?: number
  MEASURE_NAME?: string
  SORT?: number
  XML_ID?: string
  TYPE?: number
  STORE_ID?: number
  RESERVE_ID?: number
  RESERVE_QUANTITY?: number
  DATE_RESERVE_END?: string
  
  // Allow any other fields
  [key: string]: any
}

/**
 * Currency type
 */
export type Currency = 'PLN' | 'USD' | 'EUR'

/**
 * Exchange rates
 */
export interface ExchangeRates {
  usdToPln: number
  eurToPln: number
  eurToUsd: number
}

/**
 * ✅ SIMPLIFIED: Column configuration
 * No more isDynamic flag - just editable vs read-only
 */
export interface ColumnConfig {
  key: string
  title: string
  required: boolean   // Cannot be hidden
  locked: boolean     // Cannot be hidden (same as required)
  visible: boolean    // Currently visible
  editable: boolean   // User can edit (vs read-only from Bitrix24)
  order: number       // Display order
  width?: number      // Column width
}

/**
 * Supplier entity
 */
export interface Supplier {
  id: string
  name: string
}

/**
 * Totals summary
 */
export interface Totals {
  amount: number   // Total sale amount
  margin: number   // Total margin
}

/**
 * View mode type
 */
export type ViewMode = 'table' | 'cards' | 'accordion'

/**
 * Product calculation result
 */
export interface ProductCalculation {
  totalMargin: number      // Total margin for all quantity
  marginPercent: number    // Margin percentage
  marginPerUnit: number    // Margin per single unit
  revenue: number          // Total revenue in PLN
  totalCost: number        // Total cost in PLN
}

/**
 * Pricing context provided to child components
 */
export interface PricingContext {
  // State
  products: Product[]
  exchangeRates: ExchangeRates
  totals: Totals
  columns: ColumnConfig[]
  suppliers: Supplier[]
  viewMode: ViewMode
  loading: boolean
  saving: boolean
  
  // Methods
  updateProduct: (productId: string, updates: Partial<Product>) => void
  deleteProduct: (productId: string) => void
  calculateProductValues: (product: Product) => void
  recalculateFromMarginPercent: (product: Product) => void
  recalculateFromTotalMargin: (product: Product) => void
  recalculateFromMarginPerUnit: (product: Product) => void
  saveToDeal: () => Promise<void>
  refreshProducts: () => Promise<void>
  
  // Column management
  saveColumnsConfig: (columns: ColumnConfig[]) => void
}

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  COLUMNS_CONFIG: 'pricingColumnsConfig',
  COLUMN_WIDTHS: 'pricingColumnWidths',
} as const