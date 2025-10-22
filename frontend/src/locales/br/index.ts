// frontend/src/locales/br/index.ts

export default {
  app: {
    name: "Aplicativo Bitrix24",
    welcome: "Bem-vindo",
    loading: "Carregando...",
  },
  menu: {
    home: "Início",
    settings: "Configurações",
    license: "Licença",
    about: "Sobre",
  },
  settings: {
    title: "Configurações",
    theme: "Tema",
    language: "Idioma",
    light: "Claro",
    dark: "Escuro",
    auto: "Automático",
    save: "Salvar",
    saved: "Configurações salvas",
    primaryColor: "Cor principal",
    textColor: "Cor do texto",
    textColorHint:
      "Ajuste a cor do texto para melhor contraste com fundos claros",
    compactMode: "Modo compacto",
    compactModeOn: "Ativado - Espaçamento reduzido",
    compactModeOff: "Desativado - Espaçamento normal",
    animations: "Animações",
    animationsOn: "Ativadas - Transições suaves",
    animationsOff: "Desativadas - Mudanças instantâneas",
    preview: "Pré-visualização do tema",
    livePreview: "Visualização ao vivo",
    sampleTitle: "Título de exemplo",
    sampleText:
      "Este é um texto de exemplo para pré-visualizar suas escolhas de cores. Você pode ver como a cor principal e a cor do texto funcionam juntas.",
    sampleButton: "Ação principal",
    sampleButtonSecondary: "Ação secundária",
    reset: "Restaurar padrões",
    saveSuccess: "Configurações salvas com sucesso",
    saveError: "Falha ao salvar configurações",
    resetSuccess: "Configurações restauradas para os padrões",
  },

  home: {
    title: "Calculate in Deal",
    description:
      "Avalie rapidamente a lucratividade dos produtos considerando preço de compra, transporte, embalagem e taxas de câmbio",

    importantNotice: "Importante",
    noticeDescription:
      "O aplicativo não altera o valor do negócio, mas insere informações de precificação de produtos em campos adicionais",

    whereToFind: {
      title: "Onde encontrar o widget",
      step1: "Abra qualquer negócio no CRM Bitrix24",
      step2: "Procure pela aba ou widget 'Calculadora de Margem' no cartão do negócio",
      step3: "Clique para abrir e começar a calcular margens",
    },

    keyFeatures: {
      title: "Recursos principais",
      currencies: "Multi-moedas",
      currenciesDesc: "Suporte para PLN, USD, EUR com conversão automática",
      margin: "Cálculo de margem",
      marginDesc: "Cálculo automático com todos os custos incluídos",
      suppliers: "Preços de fornecedores",
      suppliersDesc: "Preenchimento automático de preços de compra do banco de dados de fornecedores",
      flexible: "Exibição flexível",
      flexibleDesc: "Tabela, cartões ou visualização em acordeão personalizáveis",
    },
  },

  about: {
    title: "Sobre a Calculadora de Margem",
    description:
      "A Calculadora de Margem é um aplicativo de suporte para Bitrix24 que permite avaliar rapidamente a lucratividade de um produto (margem) considerando preço de compra, transporte, embalagem e taxas de câmbio. IMPORTANTE: o aplicativo não altera o valor do negócio, mas insere informações de precificação de produtos em campos adicionais.",

    faq: {
      item1: {
        question: "Onde definir as taxas de câmbio e como elas são usadas?",
        answer:
          "No topo da interface há campos para taxas de câmbio (por exemplo, USD/PLN, EUR/PLN, EUR/USD). Esses valores são usados para converter todos os valores para a moeda em que o preço de venda está definido. Altere a taxa - o cálculo será atualizado automaticamente.",
      },
      item2: {
        question: "Como a margem é calculada (fórmula)?",
        answer:
          "Todas as despesas de entrada (compra, transporte, embalagem, etc.) são convertidas para a moeda do preço de venda de acordo com as taxas especificadas. Em seguida, a fórmula é aplicada: Receita total = Preço_de_venda × Quantidade; Despesas totais = (Preço_de_compra × Quantidade) + Transporte + Embalagem + Outras_despesas; Margem = Receita_total − Despesas_totais; Margem % = (Margem / Receita_total) × 100%",
      },
      item3: {
        question: "O que significa o botão 'Salvar'?",
        answer:
          "O botão salva o cálculo atual dentro do aplicativo (no banco de dados próprio do aplicativo) para visualização/análise posterior. Salvar não altera o valor do negócio Bitrix24, mas faz alterações em campos adicionais para informações de precificação.",
      },
      item4: {
        question:
          "Como funciona a recuperação automática do preço de compra ao selecionar um fornecedor?",
        answer:
          "Ao selecionar um fornecedor, o aplicativo busca em seu banco de dados o preço desse fornecedor para o produto selecionado e insere automaticamente o preço de compra + moeda. Se não houver preços para a combinação 'fornecedor-produto', o campo permanece vazio e você precisa inserir o preço manualmente.",
      },
      item5: {
        question: "Posso personalizar a visualização da tabela e o conjunto de colunas?",
        answer:
          "Sim. A interface inclui modos de exibição (tabela, cartões, acordeão) e um botão 'Configurações' para configurar colunas visíveis. Use esses botões para ocultar/mostrar os campos necessários.",
      },
    },

    info: {
      title: "Informações do aplicativo",
      version: "Versão",
      lastUpdate: "Última atualização",
      developer: "Desenvolvedor",
      developerName: "Sua Empresa",
      support: "Suporte",
    },
  },

  common: {
    yes: "Sim",
    no: "Não",
    ok: "OK",
    cancel: "Cancelar",
    close: "Fechar",
    error: "Erro",
    success: "Sucesso",
  },

  license: {
    title: "Licença",
    subtitle: "Informações da licença do aplicativo",
    licenseKey: "Chave de licença",
    validUntil: "Válida até",
    expiresIn: "Expira em",
    days: "dias",
    today: "Hoje",
    expired: "Expirada",
    trial: "Versão de teste",
    licensedTo: "Licenciado para",
    maxUsers: "Usuários máximos",
    unlimited: "Ilimitado",
    noLicense: "Sem chave de licença",
    purchaseContactTitle:
      "Para adquirir uma chave de licença, entre em contato conosco de qualquer forma conveniente:",
    website: "Site",
    phone: "Telefone",
    email: "E-mail",
    onlineChat: "Chat online",
    checkError: "Erro ao verificar licença",
  },

  pricing: {
    // Currency section
    currencyInfo: "Informações de moeda",
    currencyRates: "Taxas de câmbio",

    // Column names (main fields)
    product: "Produto",
    productName: "Nome do produto",
    quantity: "Quantidade",
    salePrice: "Preço de venda",
    purchasePrice: "Preço de compra",
    supplier: "Fornecedor",
    transportCost: "Custo de transporte",
    packagingCost: "Custo de embalagem",
    marginPercent: "Margem %",
    marginPerUnit: "Margem (por unidade)",
    marginAmount: "Margem (calculada)",
    totalMargin: "Margem total",
    action: "Ação",

    // View modes
    viewMode: "Modo de visualização",
    tableView: "Tabela",
    cardsView: "Cartões",
    accordionView: "Acordeão",

    // Actions
    columns: "Colunas",
    refresh: "Atualizar",
    save: "Salvar",
    addProduct: "Adicionar produto",
    edit: "Editar",
    selectSupplier: "Selecionar fornecedor",
    loadFromBitrix: "Carregar do Bitrix",

    // Column settings modal
    columnSettings: "Configurações de colunas",
    columnSettingsInfo:
      "Arraste para reordenar colunas. Colunas obrigatórias não podem ser ocultadas, mas podem ser reordenadas.",
    requiredColumns: "Colunas obrigatórias",
    optionalColumns: "Colunas opcionais",
    availableColumns: "Colunas disponíveis",
    alwaysVisible: "Sempre visível",
    required: "Obrigatório",
    readOnly: "Somente leitura",
    editableField: "Editável",
    optional: "Opcional",
    productField: "Campo do produto",
    resetToDefaults: "Restaurar padrões",
    visible: "visível",
    order: "Ordem",
    show: "Mostrar",
    columnName: "Nome da coluna",
    status: "Status",
    showAll: "Mostrar tudo",
    hideOptional: "Ocultar opcionais",

    // Summary
    totalAmount: "Valor total",
    productMargin: "Margem do produto",

    // Messages
    productsLoaded: "Produtos carregados com sucesso",
    loadedFromBitrix: "Produtos carregados do Bitrix24 com sucesso",
    loadError: "Erro ao carregar produtos",
    priceLoadError: "Erro ao carregar preço do fornecedor",
    saveSuccess: "Cálculo salvo com sucesso",
    saveError: "Erro ao salvar cálculo",

    // Comparison status messages
    savedMatchesDeal: "✓ Cálculo salvo corresponde ao negócio atual",
    savedDiffersFromDeal: "⚠ Cálculo salvo difere do negócio atual",
    notCalculatedYet: "ℹ Cálculo ainda não salvo",

    // Supplier modal
    addSupplier: "Adicionar fornecedor",
    editSupplier: "Editar fornecedor",
    company: "Empresa",
    selectCompany: "Selecionar empresa",
    currency: "Moeda",
    selectCurrency: "Selecionar moeda",
    enterPrice: "Inserir preço",
    pleaseSelectCompany: "Por favor, selecione uma empresa",
    pleaseEnterValidPrice: "Por favor, insira um preço válido",
    pleaseSelectCurrency: "Por favor, selecione uma moeda",

    // Placeholder
    cardsViewComingSoon: "Visualização em cartões - Em breve",
    accordionViewComingSoon: "Visualização em acordeão - Em breve",

    // Unnamed product
    unnamed: "Produto sem nome",
    packaging: "Embalagem",
    marginCalculation: "Cálculo de margem",

    // Dynamic ProductRow fields (from Bitrix24 API)
    ID: "ID",
    OWNER_ID: "ID do proprietário",
    OWNER_TYPE: "Tipo de proprietário",
    PRODUCT_ID: "ID do produto",
    PRICE: "Preço",
    PRICE_EXCLUSIVE: "Preço com desconto sem imposto",
    PRICE_NETTO: "Preço líquido",
    PRICE_BRUTTO: "Preço bruto",
    DISCOUNT_TYPE_ID: "Tipo de desconto",
    DISCOUNT_RATE: "Valor do desconto",
    DISCOUNT_SUM: "Valor do desconto",
    TAX_RATE: "Imposto",
    TAX_INCLUDED: "Imposto incluído",
    CUSTOMIZED: "Modificado em",
    MEASURE_CODE: "Código da unidade de medida",
    MEASURE_NAME: "Unidade de medida",
    SORT: "Ordenação",
    TYPE: "Tipo",
    ORIGINAL_PRODUCT_NAME: "Nome original do produto",
    PRODUCT_DESCRIPTION: "Descrição do produto",
    PRICE_ACCOUNT: "Conta de preço",
    XML_ID: "XML ID",
    STORE_ID: "Armazém",
    RESERVE_ID: "ID da reserva",
    RESERVE_QUANTITY: "Quantidade reservada",
    DATE_RESERVE_END: "Data de término da reserva",
  },
};