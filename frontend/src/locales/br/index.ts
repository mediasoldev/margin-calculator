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
    preview: "Visualização do tema",
    livePreview: "Visualização ao vivo",
    sampleTitle: "Título de exemplo",
    sampleText:
      "Este é um texto de exemplo para visualizar suas escolhas de cores. Você pode ver como a cor principal e a cor do texto funcionam juntas.",
    sampleButton: "Ação principal",
    sampleButtonSecondary: "Ação secundária",
    reset: "Redefinir para padrão",
    saveSuccess: "Configurações salvas com sucesso",
    saveError: "Falha ao salvar configurações",
    resetSuccess: "Configurações redefinidas para padrão",
  },

  home: {
    title: "Calculadora de Margem para Bitrix24",
    description:
      "Avalie rapidamente a lucratividade do produto levando em consideração o preço de compra, transporte, embalagem e taxas de câmbio",

    importantNotice: "Importante",
    noticeDescription: "O aplicativo não altera o valor do negócio, mas insere informações de precificação do produto em campos adicionais",

    whereToFind: {
      title: "Onde encontrar o widget",
      step1: "Abra qualquer negócio no Bitrix24 CRM",
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
      flexibleDesc: "Vista de tabela, cartões ou acordeão personalizável",
    },
  },

  about: {
    title: "Sobre a Calculadora de Margem",
    description:
      "A Calculadora de Margem é um aplicativo de suporte para Bitrix24 que permite avaliar rapidamente a lucratividade do produto (margem) levando em consideração o preço de compra, transporte, embalagem e taxas de câmbio. IMPORTANTE: o aplicativo não altera o valor do negócio, mas insere informações de precificação do produto em campos adicionais.",

    faq: {
      item1: {
        question: "Onde definir taxas de câmbio e como elas são usadas?",
        answer:
          "Na parte superior da interface há campos para taxas de câmbio (por exemplo, USD/PLN, EUR/PLN, EUR/USD). Esses valores são usados para converter todos os valores para a moeda na qual o preço de venda está definido. Altere a taxa - o cálculo será atualizado automaticamente.",
      },
      item2: {
        question: "Como a margem é calculada (fórmula)?",
        answer:
          "Todas as despesas de entrada (compra, transporte, embalagem, etc.) são convertidas para a moeda do preço de venda de acordo com as taxas especificadas. Em seguida, a fórmula é aplicada: Receita Total = Preço_de_Venda × Quantidade; Despesas Totais = (Preço_de_Compra × Quantidade) + Transporte + Embalagem + Outras_Despesas; Margem = Receita Total − Despesas Totais; % de Margem = (Margem / Receita Total) × 100%",
      },
      item3: {
        question: "O que significa o botão 'Salvar'?",
        answer:
          "O botão salva o cálculo atual dentro do aplicativo (no próprio banco de dados do aplicativo) para visualização/análise posterior. Salvar não altera o valor do negócio Bitrix24, mas faz alterações em campos adicionais para informações de precificação.",
      },
      item4: {
        question: "Como funciona a recuperação automática do preço de compra ao selecionar um fornecedor?",
        answer:
          "Ao selecionar um fornecedor, o aplicativo pesquisa em seu banco de dados o preço desse fornecedor para o produto selecionado e insere automaticamente o preço de compra + moeda. Se não houver preços para a combinação 'fornecedor-produto', o campo permanece vazio e você precisa inserir o preço manualmente.",
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
      developerName: "Sua empresa",
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
    licensedTo: "Licenciada para",
    maxUsers: "Usuários máximos",
    unlimited: "Ilimitados",
    noLicense: "Sem chave de licença",
    purchaseContactTitle: "Para adquirir uma chave de licença, entre em contato conosco de qualquer forma conveniente:",
    website: "Site",
    phone: "Telefone",
    email: "E-mail",
    onlineChat: "Chat online",
    checkError: "Erro ao verificar licença",
  },

  pricing: {
    currencyInfo: "Informações de moeda",
    product: "Produto",
    productName: "Nome do produto",
    quantity: "Quantidade",
    salePrice: "Preço de venda",
    purchasePrice: "Preço de compra",
    transportCost: "Custo de transporte",
    packagingCost: "Custo de embalagem",
    action: "Ação",
    addProduct: "Adicionar produto",
    totalAmount: "Valor total",
    totalMargin: "Margem total",
    save: "Salvar",
    marginCalculation: "Cálculo de margem",
    unnamed: "Produto sem nome",
    packaging: "Embalagem",
    marginPercent: "Margem %",
    margin: "Margem",
    saveSuccess: "Cálculo salvo com sucesso",
  },
};