// frontend/src/locales/it/index.ts

export default {
  app: {
    name: "App Bitrix24",
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
    primaryColor: "Colore primario",
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
      "Questo è un testo di esempio per visualizzare in anteprima le tue scelte di colore. Puoi vedere come il colore primario e il colore del testo lavorano insieme.",
    sampleButton: "Azione primaria",
    sampleButtonSecondary: "Azione secondaria",
    reset: "Ripristina predefiniti",
    saveSuccess: "Impostazioni salvate con successo",
    saveError: "Impossibile salvare le impostazioni",
    resetSuccess: "Impostazioni ripristinate ai valori predefiniti",
  },
  home: {
    title: "Calcolatore prezzi per Bitrix24",
    description:
      "Strumento professionale per calcolare i prezzi dei prodotti, i margini e gestire i costi dei fornitori direttamente nei tuoi affari Bitrix24",

    features: {
      priceCalc: "Calcolo prezzi",
      priceCalcDesc: "Calcolo automatico del margine",
      currency: "Multi-valuta",
      currencyDesc: "Supporto per PLN, USD, EUR",
      suppliers: "Fornitori",
      suppliersDesc: "Gestione prezzi fornitori",
      integration: "Integrazione",
      integrationDesc: "Integrazione completa con Bitrix24",
    },

    howToUse: {
      title: "Come utilizzare",
      step1: {
        title: "Configura le impostazioni",
        description:
          "Imposta i tassi di cambio e le preferenze delle colonne nella sezione Impostazioni",
      },
      step2: {
        title: "Apri un affare in Bitrix24",
        description: "Naviga verso qualsiasi affare nel tuo CRM Bitrix24",
        note: "Il widget sarà disponibile nella scheda dell'affare",
      },
      step3: {
        title: "Usa il widget calcolatore",
        description:
          "Clicca sul widget Calcolatore prezzi nell'affare per calcolare prezzi e margini per i prodotti",
      },
      step4: {
        title: "Salva nell'affare",
        description:
          "I dati calcolati vengono salvati automaticamente nell'affare con tutti i dettagli di prezzo",
      },
    },

    info: {
      whereToFind: {
        title: "Dove trovare il widget",
        message:
          "Il calcolatore prezzi appare come widget integrato negli affari Bitrix24",
        step1: "Apri qualsiasi affare nel CRM Bitrix24",
        step2: 'Cerca la scheda o il widget "Calcolatore prezzi"',
        step3: "Clicca per aprire l'interfaccia del calcolatore",
      },
      features: {
        title: "Funzionalità principali",
        item1: "Conversione valuta in tempo reale",
        item2: "Prezzi specifici per fornitore",
        item3: "Tracciamento costi di trasporto e imballaggio",
        item4: "Calcolo automatico del margine",
      },
    },

    quickActions: {
      title: "Azioni rapide",
      settings: "Configura impostazioni",
      testWidget: "Testa widget",
      documentation: "Visualizza documentazione",
    },

    status: {
      title: "Stato del sistema",
      appVersion: "Versione app",
      bitrixConnection: "Connessione Bitrix24",
      connected: "Connesso",
      disconnected: "Disconnesso",
      user: "Utente corrente",
      domain: "Dominio",
      language: "Lingua",
      lastSync: "Ultima sincronizzazione",
    },

    messages: {
      widgetOpened: "Widget aperto in una nuova finestra",
      widgetError: "Errore nell'apertura del widget",
      documentationComingSoon: "Documentazione in arrivo",
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
        question:
          "Come funziona il recupero automatico del prezzo di acquisto quando si seleziona un fornitore?",
        answer:
          "Quando si seleziona un fornitore, l'applicazione cerca nel proprio database il prezzo di quel fornitore per il prodotto selezionato e inserisce automaticamente il prezzo di acquisto + valuta. Se non ci sono prezzi per la combinazione 'fornitore-prodotto', il campo rimane vuoto e devi inserire il prezzo manualmente.",
      },
      item5: {
        question:
          "Posso personalizzare la vista della tabella e l'insieme di colonne?",
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
    subtitle: "Gestisci la tua licenza applicazione",
    currentLicense: "Licenza corrente",
    terms: "Termini e condizioni",
    status: "Stato",
    type: "Tipo di licenza",
    validFrom: "Valida dal",
    validUntil: "Valida fino al",
    domain: "Dominio con licenza",
    users: "Numero di utenti",
    active: "Attiva",
    expired: "Scaduta",
    expiringSoon: "In scadenza",
    checking: "Verifica in corso...",
    checkLicense: "Verifica licenza",
    activateLicense: "Attiva licenza",
    licenseKey: "Chiave di licenza",
    enterLicenseKey: "Inserisci la tua chiave di licenza",
    activationNote: "La licenza sarà collegata al dominio corrente",
    checkSuccess: "Licenza verificata con successo",
    checkError: "Errore nella verifica della licenza",
    keyRequired: "Per favore inserisci una chiave di licenza",
    activationSuccess: "Licenza attivata con successo",
    activationError: "Errore nell'attivazione della licenza",
    termsTitle: "Termini e condizioni della licenza",
    termsContent:
      "<p>Utilizzando questo software, accetti i seguenti termini...</p>",
  },
  pricing: {
    currencyInfo: "Informazioni valuta",
    product: "Prodotto",
    productName: "Nome prodotto",
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
