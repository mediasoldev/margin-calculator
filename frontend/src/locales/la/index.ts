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
      "Este es un texto de ejemplo para visualizar tus opciones de color. Puedes ver cómo el color principal y el color del texto trabajan juntos.",
    sampleButton: "Acción principal",
    sampleButtonSecondary: "Acción secundaria",
    reset: "Restablecer valores predeterminados",
    saveSuccess: "Configuración guardada exitosamente",
    saveError: "Error al guardar configuración",
    resetSuccess: "Configuración restablecida a valores predeterminados",
  },

  home: {
    title: "Calculadora de Margen para Bitrix24",
    description:
      "Evalúa rápidamente la rentabilidad del producto teniendo en cuenta el precio de compra, transporte, embalaje y tipos de cambio",

    importantNotice: "Importante",
    noticeDescription: "La aplicación no cambia el monto del negocio, sino que ingresa información de precios del producto en campos adicionales",

    whereToFind: {
      title: "Dónde encontrar el widget",
      step1: "Abre cualquier negocio en Bitrix24 CRM",
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
      flexibleDesc: "Vista de tabla, tarjetas o acordeón personalizable",
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
          "En la parte superior de la interfaz hay campos para los tipos de cambio (por ejemplo, USD/PLN, EUR/PLN, EUR/USD). Estos valores se utilizan para convertir todos los montos a la moneda en la que se establece el precio de venta. Cambia la tasa - el cálculo se actualizará automáticamente.",
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
        question: "¿Cómo funciona la recuperación automática del precio de compra al seleccionar un proveedor?",
        answer:
          "Al seleccionar un proveedor, la aplicación busca en su base de datos el precio de ese proveedor para el producto seleccionado e inserta automáticamente el precio de compra + moneda. Si no hay precios para la combinación 'proveedor-producto', el campo permanece vacío y debe ingresar el precio manualmente.",
      },
      item5: {
        question: "¿Puedo personalizar la vista de la tabla y el conjunto de columnas?",
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
    unlimited: "Ilimitados",
    noLicense: "Sin clave de licencia",
    purchaseContactTitle: "Para comprar una clave de licencia, contáctenos de cualquier manera conveniente:",
    website: "Sitio web",
    phone: "Teléfono",
    email: "Correo electrónico",
    onlineChat: "Chat en línea",
    checkError: "Error al verificar licencia",
  },

  pricing: {
    currencyInfo: "Información de moneda",
    product: "Producto",
    productName: "Nombre del producto",
    quantity: "Cantidad",
    salePrice: "Precio de venta",
    purchasePrice: "Precio de compra",
    transportCost: "Costo de transporte",
    packagingCost: "Costo de embalaje",
    action: "Acción",
    addProduct: "Agregar producto",
    totalAmount: "Monto total",
    totalMargin: "Margen total",
    save: "Guardar",
    marginCalculation: "Cálculo de margen",
    unnamed: "Producto sin nombre",
    packaging: "Embalaje",
    marginPercent: "Margen %",
    margin: "Margen",
    saveSuccess: "Cálculo guardado exitosamente",
  },
};