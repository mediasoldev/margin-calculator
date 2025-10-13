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
      "Regola il colore del testo per un migliore contrasto con gli sfondi chiari",
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
      "Questo è un testo di esempio per visualizzare in anteprima le tue scelte di colore. Puoi vedere come il colore principale e il colore del testo lavorano insieme.",
    sampleButton: "Azione principale",
    sampleButtonSecondary: "Azione secondaria",
    reset: "Ripristina predefiniti",
    saveSuccess: "Impostazioni salvate con successo",
    saveError: "Impossibile salvare le impostazioni",
    resetSuccess: "Impostazioni ripristinate ai valori predefiniti",
  },

  home: {
    title: "Calcolatore di Margine per Bitrix24",
    description:
      "Valuta rapidamente la redditività del prodotto tenendo conto del prezzo di acquisto, trasporto, imballaggio e tassi di cambio",

    importantNotice: "Importante",
    noticeDescription: "L'applicazione non modifica l'importo della transazione, ma inserisce le informazioni sui prezzi del prodotto in campi aggiuntivi",

    whereToFind: {
      title: "Dove trovare il widget",
      step1: "Apri qualsiasi transazione in Bitrix24 CRM",
      step2: "Cerca la scheda o il widget 'Calcolatore di Margine' nella scheda transazione",
      step3: "Clicca per aprire e iniziare a calcolare i margini",
    },

    keyFeatures: {
      title: "Funzionalità principali",
      currencies: "Multi-valuta",
      currenciesDesc: "Supporto per PLN, USD, EUR con conversione automatica",
      margin: "Calcolo del margine",
      marginDesc: "Calcolo automatico con tutti i costi inclusi",
      suppliers: "Prezzi fornitori",
      suppliersDesc: "Compilazione automatica dei prezzi d'acquisto dal database fornitori",
      flexible: "Visualizzazione flessibile",
      flexibleDesc: "Vista tabella, schede o fisarmonica personalizzabile",
    },
  },

  about: {
    title: "Informazioni sul Calcolatore di Margine",
    description:
      "Il Calcolatore di Margine è un'applicazione di supporto per Bitrix24 che consente di valutare rapidamente la redditività del prodotto (margine) tenendo conto del prezzo di acquisto, trasporto, imballaggio e tassi di cambio. IMPORTANTE: l'applicazione non modifica l'importo della transazione, ma inserisce le informazioni sui prezzi del prodotto in campi aggiuntivi.",

    faq: {
      item1: {
        question: "Dove impostare i tassi di cambio e come vengono utilizzati?",
        answer:
          "Nella parte superiore dell'interfaccia ci sono campi per i tassi di cambio (ad esempio, USD/PLN, EUR/PLN, EUR/USD). Questi valori vengono utilizzati per convertire tutti gli importi nella valuta in cui è impostato il prezzo di vendita. Modifica il tasso - il calcolo verrà aggiornato automaticamente.",
      },
      item2: {
        question: "Come viene calcolato il margine (formula)?",
        answer:
          "Tutte le spese in entrata (acquisto, trasporto, imballaggio, ecc.) vengono convertite nella valuta del prezzo di vendita secondo i tassi specificati. Quindi viene applicata la formula: Ricavo Totale = Prezzo_di_Vendita × Quantità; Spese Totali = (Prezzo_di_Acquisto × Quantità) + Trasporto + Imballaggio + Altre_Spese; Margine = Ricavo Totale − Spese Totali; % Margine = (Margine / Ricavo Totale) × 100%",
      },
      item3: {
        question: "Cosa significa il pulsante 'Salva'?",
        answer:
          "Il pulsante salva il calcolo corrente all'interno dell'applicazione (nel proprio database dell'applicazione) per la successiva visualizzazione/analisi. Il salvataggio non modifica l'importo della transazione Bitrix24, ma apporta modifiche ai campi aggiuntivi per le informazioni sui prezzi.",
      },
      item4: {
        question: "Come funziona il recupero automatico del prezzo di acquisto quando si seleziona un fornitore?",
        answer:
          "Quando si seleziona un fornitore, l'applicazione cerca nel proprio database il prezzo di quel fornitore per il prodotto selezionato e inserisce automaticamente il prezzo di acquisto + valuta. Se non ci sono prezzi per la combinazione 'fornitore-prodotto', il campo rimane vuoto e devi inserire il prezzo manualmente.",
      },
      item5: {
        question: "Posso personalizzare la vista della tabella e l'insieme di colonne?",
        answer:
          "Sì. L'interfaccia include modalità di visualizzazione (tabella, schede, fisarmonica) e un pulsante 'Impostazioni' per configurare le colonne visibili. Utilizza questi pulsanti per nascondere/mostrare i campi richiesti.",
      },
    },

    info: {
      title: "Informazioni sull'applicazione",
      version: "Versione",
      lastUpdate: "Ultimo aggiornamento",
      developer: "Sviluppatore",
      developerName: "La tua azienda",
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
    validUntil: "Valida fino al",
    expiresIn: "Scade tra",
    days: "giorni",
    today: "Oggi",
    expired: "Scaduta",
    trial: "Versione di prova",
    licensedTo: "Licenza per",
    maxUsers: "Utenti massimi",
    unlimited: "Illimitati",
    noLicense: "Nessuna chiave di licenza",
    purchaseContactTitle: "Per acquistare una chiave di licenza, contattaci in qualsiasi modo conveniente:",
    website: "Sito web",
    phone: "Telefono",
    email: "E-mail",
    onlineChat: "Chat online",
    checkError: "Errore durante la verifica della licenza",
  },

  pricing: {
    currencyInfo: "Informazioni sulla valuta",
    product: "Prodotto",
    productName: "Nome del prodotto",
    quantity: "Quantità",
    salePrice: "Prezzo di vendita",
    purchasePrice: "Prezzo di acquisto",
    transportCost: "Costo di trasporto",
    packagingCost: "Costo di imballaggio",
    action: "Azione",
    addProduct: "Aggiungi prodotto",
    totalAmount: "Importo totale",
    totalMargin: "Margine totale",
    save: "Salva",
    marginCalculation: "Calcolo del margine",
    unnamed: "Prodotto senza nome",
    packaging: "Imballaggio",
    marginPercent: "Margine %",
    margin: "Margine",
    saveSuccess: "Calcolo salvato con successo",
  },
};