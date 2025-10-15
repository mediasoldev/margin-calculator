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

  home: {
    title: "Margin Calculator for Bitrix24",
    description:
      "Quickly assess product profitability with purchase price, transportation, packaging and currency exchange rates",

    importantNotice: "Important",
    noticeDescription: "This application does not change the deal amount, but enters product pricing information into additional fields",

    whereToFind: {
      title: "Where to Find the Widget",
      step1: "Open any deal in Bitrix24 CRM",
      step2: "Look for 'Margin Calculator' tab or widget in the deal card",
      step3: "Click to open and start calculating margins",
    },

    keyFeatures: {
      title: "Key Features",
      currencies: "Multi-currency",
      currenciesDesc: "Support for PLN, USD, EUR with automatic conversion",
      margin: "Margin Calculation",
      marginDesc: "Automatic calculation with all costs included",
      suppliers: "Supplier Prices",
      suppliersDesc: "Auto-fill purchase prices from supplier database",
      flexible: "Flexible Display",
      flexibleDesc: "Customizable table, cards, or accordion view",
    },
  },

  about: {
    title: "About Margin Calculator",
    description:
      "Margin Calculator is a support application for Bitrix24 that allows you to quickly assess product profitability (margin) taking into account purchase price, transportation, packaging and currency exchange rates. IMPORTANT: the application does not change the deal amount, but enters product pricing information into additional fields.",

    faq: {
      item1: {
        question: "Where to set currency exchange rates and how are they used?",
        answer:
          "At the top of the interface there are fields for exchange rates (for example, USD/PLN, EUR/PLN, EUR/USD). These values are used to convert all amounts to the currency in which the sale price is set. Change the rate - the calculation will update automatically.",
      },
      item2: {
        question: "How is the margin calculated (formula)?",
        answer:
          "All incoming expenses (purchase, transportation, packaging, etc.) are converted to the sale price currency according to the specified rates. Then the formula is applied: Total Revenue = Sale_Price × Quantity; Total Expenses = (Purchase_Price × Quantity) + Transportation + Packaging + Other_Expenses; Margin = Total Revenue − Total Expenses; Margin % = (Margin / Total Revenue) × 100%",
      },
      item3: {
        question: "What does the 'Save' button mean?",
        answer:
          "The button saves the current calculation inside the application (in the application's own database) for further viewing/analysis. Saving does not change the Bitrix24 deal amount, but makes changes to additional fields for pricing information.",
      },
      item4: {
        question: "How does automatic purchase price retrieval work when selecting a supplier?",
        answer:
          "When selecting a supplier, the application searches its database for the price of that supplier for the selected product and automatically inserts the purchase price + currency. If there are no prices for the 'supplier-product' combination, the field remains empty and you need to enter the price manually.",
      },
      item5: {
        question: "Can I customize the table view and set of columns?",
        answer:
          "Yes. The interface includes display modes (table, cards, accordion) and a 'Settings' button to configure visible columns. Use these buttons to hide/show the required fields.",
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
    subtitle: "Application License Information",
    licenseKey: "License Key",
    validUntil: "Valid Until",
    expiresIn: "Expires In",
    days: "days",
    today: "Today",
    expired: "Expired",
    trial: "Trial Version",
    licensedTo: "Licensed To",
    maxUsers: "Maximum Users",
    unlimited: "Unlimited",
    noLicense: "No license key",
    purchaseContactTitle: "To purchase a license key, contact us in any convenient way:",
    website: "Website",
    phone: "Phone",
    email: "Email",
    onlineChat: "Online chat",
    checkError: "Error checking license",
  },

  pricing: {
    // Currency section
    currencyInfo: "Currency Information",
    currencyRates: "Exchange Rates",
    
    // Column names
    product: "Product",
    productName: "Product Name",
    quantity: "Quantity",
    salePrice: "Sale Price",
    purchasePrice: "Purchase Price",
    supplier: "Supplier",
    transportCost: "Transport Cost",
    packagingCost: "Packaging Cost",
    marginPercent: "Margin %",
    marginAmount: "Margin (per unit)",
    totalMargin: "Total Margin",
    action: "Action",
    
    // View modes
    viewMode: "View Mode",
    tableView: "Table",
    cardsView: "Cards",
    accordionView: "Accordion",
    
    // Actions
    columns: "Columns",
    refresh: "Refresh",
    save: "Save",
    addProduct: "Add Product",
    edit: "Edit",
    selectSupplier: "Select Supplier",
    
    // Column settings modal
    columnSettings: "Column Settings",
    requiredColumns: "Required Columns",
    optionalColumns: "Optional Columns",
    alwaysVisible: "Always Visible",
    required: "Required",
    resetToDefaults: "Reset to Defaults",
    
    // Summary
    totalAmount: "Total Amount",
    productMargin: "Product Margin",
    
    // Messages
    productsLoaded: "Products loaded successfully",
    loadError: "Error loading products",
    priceLoadError: "Error loading supplier price",
    saveSuccess: "Calculation saved successfully",
    saveError: "Error saving calculation",
    
    // Unnamed product
    unnamed: "Unnamed Product",
    packaging: "Packaging",
    marginCalculation: "Margin Calculation",

    columnSettingsInfo: "Drag to reorder columns. Required columns cannot be hidden but can be reordered.",
    availableColumns: "Available Columns",
    visible: "visible",
    order: "Order",
    show: "Show",
    columnName: "Column Name",
    status: "Status",
    productField: "Product Field",
    optional: "Optional",
    showAll: "Show All",
    hideOptional: "Hide Optional",

    cardsViewComingSoon: "Cards view - Coming soon",
    accordionViewComingSoon: "Accordion view - Coming soon",
  },
};