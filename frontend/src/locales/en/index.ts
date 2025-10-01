// frontend/src/locales/en/index.ts

export default {
  app: {
    name: "Bitrix24 App",
    welcome: "Welcome",
    loading: "Loading...",
  },
  menu: {
    home: "Home",
    settings: "Settings",
    license: "License",
    about: "About",
  },
  settings: {
    title: "Settings",
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    auto: "Auto",
    save: "Save",
    saved: "Settings saved",
    primaryColor: "Primary Color",
    textColor: "Text Color",
    textColorHint:
      "Adjust text color for better contrast with light backgrounds",
    compactMode: "Compact Mode",
    compactModeOn: "Enabled - Reduced spacing",
    compactModeOff: "Disabled - Normal spacing",
    animations: "Animations",
    animationsOn: "Enabled - Smooth transitions",
    animationsOff: "Disabled - Instant changes",
    preview: "Theme Preview",
    livePreview: "Live Preview",
    sampleTitle: "Sample Title",
    sampleText:
      "This is sample text to preview your color choices. You can see how the primary color and text color work together.",
    sampleButton: "Primary Action",
    sampleButtonSecondary: "Secondary Action",
    reset: "Reset to Defaults",
    saveSuccess: "Settings saved successfully",
    saveError: "Failed to save settings",
    resetSuccess: "Settings reset to defaults",
  },
  // В файл frontend/src/locales/en/index.ts додати:

  home: {
    title: "Pricing Calculator for Bitrix24",
    description:
      "Professional tool for calculating product prices, margins, and managing supplier costs directly in your Bitrix24 deals",

    features: {
      priceCalc: "Price Calculation",
      priceCalcDesc: "Automatic margin calculation",
      currency: "Multi-currency",
      currencyDesc: "Support for PLN, USD, EUR",
      suppliers: "Suppliers",
      suppliersDesc: "Supplier price management",
      integration: "Integration",
      integrationDesc: "Full Bitrix24 integration",
    },

    howToUse: {
      title: "How to Use",
      step1: {
        title: "Configure Settings",
        description:
          "Set up currency exchange rates and column preferences in the Settings section",
      },
      step2: {
        title: "Open Deal in Bitrix24",
        description: "Navigate to any deal in your Bitrix24 CRM",
        note: "The widget will be available in the deal card",
      },
      step3: {
        title: "Use Calculator Widget",
        description:
          "Click on the Pricing Calculator widget in the deal to calculate prices and margins for products",
      },
      step4: {
        title: "Save to Deal",
        description:
          "Calculated data is automatically saved to the deal with all pricing details",
      },
    },

    info: {
      whereToFind: {
        title: "Where to Find the Widget",
        message:
          "The pricing calculator appears as an embedded widget inside Bitrix24 deals",
        step1: "Open any deal in Bitrix24 CRM",
        step2: 'Look for "Pricing Calculator" tab or widget',
        step3: "Click to open the calculator interface",
      },
      features: {
        title: "Key Features",
        item1: "Real-time currency conversion",
        item2: "Supplier-specific pricing",
        item3: "Transport and packaging cost tracking",
        item4: "Automatic margin calculation",
      },
    },

    quickActions: {
      title: "Quick Actions",
      settings: "Configure Settings",
      testWidget: "Test Widget",
      documentation: "View Documentation",
    },

    status: {
      title: "System Status",
      appVersion: "App Version",
      bitrixConnection: "Bitrix24 Connection",
      connected: "Connected",
      disconnected: "Disconnected",
      user: "Current User",
      domain: "Domain",
      language: "Language",
      lastSync: "Last Sync",
    },

    messages: {
      widgetOpened: "Widget opened in new window",
      widgetError: "Error opening widget",
      documentationComingSoon: "Documentation coming soon",
    },
  },
  // В файл frontend/src/locales/en/index.ts додати:

  about: {
    title: "About Pricing Calculator",
    description:
      "A professional widget for Bitrix24 that allows you to calculate product prices, margins, and manage costs directly within your deals",

    faq: {
      item1: {
        question: "How does the pricing calculator work?",
        answer:
          "The calculator automatically pulls products from your Bitrix24 deal, allows you to set purchase prices, transport and packaging costs, then calculates margins and totals with multi-currency support.",
      },
      item2: {
        question: "Where can I find the widget?",
        answer:
          "The widget appears inside each deal in Bitrix24 CRM. Open any deal and look for the Pricing Calculator tab or widget panel.",
      },
      item3: {
        question: "Can I save supplier-specific prices?",
        answer:
          "Yes, you can associate specific prices with different suppliers for each product. These prices are saved and automatically loaded when you select a supplier.",
      },
      item4: {
        question: "What currencies are supported?",
        answer:
          "The calculator supports PLN, USD, and EUR with real-time conversion based on exchange rates you configure.",
      },
      item5: {
        question: "How is the data saved?",
        answer:
          "All calculations are saved directly to the Bitrix24 deal. The data includes all pricing details, margins, and supplier information.",
      },
      item6: {
        question: "Can I customize which fields are displayed?",
        answer:
          "Yes, you can configure which columns appear in the calculator through the column settings. Some fields are required and cannot be hidden.",
      },
    },

    info: {
      title: "Application Information",
      version: "Version",
      lastUpdate: "Last Update",
      developer: "Developer",
      developerName: "Your Company",
      support: "Support",
    },
  },
  common: {
    yes: "Yes",
    no: "No",
    ok: "OK",
    cancel: "Cancel",
    close: "Close",
    error: "Error",
    success: "Success",
  },
  license: {
    title: "License",
    subtitle: "Manage your application license",
    currentLicense: "Current License",
    terms: "Terms & Conditions",
    status: "Status",
    type: "License Type",
    validFrom: "Valid From",
    validUntil: "Valid Until",
    domain: "Licensed Domain",
    users: "Number of Users",
    active: "Active",
    expired: "Expired",
    expiringSoon: "Expiring Soon",
    checking: "Checking...",
    checkLicense: "Check License",
    activateLicense: "Activate License",
    licenseKey: "License Key",
    enterLicenseKey: "Enter your license key",
    activationNote: "The license will be bound to the current domain",
    checkSuccess: "License successfully verified",
    checkError: "Error checking license",
    keyRequired: "Please enter a license key",
    activationSuccess: "License successfully activated",
    activationError: "Error activating license",
    termsTitle: "License Terms and Conditions",
    termsContent:
      "<p>By using this software, you agree to the following terms...</p>",
  },
  pricing: {
    currencyInfo: "Currency Information",
    product: "Product",
    productName: "Product Name",
    quantity: "Quantity",
    salePrice: "Sale Price",
    purchasePrice: "Purchase Price",
    transportCost: "Transport Cost",
    packagingCost: "Packaging Cost",
    action: "Action",
    addProduct: "Add Product",
    totalAmount: "Total Amount",
    totalMargin: "Total Margin",
    save: "Save",
    marginCalculation: "Margin Calculation",
    unnamed: "Unnamed Product",
    packaging: "Packaging",
    marginPercent: "Margin %",
    margin: "Margin",
    saveSuccess: "Calculation saved successfully",
  },
};
