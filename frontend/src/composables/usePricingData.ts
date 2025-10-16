// frontend/src/composables/usePricingData.ts

/**
 * Vue composable - facade for UI components
 * Wraps PricingDataService and provides reactive state
 */

import { ref, computed } from 'vue'
import { pricingDataService, type ComparisonStatus } from '@/services/pricing/PricingDataService'
import { companyService } from '@/services/pricing/CompanyService'
import type { Product, Supplier } from '@/types/pricing.types'

export function usePricingData() {
  // State
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const dealId = ref<string>('')
  const products = ref<Product[]>([])
  const suppliers = ref<Supplier[]>([])
  const savedCalculation = ref<any>(null)
  const productFields = ref<any>({})
  const dealCurrency = ref<string>('PLN')
  const comparisonStatus = ref<ComparisonStatus>('not_saved')
  const supplierPricesMap = ref<Record<string, any[]>>({})

  /**
   * Initialize and load all data
   */
  const initialize = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const placementInfo = await pricingDataService.getPlacementInfo()
      dealId.value = placementInfo.dealId

      if (!dealId.value) {
        throw new Error('Deal ID not found in placement')
      }

      await loadDealData(dealId.value)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Load all data for deal
   */
  const loadDealData = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const data = await pricingDataService.loadDealData(id)

      dealCurrency.value = data.deal?.CURRENCY_ID || 'PLN'
      productFields.value = data.productFields || {}
      comparisonStatus.value = data.comparisonStatus
      supplierPricesMap.value = data.supplierPrices || {}

      
      savedCalculation.value = data.calculation

      // IMPORTANT: Display saved calculation if exists, otherwise deal products
      if (savedCalculation.value?.data?.products) {
        // Show saved calculation
        products.value = savedCalculation.value.data.products
      } else {
        // Show fresh products from deal
        const savedProductsMap: Record<string, any> = {}
        
        products.value = pricingDataService.mapProductRowsToProducts(
          data.products,
          dealCurrency.value,
          savedProductsMap
        )
      }
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Save current calculation
   */
  const saveCalculation = async (exchangeRates: any, totals: any): Promise<void> => {
    if (!dealId.value) throw new Error('Deal ID not set')

    loading.value = true
    error.value = null

    try {
      await pricingDataService.saveCalculation(
        dealId.value,
        products.value,
        exchangeRates,
        totals
      )
      
      // Reload to update comparison status
      await loadDealData(dealId.value)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset to original deal products (discard calculations)
   */
  const resetToOriginal = async (): Promise<void> => {
    if (!dealId.value) throw new Error('Deal ID not set')

    loading.value = true
    error.value = null

    try {
      const freshProducts = await pricingDataService.resetToOriginal(dealId.value)
      products.value = freshProducts
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Add supplier for product
   */
  const addSupplierForProduct = async (
    productId: string,
    companyId: string,
    companyName: string,
    price: number,
    currency: string
  ): Promise<void> => {
    try {
      await pricingDataService.addSupplierForProduct(productId, companyId, companyName, price, currency)
      
      // Reload suppliers for this product
      const suppliers = await pricingDataService.getSuppliersForProduct(productId)
      supplierPricesMap.value[productId] = suppliers
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  /**
   * Update supplier price for product
   */
  const updateSupplierPrice = async (
    productId: string,
    companyId: string,
    price: number,
    currency: string
  ): Promise<void> => {
    try {
      await pricingDataService.updateSupplierPrice(productId, companyId, price, currency)
      
      // Reload suppliers for this product
      const suppliers = await pricingDataService.getSuppliersForProduct(productId)
      supplierPricesMap.value[productId] = suppliers
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  /**
   * Get supplier price for product
   */
  const getSupplierPrice = async (
    productId: string,
    companyId: string
  ): Promise<any> => {
    try {
      return await pricingDataService.getSupplierPrice(productId, companyId)
    } catch (err) {
      error.value = err as Error
      return null
    }
  }

  /**
   * Get suppliers for product
   */
  const getSuppliersForProduct = (productId: string): any[] => {
    return supplierPricesMap.value[productId] || []
  }

  /**
   * Reload suppliers list
   */
  const reloadSuppliers = async (): Promise<void> => {
    try {
      const companies = await companyService.getCompanies()
      suppliers.value = companies.map(c => ({
        id: c.ID,
        name: c.TITLE
      }))
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  // Computed
  const hasUnsavedChanges = computed(() => {
    if (!savedCalculation.value?.data?.products) return true
    return JSON.stringify(products.value) !== JSON.stringify(savedCalculation.value.data.products)
  })

  const isInitialized = computed(() => !!dealId.value)

  return {
    // State
    loading,
    error,
    dealId,
    products,
    suppliers,
    savedCalculation,
    productFields,
    dealCurrency,
    comparisonStatus,
    supplierPricesMap,

    // Computed
    hasUnsavedChanges,
    isInitialized,

    // Methods
    initialize,
    loadDealData,
    saveCalculation,
    resetToOriginal,
    addSupplierForProduct,
    updateSupplierPrice,
    getSupplierPrice,
    getSuppliersForProduct,
    reloadSuppliers,
  }
}