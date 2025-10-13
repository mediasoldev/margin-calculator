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
    primaryColor: "Color primario",
    textColor: "Color del texto",
    textColorHint:
      "Ajuste el color del texto para mejor contraste con fondos claros",
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
      "Este es un texto de ejemplo para previsualizar sus opciones de color. Puede ver cómo el color primario y el color del texto funcionan juntos.",
    sampleButton: "Acción primaria",
    sampleButtonSecondary: "Acción secundaria",
    reset: "Restaurar valores predeterminados",
    saveSuccess: "Configuración guardada exitosamente",
    saveError: "Error al guardar la configuración",
    resetSuccess: "Configuración restaurada a valores predeterminados",
  },
  home: {
    title: "Calculadora de precios para Bitrix24",
    description:
      "Herramienta profesional para calcular precios de productos, márgenes y gestionar costos de proveedores directamente en sus negocios Bitrix24",

    features: {
      priceCalc: "Cálculo de precios",
      priceCalcDesc: "Cálculo automático de margen",
      currency: "Multimoneda",
      currencyDesc: "Soporte para PLN, USD, EUR",
      suppliers: "Proveedores",
      suppliersDesc: "Gestión de precios de proveedores",
      integration: "Integración",
      integrationDesc: "Integración completa con Bitrix24",
    },

    howToUse: {
      title: "Cómo usar",
      step1: {
        title: "Configure los ajustes",
        description:
          "Configure las tasas de cambio y preferencias de columnas en la sección Configuración",
      },
      step2: {
        title: "Abra un negocio en Bitrix24",
        description: "Navegue a cualquier negocio en su CRM Bitrix24",
        note: "El widget estará disponible en la tarjeta del negocio",
      },
      step3: {
        title: "Use el widget calculadora",
        description:
          "Haga clic en el widget Calculadora de precios en el negocio para calcular precios y márgenes para productos",
      },
      step4: {
        title: "Guardar en el negocio",
        description:
          "Los datos calculados se guardan automáticamente en el negocio con todos los detalles de precios",
      },
    },

    info: {
      whereToFind: {
        title: "Dónde encontrar el widget",
        message:
          "La calculadora de precios aparece como un widget integrado dentro de los negocios Bitrix24",
        step1: "Abra cualquier negocio en el CRM Bitrix24",
        step2: 'Busque la pestaña o widget "Calculadora de precios"',
        step3: "Haga clic para abrir la interfaz de la calculadora",
      },
      features: {
        title: "Características principales",
        item1: "Conversión de moneda en tiempo real",
        item2: "Precios específicos del proveedor",
        item3: "Seguimiento de costos de transporte y empaque",
        item4: "Cálculo automático de margen",
      },
    },

    quickActions: {
      title: "Acciones rápidas",
      settings: "Configurar ajustes",
      testWidget: "Probar widget",
      documentation: "Ver documentación",
    },

    status: {
      title: "Estado del sistema",
      appVersion: "Versión de la aplicación",
      bitrixConnection: "Conexión Bitrix24",
      connected: "Conectado",
      disconnected: "Desconectado",
      user: "Usuario actual",
      domain: "Dominio",
      language: "Idioma",
      lastSync: "Última sincronización",
    },

    messages: {
      widgetOpened: "Widget abierto en nueva ventana",
      widgetError: "Error al abrir el widget",
      documentationComingSoon: "Documentación próximamente",
    },
  },
  about: {
    title: "Acerca de la Calculadora de Margen",
    description:
      "La Calculadora de Margen es una aplicación de apoyo para Bitrix24 que permite evaluar rápidamente la rentabilidad del producto (margen) teniendo en cuenta el precio de compra, transporte, embalaje y tipos de cambio. IMPORTANTE: la aplicación no cambia el monto del negocio, sino que ingresa información de precios del producto en campos adicionales.",

    faq: {
      item1: {
        question: "¿Dónde establecer los tipos de cambio y cómo se utilizan?",
        answer:
          "En la parte superior de la interfaz hay campos para los tipos de cambio (por ejemplo, USD/PLN, EUR/PLN, EUR/USD). Estos valores se utilizan para convertir todos los montos a la moneda en la que se establece el precio de venta. Cambie la tasa - el cálculo se actualizará automáticamente.",
      },
      item2: {
        question: "¿Cómo se calcula el margen (fórmula)?",
        answer:
          "Todos los gastos entrantes (compra, transporte, embalaje, etc.) se convierten a la moneda del precio de venta según las tasas especificadas. Luego se aplica la fórmula: Ingresos Totales = Precio_de_Venta × Cantidad; Gastos Totales = (Precio_de_Compra × Cantidad) + Transporte + Embalaje + Otros_Gastos; Margen = Ingresos Totales − Gastos Totales; % de Margen = (Margen / Ingresos Totales) × 100%",
      },
      item3: {
        question: "¿Qué significa el botón 'Guardar'?",
        answer:
          "El botón guarda el cálculo actual dentro de la aplicación (en la propia base de datos de la aplicación) para su posterior visualización/análisis. Guardar no cambia el monto del negocio Bitrix24, sino que realiza cambios en campos adicionales para información de precios.",
      },
      item4: {
        question:
          "¿Cómo funciona la recuperación automática del precio de compra al seleccionar un proveedor?",
        answer:
          "Al seleccionar un proveedor, la aplicación busca en su base de datos el precio de ese proveedor para el producto seleccionado e inserta automáticamente el precio de compra + moneda. Si no hay precios para la combinación 'proveedor-producto', el campo permanece vacío y debe ingresar el precio manualmente.",
      },
      item5: {
        question:
          "¿Puedo personalizar la vista de la tabla y el conjunto de columnas?",
        answer:
          "Sí. La interfaz incluye modos de visualización (tabla, tarjetas, acordeón) y un botón 'Configuración' para configurar columnas visibles. Use estos botones para ocultar/mostrar los campos requeridos.",
      },
    },

    info: {
      title: "Información de la aplicación",
      version: "Versión",
      lastUpdate: "Última actualización",
      developer: "Desarrollador",
      developerName: "Su empresa",
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
    subtitle: "Gestione su licencia de aplicación",
    currentLicense: "Licencia actual",
    terms: "Términos y condiciones",
    status: "Estado",
    type: "Tipo de licencia",
    validFrom: "Válida desde",
    validUntil: "Válida hasta",
    domain: "Dominio con licencia",
    users: "Número de usuarios",
    active: "Activa",
    expired: "Expirada",
    expiringSoon: "Expira pronto",
    checking: "Verificando...",
    checkLicense: "Verificar licencia",
    activateLicense: "Activar licencia",
    licenseKey: "Clave de licencia",
    enterLicenseKey: "Ingrese su clave de licencia",
    activationNote: "La licencia se vinculará al dominio actual",
    checkSuccess: "Licencia verificada exitosamente",
    checkError: "Error al verificar licencia",
    keyRequired: "Por favor ingrese una clave de licencia",
    activationSuccess: "Licencia activada exitosamente",
    activationError: "Error al activar licencia",
    termsTitle: "Términos y condiciones de la licencia",
    termsContent:
      "<p>Al usar este software, usted acepta los siguientes términos...</p>",
  },
  pricing: {
    currencyInfo: "Información de moneda",
    product: "Producto",
    productName: "Nombre del producto",
    quantity: "Cantidad",
    salePrice: "Precio de venta",
    purchasePrice: "Precio de compra",
    transportCost: "Costo de transporte",
    packagingCost: "Costo de empaque",
    action: "Acción",
    addProduct: "Agregar producto",
    totalAmount: "Monto total",
    totalMargin: "Margen total",
    save: "Guardar",
    marginCalculation: "Cálculo de margen",
    unnamed: "Producto sin nombre",
    packaging: "Empaque",
    marginPercent: "Margen %",
    margin: "Margen",
    saveSuccess: "Cálculo guardado exitosamente",
  },
};
