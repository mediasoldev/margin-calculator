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
  const calculateDaysLeft = (expiresAt: string | null): DaysLeftResult => {
    if (!expiresAt) {
      return { days: 0, isExpired: true, isExpiringSoon: false }
    }

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
      const daysLeftResult = daysLeft.value
      
      if (daysLeftResult.isExpired) {
        return 'expired' as LicenseStatus
      }
      
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
   * ✅ Load license from APP_DATA (from PHP)
   */
  const fetchLicense = async (): Promise<LicenseCheckResponse> => {
    isLoading.value = true
    error.value = null

    try {
      // ✅ Get data from window.APP_DATA
      if (!window.APP_DATA) {
        throw new Error('APP_DATA not available')
      }

      const appData = window.APP_DATA
      const licenseData = appData.license

      if (!licenseData) {
        throw new Error('License data not available in APP_DATA')
      }

      // ✅ Map APP_DATA.license to License object
      const mappedLicense: License = {
        licenseKey: licenseData.license_key || null,
        expiresAt: licenseData.expires_at || null,
        isActive: licenseData.is_active || false,
        isTrial: licenseData.is_trial || false,
        licensedTo: licenseData.licensed_to,
        maxUsers: licenseData.max_users || null,
        features: licenseData.features || ['all'],
        type: licenseData.type || (licenseData.is_trial ? 'Trial' : 'Professional'),
        createdAt: licenseData.installed_at || licenseData.created_at || new Date().toISOString(),
      }

      license.value = mappedLicense

      return {
        success: true,
        license: mappedLicense,
        message: licenseData.status_message || (licenseData.is_trial 
          ? `Trial license - ${licenseData.days_remaining} days remaining` 
          : 'License loaded successfully')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = errorMessage
      console.error('[useLicense] Error loading license:', errorMessage)
      
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
   * Activate license via API
   * TODO: Implement when API endpoint is ready
   */
  const activateLicense = async (
    licenseKey: string,
    domain: string
  ): Promise<LicenseActivationResponse> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Implement API call when rest.php endpoint is ready
      /*
      const response = await fetch('/api/rest.php/license/activate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          license_key: licenseKey, 
          domain: domain,
          session_token: window.APP_DATA?.session_token
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to activate license')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Reload license data
        await fetchLicense()
        
        return {
          success: true,
          license: license.value,
          message: data.message || 'License activated successfully'
        }
      } else {
        throw new Error(data.error || 'License activation failed')
      }
      */
      
      console.warn('[useLicense] License activation endpoint not implemented yet')
      
      throw new Error('License activation endpoint not implemented yet. Please contact support.')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = errorMessage
      console.error('[useLicense] License activation error:', errorMessage)
      
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

  /**
   * Get human-readable license message
   */
  const licenseMessage = computed(() => {
    if (!license.value) {
      return 'No license information available'
    }

    // If blocked
    if (window.APP_DATA?.license?.is_blocked) {
      const reason = window.APP_DATA.license.block_reason || 'Unknown reason'
      return `License blocked: ${reason}`
    }

    // If trial
    if (license.value.isTrial) {
      const days = daysLeft.value.days
      
      if (days < 0) {
        return `Trial expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
      }
      
      if (days === 0) {
        return 'Trial expires today'
      }
      
      if (days <= LICENSE_CONFIG.settings.expiringWarningDays) {
        return `⚠️ Trial expires in ${days} day${days !== 1 ? 's' : ''}`
      }
      
      return `Trial active - ${days} day${days !== 1 ? 's' : ''} remaining`
    }

    // If licensed
    const days = daysLeft.value.days
    
    if (days < 0) {
      return `License expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
    }
    
    if (days === 0) {
      return '⚠️ License expires today'
    }
    
    if (days <= LICENSE_CONFIG.settings.expiringWarningDays) {
      return `⚠️ License expires in ${days} day${days !== 1 ? 's' : ''}`
    }

    return 'License active'
  })

  /**
   * Get short license status text
   */
  const licenseStatusText = computed(() => {
    const statusMap = {
      active: 'Active',
      expired: 'Expired',
      expiring_soon: 'Expiring Soon',
      trial: 'Trial',
      not_found: 'Not Found'
    }
    return statusMap[licenseStatus.value] || 'Unknown'
  })

  /**
   * Check if should show license warning
   */
  const shouldShowWarning = computed(() => {
    if (!license.value) return true
    
    const days = daysLeft.value.days
    
    return (
      daysLeft.value.isExpired || 
      daysLeft.value.isExpiringSoon ||
      days <= LICENSE_CONFIG.settings.expiringWarningDays
    )
  })

  /**
   * Get formatted expiration date
   */
  const formattedExpirationDate = computed(() => {
    if (!license.value?.expiresAt) return null
    
    const date = new Date(license.value.expiresAt)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
    licenseMessage,
    licenseStatusText,
    shouldShowWarning,
    formattedExpirationDate,

    // Methods
    fetchLicense,
    activateLicense,
  }
}