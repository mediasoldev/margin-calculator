// frontend/src/composables/useLicense.ts

import { ref, computed } from 'vue'
import type { 
  License, 
  LicenseStatus, 
  DaysLeftResult,
  LicenseCheckResponse,
  LicenseActivationRequest,
  LicenseActivationResponse
} from '@/types/license.types'
import { LICENSE_CONFIG } from '@/config/license.config'

// Global state for license
const license = ref<License | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useLicense() {
  /**
   * Calculate days left until license expires
   */
  const calculateDaysLeft = (expiresAt: string): DaysLeftResult => {
    const targetDate = new Date(expiresAt)
    const currentDate = new Date()
    const diffInMs = targetDate.getTime() - currentDate.getTime()
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))

    return {
      days: diffInDays,
      isExpired: diffInDays < 0,
      isExpiringSoon: diffInDays >= 0 && diffInDays <= LICENSE_CONFIG.settings.expiringWarningDays
    }
  }

  /**
   * Computed: Days left until expiration
   */
  const daysLeft = computed((): DaysLeftResult => {
    if (!license.value || !license.value.expiresAt) {
      return { days: 0, isExpired: true, isExpiringSoon: false }
    }
    return calculateDaysLeft(license.value.expiresAt)
  })

  /**
   * Computed: License status
   */
  const licenseStatus = computed((): LicenseStatus => {
    if (!license.value) {
      return 'not_found' as LicenseStatus
    }

    if (license.value.isTrial) {
      return 'trial' as LicenseStatus
    }

    const daysLeftResult = daysLeft.value

    if (daysLeftResult.isExpired) {
      return 'expired' as LicenseStatus
    }

    if (daysLeftResult.isExpiringSoon) {
      return 'expiring_soon' as LicenseStatus
    }

    return 'active' as LicenseStatus
  })

  /**
   * Computed: License badge status for Ant Design
   */
  const licenseBadgeStatus = computed(() => {
    const statusMap = {
      active: 'success',
      expired: 'error',
      expiring_soon: 'warning',
      trial: 'processing',
      not_found: 'default'
    }
    return statusMap[licenseStatus.value] as 'success' | 'error' | 'warning' | 'processing' | 'default'
  })

  /**
   * Mock API call to fetch license
   * Replace this with real API call when backend is ready
   */
  const fetchLicense = async (): Promise<LicenseCheckResponse> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if mock is enabled
      if (LICENSE_CONFIG.mockLicense.enabled) {
        // Return mock data
        license.value = LICENSE_CONFIG.mockLicense.data as License
        
        return {
          success: true,
          license: license.value,
          message: 'License loaded successfully (DEMO MODE)'
        }
      }

      // TODO: Replace with real API call
      // const response = await fetch(LICENSE_CONFIG.api.checkLicense)
      // const data = await response.json()
      // license.value = data.license
      // return data

      throw new Error('Real API not implemented yet')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = errorMessage
      return {
        success: false,
        license: null,
        error: errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mock API call to activate license
   * Replace this with real API call when backend is ready
   */
  const activateLicense = async (
    licenseKey: string,
    domain: string
  ): Promise<LicenseActivationResponse> => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // TODO: Replace with real API call
      // const response = await fetch(LICENSE_CONFIG.api.activateLicense, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ licenseKey, domain })
      // })
      // const data = await response.json()
      // if (data.success) {
      //   license.value = data.license
      // }
      // return data

      // Mock successful activation
      const mockActivatedLicense: License = {
        licenseKey,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        isTrial: false,
        licensedTo: domain,
        maxUsers: null,
        features: ['all'],
        type: 'Professional',
        createdAt: new Date().toISOString(),
      }

      license.value = mockActivatedLicense

      return {
        success: true,
        license: mockActivatedLicense,
        message: 'License activated successfully (DEMO MODE)'
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check if license is valid
   */
  const isLicenseValid = computed(() => {
    if (!license.value) return false
    return license.value.isActive && !daysLeft.value.isExpired
  })

  return {
    // State
    license,
    isLoading,
    error,

    // Computed
    daysLeft,
    licenseStatus,
    licenseBadgeStatus,
    isLicenseValid,

    // Methods
    fetchLicense,
    activateLicense,
  }
}