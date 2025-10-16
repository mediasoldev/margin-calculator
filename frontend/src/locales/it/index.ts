// frontend/src/locales/it/index.ts

export default {
  app: {
    name: "Applicazione Bitrix24",
    welcome: "Benvenuto",
    loading: "Caricamento...",
  },
  menu: {
    home: "Home",
    settings: "Impostazioni",
    license: "Licenza",
    about: "Informazioni",
  },
  settings: {
    title: "Impostazioni",
    theme: "Tema",
    language: "Lingua",
    light: "Chiaro",
    dark: "Scuro",
    auto: "Automatico",
    save: "Salva",
    saved: "Impostazioni salvate",
    primaryColor: "Colore principale",
    textColor: "Colore del testo",
    textColorHint:
      "Regola il colore del testo per un migliore contrasto con sfondi chiari",
    compactMode: "Modalità compatta",
    compactModeOn: "Attivata - Spaziatura ridotta",
    compactModeOff: "Disattivata - Spaziatura normale",
    animations: "Animazioni",
    animationsOn: "Attivate - Transizioni fluide",
    animationsOff: "Disattivate - Cambiamenti istantanei",
    preview: "Anteprima tema",
    livePreview: "Anteprima dal vivo",
    sampleTitle: "Titolo di esempio",
    sampleText:
      "Questo è un testo di esempio per visualizzare in anteprima le scelte di colore. Puoi vedere come il colore principale e il colore del testo funzionano insieme.",
    sampleButton: "Azione principale",
    sampleButtonSecondary: "Azione secondaria",
    reset: "Ripristina predefiniti",
    saveSuccess: "Impostazioni salvate con successo",
    saveError: "Errore nel salvataggio delle impostazioni",
    resetSuccess: "Impostazioni ripristinate ai valori predefiniti",
  },

  home: {
    title: "Calcolatore margine per Bitrix24",
    description:
      "Valuta rapidamente la redditività dei prodotti tenendo conto del prezzo di acquisto, trasporto, imballaggio e tassi di cambio",

    importantNotice: "Importante",
    noticeDescription:
      "L'applicazione non modifica l'importo dell'affare, ma inserisce le informazioni sui prezzi dei prodotti in campi aggiuntivi",

    whereToFind: {
      title: "Dove trovare il widget",
      step1: "Apri qualsiasi affare nel CRM Bitrix24",
      step2: "Cerca la scheda o il widget 'Calcolatore margine' nella scheda dell'affare",
      step3: "Clicca per aprire e inizia a calcolare i margini",
    },

    keyFeatures: {
      title: "Caratteristiche principali",
      currencies: "Multi-valuta",
      currenciesDesc: "Supporto per PLN, USD, EUR con conversione automatica",
      margin: "Calcolo margine",
      marginDesc: "Calcolo automatico con tutti i costi inclusi",
      suppliers: "Prezzi fornitori",
      suppliersDesc: "Compilazione automatica dei prezzi di acquisto dal database fornitori",
      flexible: "Visualizzazione flessibile",
      flexibleDesc: "Tabella, schede o vista a fisarmonica personalizzabili",
    },
  },

  about: {
    title: "Informazioni sul calcolatore margine",
    description:
      "Il calcolatore margine è un'applicazione di supporto per Bitrix24 che consente di valutare rapidamente la redditività di un prodotto (margine) tenendo conto del prezzo di acquisto, trasporto, imballaggio e tassi di cambio. IMPORTANTE: l'applicazione non modifica l'importo dell'affare, ma inserisce le informazioni sui prezzi dei prodotti in campi aggiuntivi.",

    faq: {
      item1: {
        question: "Dove impostare i tassi di cambio e come vengono utilizzati?",
        answer:
          "Nella parte superiore dell'interfaccia ci sono campi per i tassi di cambio (ad esempio, USD/PLN, EUR/PLN, EUR/USD). Questi valori vengono utilizzati per convertire tutti gli importi nella valuta in cui è impostato il prezzo di vendita. Modifica il tasso - il calcolo si aggiornerà automaticamente.",
      },
      item2: {
        question: "Come viene calcolato il margine (formula)?",
        answer:
          "Tutte le spese in entrata (acquisto, trasporto, imballaggio, ecc.) vengono convertite nella valuta del prezzo di vendita secondo i tassi specificati. Quindi viene applicata la formula: Ricavo totale = Prezzo_di_vendita × Quantità; Spese totali = (Prezzo_di_acquisto × Quantità) + Trasporto + Imballaggio + Altre_spese; Margine = Ricavo_totale − Spese_totali; Margine % = (Margine / Ricavo_totale) × 100%",
      },
      item3: {
        question: "Cosa significa il pulsante 'Salva'?",
        answer:
          "Il pulsante salva il calcolo corrente all'interno dell'applicazione (nel database proprio dell'applicazione) per una consultazione/analisi successiva. Il salvataggio non modifica l'importo dell'affare Bitrix24, ma apporta modifiche ai campi aggiuntivi per le informazioni sui prezzi.",
      },
      item4: {
        question:
          "Come funziona il recupero automatico del prezzo di acquisto quando si seleziona un fornitore?",
        answer:
          "Quando si seleziona un fornitore, l'applicazione cerca nel suo database il prezzo di quel fornitore per il prodotto selezionato e inserisce automaticamente il prezzo di acquisto + valuta. Se non ci sono prezzi per la combinazione 'fornitore-prodotto', il campo rimane vuoto e devi inserire il prezzo manualmente.",
      },
      item5: {
        question: "Posso personalizzare la vista della tabella e l'insieme delle colonne?",
        answer:
          "Sì. L'interfaccia include modalità di visualizzazione (tabella, schede, fisarmonica) e un pulsante 'Impostazioni' per configurare le colonne visibili. Usa questi pulsanti per nascondere/mostrare i campi richiesti.",
      },
    },

    info: {
      title: "Informazioni sull'applicazione",
      version: "Versione",
      lastUpdate: "Ultimo aggiornamento",
      developer: "Sviluppatore",
      developerName: "La Tua Azienda",
      support: "Supporto",
    },
  },

  common: {
    yes: "Sì",
    no: "No",
    ok: "OK",
    cancel: "Annulla",
    close: "Chiudi",
    error: "Errore",
    success: "Successo",
  },

  license: {
    title: "Licenza",
    subtitle: "Informazioni sulla licenza dell'applicazione",
    licenseKey: "Chiave di licenza",
    validUntil: "Valida fino a",
    expiresIn: "Scade tra",
    days: "giorni",
    today: "Oggi",
    expired: "Scaduta",
    trial: "Versione di prova",
    licensedTo: "Licenza per",
    maxUsers: "Utenti massimi",
    unlimited: "Illimitato",
    noLicense: "Nessuna chiave di licenza",
    purchaseContactTitle:
      "Per acquistare una chiave di licenza, contattaci in qualsiasi modo conveniente:",
    website: "Sito web",
    phone: "Telefono",
    email: "Email",
    onlineChat: "Chat online",
    checkError: "Errore nella verifica della licenza",
  },

  pricing: {
    // Currency section
    currencyInfo: "Informazioni valuta",
    currencyRates: "Tassi di cambio",

    // Column names (main fields)
    product: "Prodotto",
    productName: "Nome prodotto",
    quantity: "Quantità",
    salePrice: "Prezzo di vendita",
    purchasePrice: "Prezzo di acquisto",
    supplier: "Fornitore",
    transportCost: "Costo trasporto",
    packagingCost: "Costo imballaggio",
    marginPercent: "Margine %",
    marginPerUnit: "Margine (per unità)",
    marginAmount: "Margine (calcolato)",
    totalMargin: "Margine totale",
    action: "Azione",

    // View modes
    viewMode: "Modalità visualizzazione",
    tableView: "Tabella",
    cardsView: "Schede",
    accordionView: "Fisarmonica",

    // Actions
    columns: "Colonne",
    refresh: "Aggiorna",
    save: "Salva",
    addProduct: "Aggiungi prodotto",
    edit: "Modifica",
    selectSupplier: "Seleziona fornitore",
    loadFromBitrix: "Carica da Bitrix",

    // Column settings modal
    columnSettings: "Impostazioni colonne",
    columnSettingsInfo:
      "Trascina per riordinare le colonne. Le colonne obbligatorie non possono essere nascoste ma possono essere riordinate.",
    requiredColumns: "Colonne obbligatorie",
    optionalColumns: "Colonne opzionali",
    availableColumns: "Colonne disponibili",
    alwaysVisible: "Sempre visibile",
    required: "Obbligatorio",
    readOnly: "Solo lettura",
    editableField: "Modificabile",
    optional: "Opzionale",
    productField: "Campo prodotto",
    resetToDefaults: "Ripristina predefiniti",
    visible: "visibile",
    order: "Ordine",
    show: "Mostra",
    columnName: "Nome colonna",
    status: "Stato",
    showAll: "Mostra tutto",
    hideOptional: "Nascondi opzionali",

    // Summary
    totalAmount: "Importo totale",
    productMargin: "Margine prodotto",

    // Messages
    productsLoaded: "Prodotti caricati con successo",
    loadedFromBitrix: "Prodotti caricati da Bitrix24 con successo",
    loadError: "Errore nel caricamento dei prodotti",
    priceLoadError: "Errore nel caricamento del prezzo del fornitore",
    saveSuccess: "Calcolo salvato con successo",
    saveError: "Errore nel salvataggio del calcolo",

    // Comparison status messages
    savedMatchesDeal: "✓ Il calcolo salvato corrisponde all'affare corrente",
    savedDiffersFromDeal: "⚠ Il calcolo salvato differisce dall'affare corrente",
    notCalculatedYet: "ℹ Calcolo non ancora salvato",

    // Supplier modal
    addSupplier: "Aggiungi fornitore",
    editSupplier: "Modifica fornitore",
    company: "Azienda",
    selectCompany: "Seleziona azienda",
    currency: "Valuta",
    selectCurrency: "Seleziona valuta",
    enterPrice: "Inserisci prezzo",
    pleaseSelectCompany: "Seleziona un'azienda",
    pleaseEnterValidPrice: "Inserisci un prezzo valido",
    pleaseSelectCurrency: "Seleziona una valuta",

    // Placeholder
    cardsViewComingSoon: "Vista schede - Prossimamente",
    accordionViewComingSoon: "Vista fisarmonica - Prossimamente",

    // Unnamed product
    unnamed: "Prodotto senza nome",
    packaging: "Imballaggio",
    marginCalculation: "Calcolo margine",

    // Dynamic ProductRow fields (from Bitrix24 API)
    ID: "ID",
    OWNER_ID: "ID proprietario",
    OWNER_TYPE: "Tipo proprietario",
    PRODUCT_ID: "ID prodotto",
    PRICE: "Prezzo",
    PRICE_EXCLUSIVE: "Prezzo scontato senza IVA",
    PRICE_NETTO: "Prezzo netto",
    PRICE_BRUTTO: "Prezzo lordo",
    DISCOUNT_TYPE_ID: "Tipo sconto",
    DISCOUNT_RATE: "Valore sconto",
    DISCOUNT_SUM: "Importo sconto",
    TAX_RATE: "Imposta",
    TAX_INCLUDED: "Imposta inclusa",
    CUSTOMIZED: "Modificato il",
    MEASURE_CODE: "Codice unità di misura",
    MEASURE_NAME: "Unità di misura",
    SORT: "Ordinamento",
    TYPE: "Tipo",
    ORIGINAL_PRODUCT_NAME: "Nome originale prodotto",
    PRODUCT_DESCRIPTION: "Descrizione prodotto",
    PRICE_ACCOUNT: "Conto prezzo",
    XML_ID: "XML ID",
    STORE_ID: "Magazzino",
    RESERVE_ID: "ID prenotazione",
    RESERVE_QUANTITY: "Quantità prenotata",
    DATE_RESERVE_END: "Data fine prenotazione",
  },
};