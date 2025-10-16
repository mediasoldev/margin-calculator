// frontend/src/services/pricing/ProductService.ts

/**
 * Service for working with deal products
 */

import { bx24Service } from '../bitrix24/Bitrix24Service'
import type { ProductRow, ProductRowFields } from '../bitrix24/types'

export class ProductService {
  /**
   * Get all products from deal
   * @param dealId - Deal ID
   * @returns Array of product rows
   */
  public async getDealProducts(dealId: string): Promise<ProductRow[]> {
    const response = await bx24Service.call<ProductRow[]>('crm.deal.productrows.get', { 
      id: dealId 
    })
    return response || []
  }

  /**
   * Update products in deal
   * @param dealId - Deal ID
   * @param products - Array of product rows
   */
  public async updateDealProducts(dealId: string, products: ProductRow[]): Promise<boolean> {
    const response = await bx24Service.call('crm.deal.productrows.set', { 
      id: dealId, 
      rows: products 
    })
    return !!response
  }

  /**
   * Get available product fields (including dynamic fields info)
   * @returns Fields structure with titles
   */
  public async getProductFields(): Promise<ProductRowFields> {
    const response = await bx24Service.call<ProductRowFields>('crm.productrow.fields')
    return response || {}
  }

  /**
   * Get product from catalog by ID
   */
  public async getProduct(productId: string): Promise<any> {
    const response = await bx24Service.call('crm.product.get', { id: productId })
    return response
  }

  /**
   * Search products in catalog
   */
  public async searchProducts(query: string): Promise<any[]> {
    const response = await bx24Service.call('crm.product.list', {
      filter: { '%NAME': query },
      select: ['ID', 'NAME', 'PRICE']
    })
    return response || []
  }
}

export const productService = new ProductService()