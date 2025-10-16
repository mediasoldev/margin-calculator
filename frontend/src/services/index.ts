// frontend/src/services/index.ts

/**
 * Central export point for all services
 * Import services from here instead of individual files
 */

// Bitrix24 core
export { bx24Service, Bitrix24Service } from './bitrix24/Bitrix24Service'
export { BatchRequestBuilder } from './bitrix24/BatchRequestBuilder'
export * from './bitrix24/types'

// Pricing services
export { dealService, DealService } from './pricing/DealService'
export { productService, ProductService } from './pricing/ProductService'
export { storageService, StorageService } from './pricing/StorageService'
export { companyService, CompanyService } from './pricing/CompanyService'
export { pricingDataService, PricingDataService } from './pricing/PricingDataService'

// Composables
export { usePricingData } from '@/composables/usePricingData'
export { useColumnManagement } from '@/composables/useColumnManagement'
export { usePricingCalculations } from '@/composables/usePricingCalculations'
export { useCurrencyConversion } from '@/composables/useCurrencyConversion'