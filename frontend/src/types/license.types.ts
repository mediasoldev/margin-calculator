// frontend/src/types/license.types.ts

/**
 * License status enum
 */
export enum LicenseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring_soon',
  TRIAL = 'trial',
  NOT_FOUND = 'not_found'
}

/**
 * License data interface
 */
export interface License {
  licenseKey: string | null
  expiresAt: string | null
  isActive: boolean
  isTrial: boolean
  licensedTo: string
  maxUsers: number | null
  features: string[] | any
  type: string
  createdAt: string
}

/**
 * License check response
 */
export interface LicenseCheckResponse {
  success: boolean
  license: License | null
  message?: string
  error?: string
}

/**
 * License activation request
 */
export interface LicenseActivationRequest {
  licenseKey: string
  domain: string
}

/**
 * License activation response
 */
export interface LicenseActivationResponse {
  success: boolean
  license?: License
  message?: string
  error?: string
}

/**
 * Days left calculation result
 */
export interface DaysLeftResult {
  days: number
  isExpired: boolean
  isExpiringSoon: boolean // less than 30 days
}