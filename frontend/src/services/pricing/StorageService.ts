// frontend/src/services/pricing/StorageService.ts

/**
 * Service for working with entity.item storage
 * Handles both m_calculations and product_suppliers storages
 * Uses DETAIL_TEXT field for JSON data storage
 */

import { bx24Service } from '../bitrix24/Bitrix24Service'
import type { EntityItem } from '../bitrix24/types'

export class StorageService {
  private readonly CALCULATIONS_ENTITY = 'm_calculations'
  private readonly SUPPLIERS_ENTITY = 'product_suppliers'

  /**
   * Helper: Get latest item from array by ID
   */
  public getLatestItem(items: EntityItem[]): EntityItem | null {
    if (!items || items.length === 0) return null
    const sorted = items.sort((a, b) => parseInt(b.ID) - parseInt(a.ID))
    return sorted[0]
  }

  /**
   * Helper: Get latest item with parsed DETAIL_TEXT
   */
  public getLatestItemWithData(items: EntityItem[]): any | null {
    const latest = this.getLatestItem(items)
    if (!latest) return null
    
    if (latest.DETAIL_TEXT) {
      try {
        return {
          ...latest,
          data: JSON.parse(latest.DETAIL_TEXT)
        }
      } catch (error) {
        console.error('[Storage] Error parsing DETAIL_TEXT:', error)
        return null
      }
    }
    
    return null
  }

  /**
   * Public: Clean up duplicate calculation records - delete all except the latest one
   */
  public async cleanupCalculationDuplicates(items: EntityItem[]): Promise<void> {
    if (!items || items.length <= 1) return
    
    console.warn(`[Storage] Found ${items.length} calculation records, cleaning up old ones...`)
    
    // Sort by ID descending
    const sorted = items.sort((a, b) => parseInt(b.ID) - parseInt(a.ID))
    
    // Keep first (latest), delete all others
    const toDelete = sorted.slice(1)
    
    for (const item of toDelete) {
      try {
        await bx24Service.call('entity.item.delete', {
          ENTITY: this.CALCULATIONS_ENTITY,
          ID: item.ID
        })
        console.log(`[Storage] Deleted duplicate calculation record ID: ${item.ID}`)
      } catch (error) {
        console.error(`[Storage] Error deleting duplicate calculation ID ${item.ID}:`, error)
      }
    }
  }

  /**
   * Public: Clean up duplicate supplier records - delete all except the latest one
   */
  public async cleanupSupplierDuplicates(items: EntityItem[]): Promise<void> {
    if (!items || items.length <= 1) return
    
    console.warn(`[Storage] Found ${items.length} supplier records, cleaning up old ones...`)
    
    const sorted = items.sort((a, b) => parseInt(b.ID) - parseInt(a.ID))
    const toDelete = sorted.slice(1)
    
    for (const item of toDelete) {
      try {
        await bx24Service.call('entity.item.delete', {
          ENTITY: this.SUPPLIERS_ENTITY,
          ID: item.ID
        })
        console.log(`[Storage] Deleted duplicate supplier record ID: ${item.ID}`)
      } catch (error) {
        console.error(`[Storage] Error deleting duplicate supplier ID ${item.ID}:`, error)
      }
    }
  }

  /**
   * Get calculation by deal ID
   * @param dealId - Deal ID
   * @returns Saved calculation with parsed data or null
   */
  public async getCalculation(dealId: string): Promise<any | null> {
    const response = await bx24Service.call<EntityItem[]>('entity.item.get', {
      ENTITY: this.CALCULATIONS_ENTITY,
      FILTER: { NAME: `deal_${dealId}` }
    })
    
    if (!response || response.length === 0) return null
    
    // If multiple records found - clean up old ones
    if (response.length > 1) {
      await this.cleanupCalculationDuplicates(response)
    }
    
    // Get latest with parsed data
    return this.getLatestItemWithData(response)
  }

