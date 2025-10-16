// frontend/src/services/bitrix24/types.ts

/**
 * Bitrix24 API types
 */

export interface BX24Response<T = any> {
  result: T
  error: any | null
  time?: any
  total?: number
  next?: number
}

export interface BX24BatchResponse {
  result: Record<string, any>
  error: any | null
  result_error?: Record<string, any>
  result_total?: Record<string, number>
  result_next?: Record<string, number>
}

export interface PlacementInfo {
  placement: string
  options: {
    ID?: string
    [key: string]: any
  }
}

export interface Deal {
  ID: string
  TITLE: string
  OPPORTUNITY: string
  CURRENCY_ID: string
  STAGE_ID: string
  CATEGORY_ID: string
  ASSIGNED_BY_ID: string
  COMPANY_ID: string | null
  CONTACT_ID: string | null
  [key: string]: any
}

export interface ProductRow {
  ID: string
  OWNER_ID: string
  OWNER_TYPE: string
  PRODUCT_ID: number
  PRODUCT_NAME: string
  ORIGINAL_PRODUCT_NAME?: string
  PRODUCT_DESCRIPTION?: string
  PRICE: number
  PRICE_EXCLUSIVE: number
  PRICE_NETTO: number
  PRICE_BRUTTO: number
  PRICE_ACCOUNT: string
  QUANTITY: number
  DISCOUNT_TYPE_ID: number
  DISCOUNT_RATE: number
  DISCOUNT_SUM: number
  TAX_RATE: number | null
  TAX_INCLUDED: string
  CUSTOMIZED: string
  MEASURE_CODE: number
  MEASURE_NAME: string
  SORT: number
  XML_ID: string
  TYPE: number
  STORE_ID?: number
  RESERVE_ID?: number
  RESERVE_QUANTITY?: number
  DATE_RESERVE_END?: string
  [key: string]: any
}

export interface ProductRowField {
  type: string
  isRequired: boolean
  isReadOnly: boolean
  isImmutable: boolean
  isMultiple: boolean
  isDynamic: boolean
  title: string
}

export interface ProductRowFields {
  [key: string]: ProductRowField
}

export interface EntityItem {
  ID: string
  NAME: string
  DESCRIPTION?: any
  [key: string]: any
}

export interface Company {
  ID: string
  TITLE: string
  COMPANY_TYPE?: string
  [key: string]: any
}