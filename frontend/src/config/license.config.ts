// frontend/src/config/license.config.ts

/**
 * License configuration
 * Customize this file for each new project
 */

export const LICENSE_CONFIG = {
  // Company information
  company: {
    name: 'MEDIASOL Sp. z o.o.',
    website: 'https://support.pl/aplikacje/',
    phone: '+48 226 022 810',
    phoneDisplay: '+48 226 022 810',
    email: 'sales@support.pl',
    chatUrl: 'https://cloud.bitrix24.pl/online/apps-help',
  },

  // License settings
  settings: {
    expiringWarningDays: 30, // Show warning when license expires in X days
    trialDurationDays: 14, // Default trial period
  },

  // API endpoints (to be configured later)
  api: {
    checkLicense: '/api/license/check',
    activateLicense: '/api/license/activate',
    // For now, these are placeholders - will be implemented with real backend
  },

  // Demo/Mock license data (for development)
  mockLicense: {
    enabled: true, // Set to false when real API is ready
    data: {
      licenseKey: 'DEMO-XXXX-XXXX-XXXX-XXXX',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      isActive: true,
      isTrial: true,
      licensedTo: 'Demo User',
      maxUsers: null,
      features: ['all'],
      type: 'Trial',
      createdAt: new Date().toISOString(),
    }
  }
}

export default LICENSE_CONFIG