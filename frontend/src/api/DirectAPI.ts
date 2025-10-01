// frontend/src/api/DirectAPI.ts

/**
 * Direct API calls through BX24 JavaScript SDK
 * Uses current user permissions
 */
export class DirectAPI {
  private isReady: boolean = false

  constructor() {
    this.init()
  }

  private async init(): Promise<void> {
    if (window.BX24) {
      await new Promise<void>((resolve) => {
        window.BX24.init(() => {
          this.isReady = true
          resolve()
        })
      })
    }
  }

  async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    if (!window.BX24) {
      throw new Error('BX24 SDK not available')
    }

    await this.waitForReady()

    return new Promise((resolve, reject) => {
      window.BX24.callMethod(
        method,
        params,
        (result: any) => {
          if (result.error()) {
            reject({
              code: result.error(),
              message: result.error_description(),
              method
            })
          } else {
            resolve(result.data())
          }
        }
      )
    })
  }

  async batch(calls: Array<{ method: string; params?: Record<string, any> }>): Promise<any[]> {
    if (!window.BX24) {
      throw new Error('BX24 SDK not available')
    }

    await this.waitForReady()

    const batch: Record<string, any> = {}
    calls.forEach((call, index) => {
      batch[`cmd_${index}`] = [call.method, call.params || {}]
    })

    return new Promise((resolve, reject) => {
      window.BX24.callBatch(
        batch,
        (result: any) => {
          const results = []
          for (let i = 0; i < calls.length; i++) {
            const key = `cmd_${i}`
            if (result[key]) {
              results.push(result[key].data())
            }
          }
          resolve(results)
        }
      )
    })
  }

  private async waitForReady(): Promise<void> {
    let attempts = 0
    while (!this.isReady && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    if (!this.isReady) {
      throw new Error('BX24 SDK initialization timeout')
    }
  }
}

// frontend/src/api/ProxyAPI.ts

import axios from 'axios'

/**
 * Proxy API calls through backend
 * Uses admin OAuth tokens stored on server
 */
export class ProxyAPI {
  private baseURL: string
  private client: any

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '/api'
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })

    // Add auth interceptor
    this.client.interceptors.request.use((config: any) => {
      // Add auth token if available
      const token = localStorage.getItem('app_token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      
      // Add Bitrix24 domain
      const domain = this.getBX24Domain()
      if (domain) {
        config.headers['X-BX24-Domain'] = domain
      }
      
      return config
    })
  }

  async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await this.client.post('/bitrix24/call', {
        method,
        params
      })
      
      return response.data.result
    } catch (error: any) {
      throw {
        code: error.response?.data?.error || 'PROXY_ERROR',
        message: error.response?.data?.error_description || error.message,
        method
      }
    }
  }

  async batch(calls: Array<{ method: string; params?: Record<string, any> }>): Promise<any[]> {
    try {
      const response = await this.client.post('/bitrix24/batch', {
        calls
      })
      
      return response.data.results
    } catch (error: any) {
      throw {
        code: error.response?.data?.error || 'PROXY_BATCH_ERROR',
        message: error.response?.data?.error_description || error.message
      }
    }
  }

  private getBX24Domain(): string | null {
    if (window.BX24) {
      try {
        const auth = window.BX24.getAuth()
        return auth?.domain || null
      } catch {
        return null
      }
    }
    return null
  }
}

// frontend/src/api/index.ts

/**
 * Public API interface
 * Re-export updated methods to use HybridClient
 */

import { hybridClient, type ApiOptions } from './HybridClient'

// Products
export const fetchProductsFromBitrix = async (dealId?: string): Promise<any[]> => {
  const method = 'crm.deal.productrows.get'
  const params = { 
    id: dealId || getCurrentDealId() 
  }
  
  const response = await hybridClient.call(method, params)
  return response.data
}

// Suppliers  
export const fetchSuppliersFromBitrix = async (): Promise<any[]> => {
  // Custom entity for suppliers - needs proxy
  const response = await hybridClient.call(
    'entity.item.get',
    { entityTypeId: 'SUPPLIERS' },
    { forceSource: 'proxy' } // Explicitly use proxy
  )
  return response.data
}

// Supplier prices
export const fetchSupplierPrice = async (
  productId: string,
  supplierId: string
): Promise<any | null> => {
  const response = await hybridClient.call(
    'entity.item.get',
    { 
      entityTypeId: 'SUPPLIER_PRICES',
      filter: { productId, supplierId }
    },
    { forceSource: 'proxy', useCache: true }
  )
  return response.data?.[0] || null
}

// Save to deal
export const saveDealToBitrix = async (data: any): Promise<boolean> => {
  const dealId = getCurrentDealId()
  
  // Update deal products - requires permissions
  const response = await hybridClient.call(
    'crm.deal.productrows.set',
    {
      id: dealId,
      rows: data.products
    },
    { forceSource: 'proxy' } // Always use proxy for updates
  )
  
  return !!response.data
}

// Get current deal ID
export const getCurrentDealId = (): string => {
  if (window.BX24) {
    const placement = window.BX24.placement.info()
    return placement?.options?.ID || ''
  }
  return ''
}

// Export client for direct use
export { hybridClient }