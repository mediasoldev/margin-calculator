// frontend/src/locales/de/index.ts

export default {
  app: {
    name: "Bitrix24 App",
    welcome: "Willkommen",
    loading: "Lädt...",
  },
  menu: {
    home: "Startseite",
    settings: "Einstellungen",
    license: "Lizenz",
    about: "Über",
  },
  settings: {
    title: "Einstellungen",
    theme: "Thema",
    language: "Sprache",
    light: "Hell",
    dark: "Dunkel",
    auto: "Automatisch",
    save: "Speichern",
    saved: "Einstellungen gespeichert",
    primaryColor: "Primärfarbe",
    textColor: "Textfarbe",
    textColorHint:
      "Passen Sie die Textfarbe für einen besseren Kontrast zu hellen Hintergründen an",
    compactMode: "Kompaktmodus",
    compactModeOn: "Aktiviert - Reduzierte Abstände",
    compactModeOff: "Deaktiviert - Normale Abstände",
    animations: "Animationen",
    animationsOn: "Aktiviert - Fließende Übergänge",
    animationsOff: "Deaktiviert - Sofortige Änderungen",
    preview: "Themenvorschau",
    livePreview: "Live-Vorschau",
    sampleTitle: "Beispieltitel",
    sampleText:
      "Dies ist ein Beispieltext zur Vorschau Ihrer Farbauswahl. Sie können sehen, wie die Primärfarbe und die Textfarbe zusammenarbeiten.",
    sampleButton: "Primäre Aktion",
    sampleButtonSecondary: "Sekundäre Aktion",
    reset: "Auf Standardwerte zurücksetzen",
    saveSuccess: "Einstellungen erfolgreich gespeichert",
    saveError: "Fehler beim Speichern der Einstellungen",
    resetSuccess: "Einstellungen auf Standardwerte zurückgesetzt",
  },

  home: {
    title: "Margenrechner für Bitrix24",
    description:
      "Bewerten Sie schnell die Rentabilität von Produkten unter Berücksichtigung von Einkaufspreis, Transport, Verpackung und Wechselkursen",

    importantNotice: "Wichtig",
    noticeDescription:
      "Die Anwendung ändert den Geschäftsbetrag nicht, sondern trägt Produktpreisinformationen in zusätzliche Felder ein",

    whereToFind: {
      title: "Wo finde ich das Widget",
      step1: "Öffnen Sie ein beliebiges Geschäft im Bitrix24 CRM",
      step2: "Suchen Sie nach dem Tab oder Widget 'Margenrechner' in der Geschäftskarte",
      step3: "Klicken Sie zum Öffnen und beginnen Sie mit der Margenberechnung",
    },

    keyFeatures: {
      title: "Hauptfunktionen",
      currencies: "Mehrere Währungen",
      currenciesDesc: "Unterstützung für PLN, USD, EUR mit automatischer Umrechnung",
      margin: "Margenberechnung",
      marginDesc: "Automatische Berechnung unter Berücksichtigung aller Kosten",
      suppliers: "Lieferantenpreise",
      suppliersDesc: "Auto-Ausfüllen von Einkaufspreisen aus der Lieferantendatenbank",
      flexible: "Flexible Anzeige",
      flexibleDesc: "Anpassbare Tabellen-, Karten- oder Akkordeonansicht",
    },
  },

  about: {
    title: "Über den Margenrechner",
    description:
      "Margenrechner ist eine unterstützende Anwendung für Bitrix24, mit der Sie schnell die Rentabilität eines Produkts (Marge) unter Berücksichtigung von Einkaufspreis, Transport, Verpackung und Wechselkursen bewerten können. WICHTIG: Die Anwendung ändert den Geschäftsbetrag nicht, sondern trägt Produktpreisinformationen in zusätzliche Felder ein.",

    faq: {
      item1: {
        question: "Wo stelle ich Wechselkurse ein und wie werden sie verwendet?",
        answer:
          "Oben in der Oberfläche befinden sich Felder für Wechselkurse (z. B. USD/PLN, EUR/PLN, EUR/USD). Diese Werte werden verwendet, um alle Beträge in die Währung umzurechnen, in der der Verkaufspreis festgelegt ist. Ändern Sie den Kurs - die Berechnung wird automatisch aktualisiert.",
      },
      item2: {
        question: "Wie wird die Marge berechnet (Formel)?",
        answer:
          "Alle eingehenden Ausgaben (Einkauf, Transport, Verpackung usw.) werden entsprechend den angegebenen Kursen in die Währung des Verkaufspreises umgerechnet. Dann wird die Formel angewendet: Gesamtumsatz = Verkaufspreis × Menge; Gesamtkosten = (Einkaufspreis × Menge) + Transport + Verpackung + Sonstige_Kosten; Marge = Gesamtumsatz − Gesamtkosten; Marge % = (Marge / Gesamtumsatz) × 100%",
      },
      item3: {
        question: "Was bedeutet die Schaltfläche 'Speichern'?",
        answer:
          "Die Schaltfläche speichert die aktuelle Berechnung in der Anwendung (in der eigenen Datenbank der Anwendung) zur weiteren Ansicht/Analyse. Das Speichern ändert nicht den Bitrix24-Geschäftsbetrag, nimmt aber Änderungen an zusätzlichen Feldern für Preisinformationen vor.",
      },
      item4: {
        question:
          "Wie funktioniert das automatische Abrufen des Einkaufspreises bei der Lieferantenauswahl?",
        answer:
          "Bei der Auswahl eines Lieferanten durchsucht die Anwendung ihre Datenbank nach dem Preis dieses Lieferanten für das ausgewählte Produkt und fügt automatisch den Einkaufspreis + Währung ein. Wenn keine Preise für die Kombination 'Lieferant-Produkt' vorhanden sind, bleibt das Feld leer und Sie müssen den Preis manuell eingeben.",
      },
      item5: {
        question: "Kann ich die Tabellenansicht und den Spaltensatz anpassen?",
        answer:
          "Ja. Die Oberfläche umfasst Anzeigemodi (Tabelle, Karten, Akkordeon) und eine Schaltfläche 'Einstellungen' zum Konfigurieren sichtbarer Spalten. Verwenden Sie diese Schaltflächen, um die erforderlichen Felder ein-/auszublenden.",
      },
    },

    info: {
      title: "Anwendungsinformationen",
      version: "Version",
      lastUpdate: "Letzte Aktualisierung",
      developer: "Entwickler",
      developerName: "Ihr Unternehmen",
      support: "Support",
    },
  },

  common: {
    yes: "Ja",
    no: "Nein",
    ok: "OK",
    cancel: "Abbrechen",
    close: "Schließen",
    error: "Fehler",
    success: "Erfolg",
  },

  license: {
    title: "Lizenz",
    subtitle: "Lizenzinformationen der Anwendung",
    licenseKey: "Lizenzschlüssel",
    validUntil: "Gültig bis",
    expiresIn: "Läuft ab in",
    days: "Tagen",
    today: "Heute",
    expired: "Abgelaufen",
    trial: "Testversion",
    licensedTo: "Lizenziert für",
    maxUsers: "Maximale Benutzer",
    unlimited: "Unbegrenzt",
    noLicense: "Kein Lizenzschlüssel",
    purchaseContactTitle:
      "Um einen Lizenzschlüssel zu erwerben, kontaktieren Sie uns auf bequeme Weise:",
    website: "Website",
    phone: "Telefon",
    email: "E-Mail",
    onlineChat: "Online-Chat",
    checkError: "Fehler beim Überprüfen der Lizenz",
  },

  pricing: {
    // Currency section
    currencyInfo: "Währungsinformationen",
    currencyRates: "Wechselkurse",

    // Column names (main fields)
    product: "Produkt",
    productName: "Produktname",
    quantity: "Menge",
    salePrice: "Verkaufspreis",
    purchasePrice: "Einkaufspreis",
    supplier: "Lieferant",
    transportCost: "Transportkosten",
    packagingCost: "Verpackungskosten",
    marginPercent: "Marge %",
    marginPerUnit: "Marge (pro Einheit)",
    marginAmount: "Marge (berechnet)",
    totalMargin: "Gesamtmarge",
    action: "Aktion",

    // View modes
    viewMode: "Anzeigemodus",
    tableView: "Tabelle",
    cardsView: "Karten",
    accordionView: "Akkordeon",

    // Actions
    columns: "Spalten",
    refresh: "Aktualisieren",
    save: "Speichern",
    addProduct: "Produkt hinzufügen",
    edit: "Bearbeiten",
    selectSupplier: "Lieferant auswählen",
    loadFromBitrix: "Von Bitrix laden",

    // Column settings modal
    columnSettings: "Spalteneinstellungen",
    columnSettingsInfo:
      "Ziehen Sie, um die Spaltenreihenfolge zu ändern. Erforderliche Spalten können nicht ausgeblendet werden, aber neu angeordnet werden.",
    requiredColumns: "Erforderliche Spalten",
    optionalColumns: "Optionale Spalten",
    availableColumns: "Verfügbare Spalten",
    alwaysVisible: "Immer sichtbar",
    required: "Erforderlich",
    readOnly: "Schreibgeschützt",
    editableField: "Bearbeitbar",
    optional: "Optional",
    productField: "Produktfeld",
    resetToDefaults: "Auf Standardwerte zurücksetzen",
    visible: "sichtbar",
    order: "Reihenfolge",
    show: "Anzeigen",
    columnName: "Spaltenname",
    status: "Status",
    showAll: "Alle anzeigen",
    hideOptional: "Optionale ausblenden",

    // Summary
    totalAmount: "Gesamtbetrag",
    productMargin: "Produktmarge",

    // Messages
    productsLoaded: "Produkte erfolgreich geladen",
    loadedFromBitrix: "Produkte erfolgreich von Bitrix24 geladen",
    loadError: "Fehler beim Laden der Produkte",
    priceLoadError: "Fehler beim Laden des Lieferantenpreises",
    saveSuccess: "Berechnung erfolgreich gespeichert",
    saveError: "Fehler beim Speichern der Berechnung",

    // Comparison status messages
    savedMatchesDeal: "✓ Gespeicherte Berechnung stimmt mit aktuellem Geschäft überein",
    savedDiffersFromDeal: "⚠ Gespeicherte Berechnung unterscheidet sich vom aktuellen Geschäft",
    notCalculatedYet: "ℹ Berechnung noch nicht gespeichert",

    // Supplier modal
    addSupplier: "Lieferant hinzufügen",
    editSupplier: "Lieferant bearbeiten",
    company: "Unternehmen",
    selectCompany: "Unternehmen auswählen",
    currency: "Währung",
    selectCurrency: "Währung auswählen",
    enterPrice: "Preis eingeben",
    pleaseSelectCompany: "Bitte wählen Sie ein Unternehmen",
    pleaseEnterValidPrice: "Bitte geben Sie einen gültigen Preis ein",
    pleaseSelectCurrency: "Bitte wählen Sie eine Währung",

    // Placeholder
    cardsViewComingSoon: "Kartenansicht - Demnächst",
    accordionViewComingSoon: "Akkordeonansicht - Demnächst",

    // Unnamed product
    unnamed: "Unbenanntes Produkt",
    packaging: "Verpackung",
    marginCalculation: "Margenberechnung",

    // Dynamic ProductRow fields (from Bitrix24 API)
    ID: "ID",
    OWNER_ID: "Besitzer-ID",
    OWNER_TYPE: "Besitzertyp",
    PRODUCT_ID: "Produkt-ID",
    PRICE: "Preis",
    PRICE_EXCLUSIVE: "Reduzierter Preis ohne Steuer",
    PRICE_NETTO: "Nettopreis",
    PRICE_BRUTTO: "Bruttopreis",
    DISCOUNT_TYPE_ID: "Rabatttyp",
    DISCOUNT_RATE: "Rabattwert",
    DISCOUNT_SUM: "Rabattbetrag",
    TAX_RATE: "Steuer",
    TAX_INCLUDED: "Steuer enthalten",
    CUSTOMIZED: "Geändert am",
    MEASURE_CODE: "Maßeinheitscode",
    MEASURE_NAME: "Maßeinheit",
    SORT: "Sortierung",
    TYPE: "Typ",
    ORIGINAL_PRODUCT_NAME: "Original-Produktname",
    PRODUCT_DESCRIPTION: "Produktbeschreibung",
    PRICE_ACCOUNT: "Preiskonto",
    XML_ID: "XML-ID",
    STORE_ID: "Lager",
    RESERVE_ID: "Reservierungs-ID",
    RESERVE_QUANTITY: "Reservierte Menge",
    DATE_RESERVE_END: "Reservierungsende",
  },
};