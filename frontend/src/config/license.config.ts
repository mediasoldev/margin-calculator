// frontend/src/config/license.config.ts

/**
 * License configuration
 * Real production configuration
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

  // API endpoints
  api: {
    checkLicense: '/api/rest.php/license/check',
    activateLicense: '/api/rest.php/license/activate',
  },
}

export default LICENSE_CONFIG