// frontend/src/services/pricing/DealService.ts

/**
 * Service for working with CRM deals
 */

import { bx24Service } from '../bitrix24/Bitrix24Service'
import type { Deal } from '../bitrix24/types'

export class DealService {
  /**
   * Get deal by ID
   * @param dealId - Deal ID
   * @returns Deal data
   */
  public async getDeal(dealId: string): Promise<Deal> {
    const response = await bx24Service.call<Deal>('crm.deal.get', { id: dealId })
    return response
  }

  /**
   * Update deal fields
   * @param dealId - Deal ID
   * @param fields - Fields to update
   */
  public async updateDeal(dealId: string, fields: Record<string, any>): Promise<boolean> {
    const response = await bx24Service.call('crm.deal.update', { id: dealId, fields })
    return !!response
  }

  /**
   * Get deal custom fields (UF_*)
   * @param dealId - Deal ID
   * @returns User fields values
   */
  public async getDealUserFields(dealId: string): Promise<Record<string, any>> {
    const deal = await this.getDeal(dealId)
    const userFields: Record<string, any> = {}
    
    for (const key in deal) {
      if (key.startsWith('UF_')) {
        userFields[key] = deal[key]
      }
    }
    
    return userFields
  }
}

export const dealService = new DealService()