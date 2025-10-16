// frontend/src/services/pricing/PricingDataService.ts

/**
 * Orchestrator service - coordinates all data loading/saving
 * Main service for PricingCalculator component
 */

import { BatchRequestBuilder } from '../bitrix24/BatchRequestBuilder'
import { bx24Service } from '../bitrix24/Bitrix24Service'
import { productService } from './ProductService'
import { storageService } from './StorageService'
import type { Product, Supplier } from '@/types/pricing.types'
import type { Deal, ProductRow, ProductRowFields } from '../bitrix24/types'

export type ComparisonStatus = 'matches' | 'differs' | 'not_saved'

export class PricingDataService {
  /**
   * Load all data for deal in optimized way (using batches)
   * @param dealId - Deal ID
   * @returns All necessary data
   */
  public async loadDealData(dealId: string) {
    // Batch 1: Deal info + Products + Calculation + ProductRow Fields
    const batch1 = new BatchRequestBuilder()
      .add('deal', 'crm.deal.get', { id: dealId })
      .add('products', 'crm.deal.productrows.get', { id: dealId })
      .add('calculation', 'entity.item.get', { 
        ENTITY: 'm_calculations',
        FILTER: { NAME: `deal_${dealId}` }
      })
      .add('productFields', 'crm.productrow.fields', {})
    
    const result1 = await batch1.execute()
    
    const deal = result1.result.deal as Deal
    const productRows = result1.result.products as ProductRow[] || []
    const calculationRaw = result1.result.calculation as any[] || []
    const productFields = result1.result.productFields as ProductRowFields || {}
    
    // Handle calculation duplicates
    let calculation = null
    if (calculationRaw && calculationRaw.length > 0) {
      // Cleanup duplicates if found
      if (calculationRaw.length > 1) {
        await storageService.cleanupCalculationDuplicates(calculationRaw)
      }
      
      // Get latest with parsed data
      calculation = storageService.getLatestItemWithData(calculationRaw)
    }
    
    // Batch 2: Supplier prices for found products (if any)
    const productIds = productRows.map((p: ProductRow) => p.PRODUCT_ID.toString())
    let supplierPrices: Record<string, any[]> = {}
    
    if (productIds.length > 0) {
      supplierPrices = await storageService.getMultipleSupplierPrices(productIds)
    }
    
    // Compare saved calculation with current deal products
    const comparisonStatus = this.compareCalculationWithDeal(calculation, productRows)
    
    return {
      deal,
      products: productRows,
      calculation,
      supplierPrices,
      productFields,
      comparisonStatus
    }
  }

  /**
   * Compare saved calculation with current deal products
   * @param calculation - Saved calculation from storage
   * @param productRows - Current products from deal
   * @returns Comparison status
   */
  public compareCalculationWithDeal(
    calculation: any | null,
    productRows: ProductRow[]
  ): ComparisonStatus {
    if (!calculation || !calculation.data || !calculation.data.products) {
      return 'not_saved'
    }

    const savedProducts = calculation.data.products
    
    // Create map of current products for quick lookup
    const currentProductsMap = new Map<string, ProductRow>()
    productRows.forEach(p => {
      currentProductsMap.set(p.ID, p)
    })

    // Check if all saved products match current products
    let allMatch = true

    for (const savedProduct of savedProducts) {
      const currentProduct = currentProductsMap.get(savedProduct.id)
      
      if (!currentProduct) {
        allMatch = false
        break
      }

      // Compare: quantity, salePrice, saleCurrency
      if (
        currentProduct.QUANTITY !== savedProduct.quantity ||
        currentProduct.PRICE !== savedProduct.salePrice
        // Note: saleCurrency comes from deal, not from product row
      ) {
        allMatch = false
        break
      }
    }

    return allMatch ? 'matches' : 'differs'
  }

  /**
   * Save calculation to storage
   * @param dealId - Deal ID
   * @param products - Products with calculations
   * @param exchangeRates - Exchange rates used
   * @param totals - Calculated totals
   */
  public async saveCalculation(
    dealId: string, 
    products: Product[], 
    exchangeRates: any,
    totals: any
  ): Promise<void> {
    const data = {
      deal_id: dealId,
      calculated_at: new Date().toISOString(),
      exchange_rates: exchangeRates,
      products: products,
      totals: totals
    }
    
    await storageService.saveCalculation(dealId, data)
  }

  /**
   * Reset to original deal data (discard calculations)
   * @param dealId - Deal ID
   * @returns Fresh products from deal
   */
  public async resetToOriginal(dealId: string): Promise<Product[]> {
    const products = await productService.getDealProducts(dealId)
    return this.mapProductRowsToProducts(products, 'PLN', {})
  }

