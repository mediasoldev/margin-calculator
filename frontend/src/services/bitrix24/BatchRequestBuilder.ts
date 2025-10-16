// frontend/src/services/bitrix24/BatchRequestBuilder.ts

/**
 * Builder for batch API requests
 * Fluent API for constructing batch calls
 */

import { bx24Service } from './Bitrix24Service'
import type { BX24BatchResponse } from './types'

export class BatchRequestBuilder {
  private commands: Record<string, [string, Record<string, any>?]> = {}

  /**
   * Add command to batch
   * @param key - Unique key for this command result
   * @param method - BX24 API method
   * @param params - Method parameters
   */
  public add(key: string, method: string, params?: Record<string, any>): this {
    this.commands[key] = [method, params]
    return this
  }

  /**
   * Add multiple commands at once
   */
  public addMultiple(commands: Record<string, [string, Record<string, any>?]>): this {
    Object.assign(this.commands, commands)
    return this
  }

  /**
   * Execute batch request
   * @returns Batch response with named results
   */
  public async execute(): Promise<BX24BatchResponse> {
    return bx24Service.callBatch(this.commands)
  }

  /**
   * Clear all commands
   */
  public clear(): this {
    this.commands = {}
    return this
  }

  /**
   * Get current commands count
   */
  public getCommandsCount(): number {
    return Object.keys(this.commands).length
  }
}