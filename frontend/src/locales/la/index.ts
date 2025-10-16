// frontend/src/locales/la/index.ts

export default {
  app: {
    name: "Aplicación Bitrix24",
    welcome: "Bienvenido",
    loading: "Cargando...",
  },
  menu: {
    home: "Inicio",
    settings: "Configuración",
    license: "Licencia",
    about: "Acerca de",
  },
  settings: {
    title: "Configuración",
    theme: "Tema",
    language: "Idioma",
    light: "Claro",
    dark: "Oscuro",
    auto: "Automático",
    save: "Guardar",
    saved: "Configuración guardada",
    primaryColor: "Color principal",
    textColor: "Color del texto",
    textColorHint:
      "Ajusta el color del texto para un mejor contraste con fondos claros",
    compactMode: "Modo compacto",
    compactModeOn: "Activado - Espaciado reducido",
    compactModeOff: "Desactivado - Espaciado normal",
    animations: "Animaciones",
    animationsOn: "Activadas - Transiciones suaves",
    animationsOff: "Desactivadas - Cambios instantáneos",
    preview: "Vista previa del tema",
    livePreview: "Vista previa en vivo",
    sampleTitle: "Título de ejemplo",
    sampleText:
      "Este es un texto de ejemplo para previsualizar tus elecciones de colores. Puedes ver cómo el color principal y el color del texto funcionan juntos.",
    sampleButton: "Acción principal",
    sampleButtonSecondary: "Acción secundaria",
    reset: "Restablecer valores predeterminados",
    saveSuccess: "Configuración guardada exitosamente",
    saveError: "Error al guardar la configuración",
    resetSuccess: "Configuración restablecida a valores predeterminados",
  },

  home: {
    title: "Calculadora de Margen para Bitrix24",
    description:
      "Evalúa rápidamente la rentabilidad de los productos considerando precio de compra, transporte, embalaje y tasas de cambio",

    importantNotice: "Importante",
    noticeDescription:
      "La aplicación no cambia el monto del negocio, pero ingresa información de precios de productos en campos adicionales",

    whereToFind: {
      title: "Dónde encontrar el widget",
      step1: "Abre cualquier negocio en el CRM Bitrix24",
      step2: "Busca la pestaña o widget 'Calculadora de Margen' en la tarjeta del negocio",
      step3: "Haz clic para abrir y comenzar a calcular márgenes",
    },

    keyFeatures: {
      title: "Características principales",
      currencies: "Multi-moneda",
      currenciesDesc: "Soporte para PLN, USD, EUR con conversión automática",
      margin: "Cálculo de margen",
      marginDesc: "Cálculo automático con todos los costos incluidos",
      suppliers: "Precios de proveedores",
      suppliersDesc: "Autocompletado de precios de compra desde la base de datos de proveedores",
      flexible: "Visualización flexible",
      flexibleDesc: "Tabla, tarjetas o vista de acordeón personalizables",
    },
  },

  about: {
    title: "Acerca de la Calculadora de Margen",
    description:
      "La Calculadora de Margen es una aplicación de soporte para Bitrix24 que permite evaluar rápidamente la rentabilidad de un producto (margen) considerando precio de compra, transporte, embalaje y tasas de cambio. IMPORTANTE: la aplicación no cambia el monto del negocio, pero ingresa información de precios de productos en campos adicionales.",

    faq: {
      item1: {
        question: "¿Dónde establecer las tasas de cambio y cómo se utilizan?",
        answer:
          "En la parte superior de la interfaz hay campos para tasas de cambio (por ejemplo, USD/PLN, EUR/PLN, EUR/USD). Estos valores se utilizan para convertir todos los montos a la moneda en la que se establece el precio de venta. Cambia la tasa - el cálculo se actualizará automáticamente.",
      },
      item2: {
        question: "¿Cómo se calcula el margen (fórmula)?",
        answer:
          "Todos los gastos entrantes (compra, transporte, embalaje, etc.) se convierten a la moneda del precio de venta según las tasas especificadas. Luego se aplica la fórmula: Ingresos totales = Precio_de_venta × Cantidad; Gastos totales = (Precio_de_compra × Cantidad) + Transporte + Embalaje + Otros_gastos; Margen = Ingresos_totales − Gastos_totales; Margen % = (Margen / Ingresos_totales) × 100%",
      },
      item3: {
        question: "¿Qué significa el botón 'Guardar'?",
        answer:
          "El botón guarda el cálculo actual dentro de la aplicación (en la base de datos propia de la aplicación) para su visualización/análisis posterior. Guardar no cambia el monto del negocio Bitrix24, pero realiza cambios en campos adicionales para información de precios.",
      },
      item4: {
        question:
          "¿Cómo funciona la recuperación automática del precio de compra al seleccionar un proveedor?",
        answer:
          "Al seleccionar un proveedor, la aplicación busca en su base de datos el precio de ese proveedor para el producto seleccionado e inserta automáticamente el precio de compra + moneda. Si no hay precios para la combinación 'proveedor-producto', el campo permanece vacío y debes ingresar el precio manualmente.",
      },
      item5: {
        question: "¿Puedo personalizar la vista de tabla y el conjunto de columnas?",
        answer:
          "Sí. La interfaz incluye modos de visualización (tabla, tarjetas, acordeón) y un botón 'Configuración' para configurar columnas visibles. Usa estos botones para ocultar/mostrar los campos requeridos.",
      },
    },

    info: {
      title: "Información de la aplicación",
      version: "Versión",
      lastUpdate: "Última actualización",
      developer: "Desarrollador",
      developerName: "Tu Empresa",
      support: "Soporte",
    },
  },

  common: {
    yes: "Sí",
    no: "No",
    ok: "OK",
    cancel: "Cancelar",
    close: "Cerrar",
    error: "Error",
    success: "Éxito",
  },

  license: {
    title: "Licencia",
    subtitle: "Información de licencia de la aplicación",
    licenseKey: "Clave de licencia",
    validUntil: "Válida hasta",
    expiresIn: "Expira en",
    days: "días",
    today: "Hoy",
    expired: "Expirada",
    trial: "Versión de prueba",
    licensedTo: "Licenciada para",
    maxUsers: "Usuarios máximos",
    unlimited: "Ilimitado",
    noLicense: "Sin clave de licencia",
    purchaseContactTitle:
      "Para adquirir una clave de licencia, contáctanos de cualquier manera conveniente:",
    website: "Sitio web",
    phone: "Teléfono",
    email: "Correo electrónico",
    onlineChat: "Chat en línea",
    checkError: "Error al verificar la licencia",
  },

  pricing: {
    // Currency section
    currencyInfo: "Información de moneda",
    currencyRates: "Tasas de cambio",

    // Column names (main fields)
    product: "Producto",
    productName: "Nombre del producto",
    quantity: "Cantidad",
    salePrice: "Precio de venta",
    purchasePrice: "Precio de compra",
    supplier: "Proveedor",
    transportCost: "Costo de transporte",
    packagingCost: "Costo de embalaje",
    marginPercent: "Margen %",
    marginPerUnit: "Margen (por unidad)",
    marginAmount: "Margen (calculado)",
    totalMargin: "Margen total",
    action: "Acción",

    // View modes
    viewMode: "Modo de visualización",
    tableView: "Tabla",
    cardsView: "Tarjetas",
    accordionView: "Acordeón",

    // Actions
    columns: "Columnas",
    refresh: "Actualizar",
    save: "Guardar",
    addProduct: "Agregar producto",
    edit: "Editar",
    selectSupplier: "Seleccionar proveedor",
    loadFromBitrix: "Cargar desde Bitrix",

    // Column settings modal
    columnSettings: "Configuración de columnas",
    columnSettingsInfo:
      "Arrastra para reordenar columnas. Las columnas obligatorias no se pueden ocultar, pero se pueden reordenar.",
    requiredColumns: "Columnas obligatorias",
    optionalColumns: "Columnas opcionales",
    availableColumns: "Columnas disponibles",
    alwaysVisible: "Siempre visible",
    required: "Obligatorio",
    readOnly: "Solo lectura",
    editableField: "Editable",
    optional: "Opcional",
    productField: "Campo del producto",
    resetToDefaults: "Restablecer valores predeterminados",
    visible: "visible",
    order: "Orden",
    show: "Mostrar",
    columnName: "Nombre de columna",
    status: "Estado",
    showAll: "Mostrar todo",
    hideOptional: "Ocultar opcionales",

    // Summary
    totalAmount: "Monto total",
    productMargin: "Margen del producto",

    // Messages
    productsLoaded: "Productos cargados exitosamente",
    loadedFromBitrix: "Productos cargados desde Bitrix24 exitosamente",
    loadError: "Error al cargar productos",
    priceLoadError: "Error al cargar precio del proveedor",
    saveSuccess: "Cálculo guardado exitosamente",
    saveError: "Error al guardar el cálculo",

    // Comparison status messages
    savedMatchesDeal: "✓ El cálculo guardado coincide con el negocio actual",
    savedDiffersFromDeal: "⚠ El cálculo guardado difiere del negocio actual",
    notCalculatedYet: "ℹ Cálculo aún no guardado",

    // Supplier modal
    addSupplier: "Agregar proveedor",
    editSupplier: "Editar proveedor",
    company: "Empresa",
    selectCompany: "Seleccionar empresa",
    currency: "Moneda",
    selectCurrency: "Seleccionar moneda",
    enterPrice: "Ingresar precio",
    pleaseSelectCompany: "Por favor, selecciona una empresa",
    pleaseEnterValidPrice: "Por favor, ingresa un precio válido",
    pleaseSelectCurrency: "Por favor, selecciona una moneda",

    // Placeholder
    cardsViewComingSoon: "Vista de tarjetas - Próximamente",
    accordionViewComingSoon: "Vista de acordeón - Próximamente",

    // Unnamed product
    unnamed: "Producto sin nombre",
    packaging: "Embalaje",
    marginCalculation: "Cálculo de margen",

    // Dynamic ProductRow fields (from Bitrix24 API)
    ID: "ID",
    OWNER_ID: "ID del propietario",
    OWNER_TYPE: "Tipo de propietario",
    PRODUCT_ID: "ID del producto",
    PRICE: "Precio",
    PRICE_EXCLUSIVE: "Precio con descuento sin impuesto",
    PRICE_NETTO: "Precio neto",
    PRICE_BRUTTO: "Precio bruto",
    DISCOUNT_TYPE_ID: "Tipo de descuento",
    DISCOUNT_RATE: "Valor del descuento",
    DISCOUNT_SUM: "Monto del descuento",
    TAX_RATE: "Impuesto",
    TAX_INCLUDED: "Impuesto incluido",
    CUSTOMIZED: "Modificado en",
    MEASURE_CODE: "Código de unidad de medida",
    MEASURE_NAME: "Unidad de medida",
    SORT: "Ordenamiento",
    TYPE: "Tipo",
    ORIGINAL_PRODUCT_NAME: "Nombre original del producto",
    PRODUCT_DESCRIPTION: "Descripción del producto",
    PRICE_ACCOUNT: "Cuenta de precio",
    XML_ID: "XML ID",
    STORE_ID: "Almacén",
    RESERVE_ID: "ID de reserva",
    RESERVE_QUANTITY: "Cantidad reservada",
    DATE_RESERVE_END: "Fecha de fin de reserva",
  },
};