  /**
   * Add supplier for product
   */
  public async addSupplierForProduct(
    productId: string,
    companyId: string,
    companyName: string,
    price: number,
    currency: string
  ): Promise<void> {
    const existing = await storageService.getSupplierPrices(productId)
    const suppliers = existing?.suppliers || []
    
    // Check if supplier already exists
    const index = suppliers.findIndex((s: any) => s.company_id === companyId)
    
    if (index >= 0) {
      // Update existing
      suppliers[index] = { company_id: companyId, company_name: companyName, price, currency }
    } else {
      // Add new
      suppliers.push({ company_id: companyId, company_name: companyName, price, currency })
    }
    
    await storageService.saveSupplierPrices(productId, suppliers)
  }

  /**
   * Update supplier price for product
   */
  public async updateSupplierPrice(
    productId: string,
    companyId: string,
    price: number,
    currency: string
  ): Promise<void> {
    const existing = await storageService.getSupplierPrices(productId)
    const suppliers = existing?.suppliers || []
    
    const index = suppliers.findIndex((s: any) => s.company_id === companyId)
    if (index >= 0) {
      suppliers[index].price = price
      suppliers[index].currency = currency
      
      // Update company name from Bitrix24 (check if changed)
      try {
        const { companyService } = await import('./CompanyService')
        const company = await companyService.getCompany(companyId)
        suppliers[index].company_name = company.TITLE
      } catch (error) {
        console.error('[PricingData] Error updating company name:', error)
      }
      
      await storageService.saveSupplierPrices(productId, suppliers)
    }
  }

  /**
   * Get supplier price for product
   */
  public async getSupplierPrice(productId: string, companyId: string): Promise<any> {
    const data = await storageService.getSupplierPrices(productId)
    const suppliers = data?.suppliers || []
    return suppliers.find((s: any) => s.company_id === companyId)
  }

  /**
   * Get all suppliers for product
   */
  public async getSuppliersForProduct(productId: string): Promise<any[]> {
    const data = await storageService.getSupplierPrices(productId)
    return data?.suppliers || []
  }

  /**
   * ✅ FIX: Map Bitrix24 ProductRow to our Product type
   * Preserve ALL ProductRow fields as dynamic fields
   */
  public mapProductRowsToProducts(
    rows: ProductRow[], 
    dealCurrency: string,
    savedProducts: Record<string, any>
  ): Product[] {
    return rows.map(row => {
      const savedProduct = savedProducts[row.ID]
      
      // ✅ Create base product with core fields
      const product: Product = {
        // Core fields
        id: row.ID,
        productId: row.PRODUCT_ID.toString(),
        name: row.PRODUCT_NAME,
        quantity: row.QUANTITY,
        
        // Sale price
        salePrice: row.PRICE,
        saleCurrency: dealCurrency as any,
        
        // Purchase price (from saved or default)
        purchasePrice: savedProduct?.purchasePrice || 0,
        purchaseCurrency: savedProduct?.purchaseCurrency || dealCurrency as any,
        
        // Additional costs (from saved or default)
        transportCost: savedProduct?.transportCost || 0,
        transportCurrency: savedProduct?.transportCurrency || dealCurrency as any,
        packagingCost: savedProduct?.packagingCost || 0,
        packagingCurrency: savedProduct?.packagingCurrency || dealCurrency as any,
        
        // Supplier
        supplierId: savedProduct?.supplierId,
        supplierName: savedProduct?.supplierName,
        
        // Internal calculated fields
        _totalMarginInput: savedProduct?._totalMarginInput || 0,
        _marginPercentInput: savedProduct?._marginPercentInput || 0,
        _marginPerUnitInput: savedProduct?._marginPerUnitInput || 0,
        _marginAmount: savedProduct?._marginAmount || 0,
      }
      
      // ✅ FIX: Copy ALL ProductRow fields as dynamic fields
      // This ensures all Bitrix24 fields are available for display
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          // Skip fields that are already mapped to core fields
          const skipFields = ['ID', 'PRODUCT_ID', 'PRODUCT_NAME', 'QUANTITY', 'PRICE']
          if (!skipFields.includes(key)) {
            product[key] = row[key]
          }
        }
      }
      
      return product
    })
  }

  /**
   * Get placement info (deal ID from context)
   */
  public async getPlacementInfo(): Promise<{ dealId: string }> {
    const info = bx24Service.getPlacementInfo()
    return {
      dealId: info.options?.ID || ''
    }
  }
}

export const pricingDataService = new PricingDataService()