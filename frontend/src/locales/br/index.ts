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
    primaryColor: "Cor primária",
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
      "Este é um texto de exemplo para visualizar suas escolhas de cores. Você pode ver como a cor primária e a cor do texto funcionam juntas.",
    sampleButton: "Ação primária",
    sampleButtonSecondary: "Ação secundária",
    reset: "Restaurar padrões",
    saveSuccess: "Configurações salvas com sucesso",
    saveError: "Falha ao salvar configurações",
    resetSuccess: "Configurações restauradas aos padrões",
  },
  home: {
    title: "Calculadora de preços para Bitrix24",
    description:
      "Ferramenta profissional para calcular preços de produtos, margens e gerenciar custos de fornecedores diretamente em seus negócios Bitrix24",

    features: {
      priceCalc: "Cálculo de preços",
      priceCalcDesc: "Cálculo automático de margem",
      currency: "Multi-moeda",
      currencyDesc: "Suporte para PLN, USD, EUR",
      suppliers: "Fornecedores",
      suppliersDesc: "Gerenciamento de preços de fornecedores",
      integration: "Integração",
      integrationDesc: "Integração completa com Bitrix24",
    },

    howToUse: {
      title: "Como usar",
      step1: {
        title: "Configure as definições",
        description:
          "Configure taxas de câmbio e preferências de colunas na seção Configurações",
      },
      step2: {
        title: "Abra um negócio no Bitrix24",
        description: "Navegue para qualquer negócio em seu CRM Bitrix24",
        note: "O widget estará disponível no cartão do negócio",
      },
      step3: {
        title: "Use o widget calculadora",
        description:
          "Clique no widget Calculadora de preços no negócio para calcular preços e margens para produtos",
      },
      step4: {
        title: "Salvar no negócio",
        description:
          "Os dados calculados são automaticamente salvos no negócio com todos os detalhes de preços",
      },
    },

    info: {
      whereToFind: {
        title: "Onde encontrar o widget",
        message:
          "A calculadora de preços aparece como um widget incorporado dentro dos negócios Bitrix24",
        step1: "Abra qualquer negócio no CRM Bitrix24",
        step2: 'Procure pela aba ou widget "Calculadora de preços"',
        step3: "Clique para abrir a interface da calculadora",
      },
      features: {
        title: "Recursos principais",
        item1: "Conversão de moeda em tempo real",
        item2: "Preços específicos do fornecedor",
        item3: "Rastreamento de custos de transporte e embalagem",
        item4: "Cálculo automático de margem",
      },
    },

    quickActions: {
      title: "Ações rápidas",
      settings: "Configurar definições",
      testWidget: "Testar widget",
      documentation: "Ver documentação",
    },

    status: {
      title: "Status do sistema",
      appVersion: "Versão do aplicativo",
      bitrixConnection: "Conexão Bitrix24",
      connected: "Conectado",
      disconnected: "Desconectado",
      user: "Usuário atual",
      domain: "Domínio",
      language: "Idioma",
      lastSync: "Última sincronização",
    },

    messages: {
      widgetOpened: "Widget aberto em nova janela",
      widgetError: "Erro ao abrir widget",
      documentationComingSoon: "Documentação em breve",
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
        question:
          "Como funciona a recuperação automática do preço de compra ao selecionar um fornecedor?",
        answer:
          "Ao selecionar um fornecedor, o aplicativo pesquisa em seu banco de dados o preço desse fornecedor para o produto selecionado e insere automaticamente o preço de compra + moeda. Se não houver preços para a combinação 'fornecedor-produto', o campo permanece vazio e você precisa inserir o preço manualmente.",
      },
      item5: {
        question:
          "Posso personalizar a visualização da tabela e o conjunto de colunas?",
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
    subtitle: "Gerencie sua licença de aplicativo",
    currentLicense: "Licença atual",
    terms: "Termos e condições",
    status: "Status",
    type: "Tipo de licença",
    validFrom: "Válida desde",
    validUntil: "Válida até",
    domain: "Domínio licenciado",
    users: "Número de usuários",
    active: "Ativa",
    expired: "Expirada",
    expiringSoon: "Expirando em breve",
    checking: "Verificando...",
    checkLicense: "Verificar licença",
    activateLicense: "Ativar licença",
    licenseKey: "Chave de licença",
    enterLicenseKey: "Digite sua chave de licença",
    activationNote: "A licença será vinculada ao domínio atual",
    checkSuccess: "Licença verificada com sucesso",
    checkError: "Erro ao verificar licença",
    keyRequired: "Por favor, digite uma chave de licença",
    activationSuccess: "Licença ativada com sucesso",
    activationError: "Erro ao ativar licença",
    termsTitle: "Termos e condições da licença",
    termsContent:
      "<p>Ao usar este software, você concorda com os seguintes termos...</p>",
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
