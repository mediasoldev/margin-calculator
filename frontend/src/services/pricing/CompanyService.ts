// frontend/src/services/pricing/CompanyService.ts

/**
 * Service for working with companies (suppliers)
 */

import { bx24Service } from '../bitrix24/Bitrix24Service'
import type { Company } from '../bitrix24/types'

export class CompanyService {
  /**
   * Get all companies (potential suppliers)
   * @param filter - Optional filter (e.g. only suppliers)
   * @returns Array of companies
   */
  public async getCompanies(filter?: Record<string, any>): Promise<Company[]> {
    const response = await bx24Service.call<Company[]>('crm.company.list', {
      filter: filter || {},
      select: ['ID', 'TITLE', 'COMPANY_TYPE']
    })
    return response || []
  }

  /**
   * Get company by ID
   */
  public async getCompany(companyId: string): Promise<Company> {
    const response = await bx24Service.call<Company>('crm.company.get', { id: companyId })
    return response
  }

  /**
   * Search companies by name
   */
  public async searchCompanies(query: string): Promise<Company[]> {
    const response = await bx24Service.call<Company[]>('crm.company.list', {
      filter: { '%TITLE': query },
      select: ['ID', 'TITLE']
    })
    return response || []
  }

  /**
   * Get companies by IDs (batch)
   */
  public async getCompaniesByIds(companyIds: string[]): Promise<Record<string, Company>> {
    const commands: Record<string, [string, Record<string, any>]> = {}
    
    companyIds.forEach((id) => {
      commands[`company_${id}`] = ['crm.company.get', { id }]
    })
    
    const result = await bx24Service.callBatch(commands)
    const mapped: Record<string, Company> = {}
    
    for (const key in result.result) {
      const companyId = key.replace('company_', '')
      mapped[companyId] = result.result[key]
    }
    
    return mapped
  }
}

export const companyService = new CompanyService()