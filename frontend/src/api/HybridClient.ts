// frontend/src/api/HybridClient.ts

import { DirectAPI } from './DirectAPI'
import { ProxyAPI } from './ProxyAPI'
import { apiRouting, type ApiMethod, type ApiSource } from './config/routing'

export interface ApiResponse<T = any> {
  data: T
  source: 'direct' | 'proxy'
  cached?: boolean
}

export interface ApiOptions {
  forceSource?: ApiSource
  useCache?: boolean
  showError?: boolean
}

class HybridClient {
  private directAPI: DirectAPI
  private proxyAPI: ProxyAPI
  private cache: Map<string, { data: any; timestamp: number }>
  private cacheTimeout: number = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.directAPI = new DirectAPI()
    this.proxyAPI = new ProxyAPI()
    this.cache = new Map()
  }

  /**
   * Universal method for API calls
   * Automatically routes to correct source based on configuration
   */
  async call<T = any>(
    method: ApiMethod,
    params: Record<string, any> = {},
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    // Check cache first
    if (options.useCache !== false) {
      const cached = this.getFromCache(method, params)
      if (cached) {
        return { data: cached, source: 'direct', cached: true }
      }
    }

    // Determine source from config or options
    const source = options.forceSource || this.getMethodSource(method)
    
    try {
      let result: T
      
      if (source === 'direct') {
        result = await this.directAPI.call<T>(method, params)
      } else if (source === 'proxy') {
        result = await this.proxyAPI.call<T>(method, params)
      } else {
        throw new Error(`Unknown source: ${source}`)
      }

      // Cache successful result
      this.saveToCache(method, params, result)
      
      return { data: result, source }
    } catch (error) {
      if (options.showError !== false) {
        this.handleError(error, method, source)
      }
      throw error
    }
  }

  /**
   * Batch API calls with optimal routing
   */
  async batch(
    calls: Array<{ method: ApiMethod; params?: Record<string, any> }>,
    options: ApiOptions = {}
  ): Promise<ApiResponse[]> {
    // Group calls by source
    const directCalls = calls.filter(c => this.getMethodSource(c.method) === 'direct')
    const proxyCalls = calls.filter(c => this.getMethodSource(c.method) === 'proxy')
    
    const results: ApiResponse[] = []
    
    // Execute direct calls
    if (directCalls.length > 0) {
      const directResults = await this.directAPI.batch(directCalls)
      results.push(...directResults.map(data => ({ data, source: 'direct' as const })))
    }
    
    // Execute proxy calls
    if (proxyCalls.length > 0) {
      const proxyResults = await this.proxyAPI.batch(proxyCalls)
      results.push(...proxyResults.map(data => ({ data, source: 'proxy' as const })))
    }
    
    return results
  }

  /**
   * Get configured source for method
   */
  private getMethodSource(method: ApiMethod): ApiSource {
    // Check specific method config
    if (apiRouting.methods[method]) {
      return apiRouting.methods[method]
    }
    
    // Check pattern matching
    for (const pattern of apiRouting.patterns) {
      if (new RegExp(pattern.pattern).test(method)) {
        return pattern.source
      }
    }
    
    // Default fallback
    return apiRouting.default
  }

  /**
   * Cache management
   */
  private getCacheKey(method: string, params: Record<string, any>): string {
    return `${method}:${JSON.stringify(params)}`
  }

  private getFromCache(method: string, params: Record<string, any>): any | null {
    const key = this.getCacheKey(method, params)
    const cached = this.cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    
    return null
  }

  private saveToCache(method: string, params: Record<string, any>, data: any): void {
    const key = this.getCacheKey(method, params)
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * Error handling
   */
  private handleError(error: any, method: string, source: string): void {
    console.error(`API Error [${source}] ${method}:`, error)
    
    // You can add custom error notifications here
    if (error.code === 'ACCESS_DENIED') {
      // Show permission request dialog
      this.showPermissionDialog(method)
    }
  }

  private showPermissionDialog(method: string): void {
    // TODO: Implement permission request UI
    console.warn(`Permission required for method: ${method}`)
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton instance
export const hybridClient = new HybridClient()
