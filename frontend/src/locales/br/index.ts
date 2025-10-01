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
    title: "Sobre a Calculadora de preços",
    description:
      "Um widget profissional para Bitrix24 que permite calcular preços de produtos, margens e gerenciar custos diretamente em seus negócios",

    faq: {
      item1: {
        question: "Como funciona a calculadora de preços?",
        answer:
          "A calculadora automaticamente busca produtos do seu negócio Bitrix24, permite definir preços de compra, custos de transporte e embalagem, depois calcula margens e totais com suporte multi-moeda.",
      },
      item2: {
        question: "Onde posso encontrar o widget?",
        answer:
          "O widget aparece dentro de cada negócio no CRM Bitrix24. Abra qualquer negócio e procure pela aba ou painel do widget Calculadora de preços.",
      },
      item3: {
        question: "Posso salvar preços específicos de fornecedores?",
        answer:
          "Sim, você pode associar preços específicos a diferentes fornecedores para cada produto. Esses preços são salvos e carregados automaticamente quando você seleciona um fornecedor.",
      },
      item4: {
        question: "Quais moedas são suportadas?",
        answer:
          "A calculadora suporta PLN, USD e EUR com conversão em tempo real baseada nas taxas de câmbio que você configura.",
      },
      item5: {
        question: "Como os dados são salvos?",
        answer:
          "Todos os cálculos são salvos diretamente no negócio Bitrix24. Os dados incluem todos os detalhes de preços, margens e informações de fornecedores.",
      },
      item6: {
        question: "Posso personalizar quais campos são exibidos?",
        answer:
          "Sim, você pode configurar quais colunas aparecem na calculadora através das configurações de colunas. Alguns campos são obrigatórios e não podem ser ocultos.",
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