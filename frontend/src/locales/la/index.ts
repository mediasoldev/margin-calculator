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
    title: "Acerca de la Calculadora de precios",
    description:
      "Un widget profesional para Bitrix24 que le permite calcular precios de productos, márgenes y gestionar costos directamente en sus negocios",

    faq: {
      item1: {
        question: "¿Cómo funciona la calculadora de precios?",
        answer:
          "La calculadora automáticamente obtiene productos de su negocio Bitrix24, le permite establecer precios de compra, costos de transporte y empaque, luego calcula márgenes y totales con soporte multimoneda.",
      },
      item2: {
        question: "¿Dónde puedo encontrar el widget?",
        answer:
          "El widget aparece dentro de cada negocio en el CRM Bitrix24. Abra cualquier negocio y busque la pestaña o panel del widget Calculadora de precios.",
      },
      item3: {
        question: "¿Puedo guardar precios específicos de proveedores?",
        answer:
          "Sí, puede asociar precios específicos con diferentes proveedores para cada producto. Estos precios se guardan y cargan automáticamente cuando selecciona un proveedor.",
      },
      item4: {
        question: "¿Qué monedas son soportadas?",
        answer:
          "La calculadora soporta PLN, USD y EUR con conversión en tiempo real basada en las tasas de cambio que configure.",
      },
      item5: {
        question: "¿Cómo se guardan los datos?",
        answer:
          "Todos los cálculos se guardan directamente en el negocio Bitrix24. Los datos incluyen todos los detalles de precios, márgenes e información de proveedores.",
      },
      item6: {
        question: "¿Puedo personalizar qué campos se muestran?",
        answer:
          "Sí, puede configurar qué columnas aparecen en la calculadora a través de la configuración de columnas. Algunos campos son obligatorios y no pueden ocultarse.",
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