// frontend/src/services/bitrix24/Bitrix24Service.ts

/**
 * Base service for Bitrix24 API communication
 * Wraps BX24 SDK and provides type-safe Promise-based methods
 */

import type { BX24Response, BX24BatchResponse, PlacementInfo } from './types'

export class Bitrix24Service {
  private static instance: Bitrix24Service

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): Bitrix24Service {
    if (!Bitrix24Service.instance) {
      Bitrix24Service.instance = new Bitrix24Service()
    }
    return Bitrix24Service.instance
  }

  /**
   * Initialize BX24 SDK
   * Call BX24.init() and wait for ready
   */
  public async init(): Promise<void> {
    return new Promise((resolve) => {
      if (window.BX24) {
        window.BX24.init(() => {
          console.log('[BX24] Initialized successfully')
          resolve()
        })
      } else {
        console.warn('[BX24] SDK not available, using mock mode')
        resolve()
      }
    })
  }

  /**
   * Get placement info (deal ID, placement name, etc)
   * Synchronous method
   * @returns Placement information
   */
  public getPlacementInfo(): PlacementInfo {
    if (window.BX24) {
      try {
        const info = window.BX24.placement.info()
        console.log('[BX24] Placement info:', info)
        return info
      } catch (error) {
        console.error('[BX24] Error getting placement info:', error)
        return {
          placement: '',
          options: {}
        }
      }
    }
    
    // Mock for development
    return {
      placement: 'CRM_DEAL_DETAIL_TAB',
      options: { ID: '' }
    }
  }

  /**
   * Single API call
   * @param method - BX24 API method name
   * @param params - Method parameters
   * @returns API response data directly (not wrapped)
   */
  public async call<T = any>(method: string, params?: Record<string, any>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!window.BX24) {
        console.error('[BX24] SDK not available')
        reject(new Error('BX24 SDK not available'))
        return
      }

      console.log(`[BX24] Calling ${method}`, params)

      window.BX24.callMethod(method, params || {}, (result: any) => {
        if (result.error()) {
          const error = result.error()
          console.error(`[BX24] Error in ${method}:`, error)
          reject(error)
        } else {
          const data = result.data()
          console.log(`[BX24] Success ${method}:`, data)
          resolve(data)
        }
      })
    })
  }

  /**
   * Batch API call
   * @param commands - Object with named commands
   * @returns Batch results with named keys
   */
  public async callBatch(
    commands: Record<string, [string, Record<string, any>?]>
  ): Promise<BX24BatchResponse> {
    return new Promise((resolve, reject) => {
      if (!window.BX24) {
        console.error('[BX24] SDK not available')
        reject(new Error('BX24 SDK not available'))
        return
      }

      console.log('[BX24] Calling batch:', Object.keys(commands))

      window.BX24.callBatch(commands, (result: any) => {
        console.log('[BX24] Batch result:', result)

        // Extract data from each command result
        const data: Record<string, any> = {}
        let hasErrors = false
        const errors: Record<string, any> = {}

        for (const key in commands) {
          if (result[key]) {
            if (result[key].error && result[key].error()) {
              hasErrors = true
              errors[key] = result[key].error()
              console.error(`[BX24] Error in batch command ${key}:`, errors[key])
            } else {
              data[key] = result[key].data()
            }
          }
        }

        if (hasErrors) {
          console.error('[BX24] Batch has errors:', errors)
        }

        resolve({
          result: data,
          error: hasErrors ? errors : null,
          result_error: hasErrors ? errors : undefined
        })
      })
    })
  }

  /**
   * Get current user ID
   */
  public async getCurrentUserId(): Promise<number> {
    try {
      const response = await this.call<{ ID: number }>('user.current')
      return response.ID || 0
    } catch (error) {
      console.error('[BX24] Error getting current user:', error)
      return 0
    }
  }

  /**
   * Show error notification
   */
  public showError(message: string): void {
    if (window.BX24) {
      // BX24.showError is not in all versions, fallback to console
      console.error('[BX24] Error:', message)
    } else {
      console.error('[BX24] Error:', message)
    }
  }

  /**
   * Show success notification (if available)
   */
  public showSuccess(message: string): void {
    console.log('[BX24] Success:', message)
  }
}

export const bx24Service = Bitrix24Service.getInstance()