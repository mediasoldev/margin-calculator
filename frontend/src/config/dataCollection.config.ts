// frontend/src/config/dataCollection.config.ts

/**
 * Data Collection Form Configuration
 * Customize this file for each new project
 */

export const DATA_COLLECTION_CONFIG = {
  // Enable/disable data collection form globally
  enabled: true, // Set to false to completely disable the form

  // Application information
  application: {
    name: 'margin-calculator',
    version: 'v1',
  },

  // URLs
  urls: {
    formBase: 'https://local.app.support.pl/app-resource-library/data-collection-form/',
    api: 'https://local.app.support.pl/app-resource-library/data-collection-form/ajax/api.php',
    sizeApi: 'https://local.app.support.pl/app-resource-library/data-collection-form/ajax/index.php',
  },

  // Allowed origins for PostMessage
  allowedOrigins: [
    'https://local.app.support.pl'
  ],

  // Default modal sizes (will be overridden by API if available)
  defaultSizes: {
    modalHeight: '430px',
    iframeWidth: '100%',
    iframeHeight: '100%',
  },

  // Timing settings
  timing: {
    postMessageDelay: 1500, // Delay before sending postMessage to iframe
    sizeUpdateDelay: 1000,  // Delay before updating sizes from API
    fitWindowDelay: 2000,   // Delay before calling BX24.fitWindow()
  },
}

export default DATA_COLLECTION_CONFIG