  /**
   * Save calculation for deal
   * @param dealId - Deal ID
   * @param data - Calculation data
   */
  public async saveCalculation(dealId: string, data: any): Promise<string> {
    const existing = await this.getCalculation(dealId)
    
    const detailText = JSON.stringify(data)
    
    if (existing) {
      await bx24Service.call('entity.item.update', {
        ENTITY: this.CALCULATIONS_ENTITY,
        ID: existing.ID,
        DETAIL_TEXT: detailText
      })
      console.log(`[Storage] Updated calculation for deal_${dealId}, ID: ${existing.ID}`)
      return existing.ID
    } else {
      const response = await bx24Service.call<string>('entity.item.add', {
        ENTITY: this.CALCULATIONS_ENTITY,
        NAME: `deal_${dealId}`,
        DETAIL_TEXT: detailText
      })
      console.log(`[Storage] Created new calculation for deal_${dealId}, ID: ${response}`)
      return response
    }
  }

  /**
   * Get supplier prices for product
   * @param productId - Product ID
   * @returns Supplier prices array or null
   */
  public async getSupplierPrices(productId: string): Promise<any | null> {
    const response = await bx24Service.call<EntityItem[]>('entity.item.get', {
      ENTITY: this.SUPPLIERS_ENTITY,
      FILTER: { NAME: `product_${productId}` }
    })
    
    if (!response || response.length === 0) return null
    
    // If multiple records found - clean up old ones
    if (response.length > 1) {
      await this.cleanupSupplierDuplicates(response)
    }
    
    // Get latest
    const latest = this.getLatestItem(response)
    if (!latest) return null
    
    // Parse DETAIL_TEXT as JSON array
    if (latest.DETAIL_TEXT) {
      try {
        return {
          ...latest,
          suppliers: JSON.parse(latest.DETAIL_TEXT)
        }
      } catch (error) {
        console.error('[Storage] Error parsing suppliers DETAIL_TEXT:', error)
        return null
      }
    }
    
    return null
  }

  /**
   * Save supplier prices for product
   * @param productId - Product ID
   * @param suppliers - Array of supplier data
   */
  public async saveSupplierPrices(productId: string, suppliers: any[]): Promise<string> {
    const existing = await this.getSupplierPrices(productId)
    
    const detailText = JSON.stringify(suppliers)
    
    if (existing) {
      await bx24Service.call('entity.item.update', {
        ENTITY: this.SUPPLIERS_ENTITY,
        ID: existing.ID,
        DETAIL_TEXT: detailText
      })
      console.log(`[Storage] Updated suppliers for product_${productId}, ID: ${existing.ID}`)
      return existing.ID
    } else {
      const response = await bx24Service.call<string>('entity.item.add', {
        ENTITY: this.SUPPLIERS_ENTITY,
        NAME: `product_${productId}`,
        DETAIL_TEXT: detailText
      })
      console.log(`[Storage] Created new suppliers for product_${productId}, ID: ${response}`)
      return response
    }
  }

  /**
   * Get multiple supplier prices by product IDs (batch)
   * Includes cleanup of duplicates
   */
  public async getMultipleSupplierPrices(productIds: string[]): Promise<Record<string, any[]>> {
    const commands: Record<string, [string, Record<string, any>]> = {}
    
    productIds.forEach((pid) => {
      commands[`supplier_${pid}`] = ['entity.item.get', {
        ENTITY: this.SUPPLIERS_ENTITY,
        FILTER: { NAME: `product_${pid}` }
      }]
    })
    
    const result = await bx24Service.callBatch(commands)
    const mapped: Record<string, any[]> = {}
    
    for (const key in result.result) {
      const productId = key.replace('supplier_', '')
      const data = result.result[key]
      
      if (data && data.length > 0) {
        // Cleanup duplicates if found
        if (data.length > 1) {
          await this.cleanupSupplierDuplicates(data)
        }
        
        // Take latest
        const latest = this.getLatestItem(data)
        
        if (latest && latest.DETAIL_TEXT) {
          try {
            mapped[productId] = JSON.parse(latest.DETAIL_TEXT)
          } catch (error) {
            console.error(`[Storage] Error parsing suppliers for product ${productId}:`, error)
            mapped[productId] = []
          }
        } else {
          mapped[productId] = []
        }
      } else {
        mapped[productId] = []
      }
    }
    
    return mapped
  }

  /**
   * Delete calculation
   */
  public async deleteCalculation(dealId: string): Promise<boolean> {
    const existing = await this.getCalculation(dealId)
    if (!existing) return false
    
    await bx24Service.call('entity.item.delete', {
      ENTITY: this.CALCULATIONS_ENTITY,
      ID: existing.ID
    })
    return true
  }
}

export const storageService = new StorageService()