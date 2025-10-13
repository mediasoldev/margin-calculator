// frontend/src/locales/de/index.ts

export default {
  app: {
    name: "Bitrix24 App",
    welcome: "Willkommen",
    loading: "Laden...",
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
      "Passen Sie die Textfarbe für besseren Kontrast mit hellem Hintergrund an",
    compactMode: "Kompaktmodus",
    compactModeOn: "Aktiviert - Reduzierte Abstände",
    compactModeOff: "Deaktiviert - Normale Abstände",
    animations: "Animationen",
    animationsOn: "Aktiviert - Weiche Übergänge",
    animationsOff: "Deaktiviert - Sofortige Änderungen",
    preview: "Themenvorschau",
    livePreview: "Live-Vorschau",
    sampleTitle: "Beispieltitel",
    sampleText:
      "Dies ist ein Beispieltext zur Vorschau Ihrer Farbauswahl. Sie können sehen, wie die Primärfarbe und Textfarbe zusammenarbeiten.",
    sampleButton: "Primäre Aktion",
    sampleButtonSecondary: "Sekundäre Aktion",
    reset: "Auf Standard zurücksetzen",
    saveSuccess: "Einstellungen erfolgreich gespeichert",
    saveError: "Fehler beim Speichern der Einstellungen",
    resetSuccess: "Einstellungen auf Standard zurückgesetzt",
  },
  home: {
    title: "Preiskalkulator für Bitrix24",
    description:
      "Professionelles Tool zur Berechnung von Produktpreisen, Margen und Verwaltung von Lieferantenkosten direkt in Ihren Bitrix24 Deals",

    features: {
      priceCalc: "Preisberechnung",
      priceCalcDesc: "Automatische Margenberechnung",
      currency: "Mehrwährungsfähigkeit",
      currencyDesc: "Unterstützung für PLN, USD, EUR",
      suppliers: "Lieferanten",
      suppliersDesc: "Verwaltung von Lieferantenpreisen",
      integration: "Integration",
      integrationDesc: "Vollständige Bitrix24 Integration",
    },

    howToUse: {
      title: "Anleitung",
      step1: {
        title: "Einstellungen konfigurieren",
        description:
          "Richten Sie Wechselkurse und Spalteneinstellungen im Einstellungsbereich ein",
      },
      step2: {
        title: "Deal in Bitrix24 öffnen",
        description:
          "Navigieren Sie zu einem beliebigen Deal in Ihrem Bitrix24 CRM",
        note: "Das Widget ist in der Deal-Karte verfügbar",
      },
      step3: {
        title: "Kalkulator-Widget verwenden",
        description:
          "Klicken Sie auf das Preiskalkulator-Widget im Deal, um Preise und Margen für Produkte zu berechnen",
      },
      step4: {
        title: "Im Deal speichern",
        description:
          "Berechnete Daten werden automatisch im Deal mit allen Preisdetails gespeichert",
      },
    },

    info: {
      whereToFind: {
        title: "Wo finde ich das Widget",
        message:
          "Der Preiskalkulator erscheint als eingebettetes Widget innerhalb von Bitrix24 Deals",
        step1: "Öffnen Sie einen beliebigen Deal im Bitrix24 CRM",
        step2:
          'Suchen Sie nach der Registerkarte oder dem Widget "Preiskalkulator"',
        step3: "Klicken Sie, um die Kalkulator-Oberfläche zu öffnen",
      },
      features: {
        title: "Hauptfunktionen",
        item1: "Echtzeit-Währungsumrechnung",
        item2: "Lieferantenspezifische Preise",
        item3: "Verfolgung von Transport- und Verpackungskosten",
        item4: "Automatische Margenberechnung",
      },
    },

    quickActions: {
      title: "Schnellaktionen",
      settings: "Einstellungen konfigurieren",
      testWidget: "Widget testen",
      documentation: "Dokumentation anzeigen",
    },

    status: {
      title: "Systemstatus",
      appVersion: "App-Version",
      bitrixConnection: "Bitrix24 Verbindung",
      connected: "Verbunden",
      disconnected: "Getrennt",
      user: "Aktueller Benutzer",
      domain: "Domain",
      language: "Sprache",
      lastSync: "Letzte Synchronisation",
    },

    messages: {
      widgetOpened: "Widget in neuem Fenster geöffnet",
      widgetError: "Fehler beim Öffnen des Widgets",
      documentationComingSoon: "Dokumentation kommt bald",
    },
  },
  about: {
    title: "Über den Margenrechner",
    description:
      "Der Margenrechner ist eine Hilfsanwendung für Bitrix24, mit der Sie schnell die Rentabilität eines Produkts (Marge) unter Berücksichtigung von Einkaufspreis, Transport, Verpackung und Wechselkursen bewerten können. WICHTIG: Die Anwendung ändert nicht den Deal-Betrag, sondern trägt Produktpreisinformationen in zusätzliche Felder ein.",

    faq: {
      item1: {
        question:
          "Wo werden Wechselkurse festgelegt und wie werden sie verwendet?",
        answer:
          "Im oberen Bereich der Benutzeroberfläche befinden sich Felder für Wechselkurse (z. B. USD/PLN, EUR/PLN, EUR/USD). Diese Werte werden verwendet, um alle Beträge in die Währung umzurechnen, in der der Verkaufspreis festgelegt ist. Ändern Sie den Kurs - die Berechnung wird automatisch aktualisiert.",
      },
      item2: {
        question: "Wie wird die Marge berechnet (Formel)?",
        answer:
          "Alle eingehenden Ausgaben (Einkauf, Transport, Verpackung usw.) werden gemäß den angegebenen Kursen in die Verkaufspreiswährung umgerechnet. Dann wird die Formel angewendet: Gesamtumsatz = Verkaufspreis × Menge; Gesamtausgaben = (Einkaufspreis × Menge) + Transport + Verpackung + Sonstige_Ausgaben; Marge = Gesamtumsatz − Gesamtausgaben; Marge % = (Marge / Gesamtumsatz) × 100%",
      },
      item3: {
        question: "Was bedeutet die Schaltfläche 'Speichern'?",
        answer:
          "Die Schaltfläche speichert die aktuelle Berechnung in der Anwendung (in der eigenen Datenbank der Anwendung) zur weiteren Ansicht/Analyse. Das Speichern ändert nicht den Bitrix24-Deal-Betrag, sondern nimmt Änderungen an zusätzlichen Feldern für Preisinformationen vor.",
      },
      item4: {
        question:
          "Wie funktioniert das automatische Abrufen des Einkaufspreises bei Auswahl eines Lieferanten?",
        answer:
          "Bei Auswahl eines Lieferanten durchsucht die Anwendung ihre Datenbank nach dem Preis dieses Lieferanten für das ausgewählte Produkt und fügt automatisch den Einkaufspreis + Währung ein. Wenn es keine Preise für die Kombination 'Lieferant-Produkt' gibt, bleibt das Feld leer und Sie müssen den Preis manuell eingeben.",
      },
      item5: {
        question: "Kann ich die Tabellenansicht und den Spaltensatz anpassen?",
        answer:
          "Ja. Die Benutzeroberfläche enthält Anzeigemodi (Tabelle, Karten, Akkordeon) und eine Schaltfläche 'Einstellungen' zur Konfiguration sichtbarer Spalten. Verwenden Sie diese Schaltflächen, um die erforderlichen Felder ein-/auszublenden.",
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
    subtitle: "Verwalten Sie Ihre Anwendungslizenz",
    currentLicense: "Aktuelle Lizenz",
    terms: "Geschäftsbedingungen",
    status: "Status",
    type: "Lizenztyp",
    validFrom: "Gültig von",
    validUntil: "Gültig bis",
    domain: "Lizenzierte Domain",
    users: "Anzahl der Benutzer",
    active: "Aktiv",
    expired: "Abgelaufen",
    expiringSoon: "Läuft bald ab",
    checking: "Überprüfung...",
    checkLicense: "Lizenz überprüfen",
    activateLicense: "Lizenz aktivieren",
    licenseKey: "Lizenzschlüssel",
    enterLicenseKey: "Geben Sie Ihren Lizenzschlüssel ein",
    activationNote: "Die Lizenz wird an die aktuelle Domain gebunden",
    checkSuccess: "Lizenz erfolgreich überprüft",
    checkError: "Fehler bei der Lizenzüberprüfung",
    keyRequired: "Bitte geben Sie einen Lizenzschlüssel ein",
    activationSuccess: "Lizenz erfolgreich aktiviert",
    activationError: "Fehler bei der Lizenzaktivierung",
    termsTitle: "Lizenzbedingungen",
    termsContent:
      "<p>Durch die Nutzung dieser Software stimmen Sie den folgenden Bedingungen zu...</p>",
  },
  pricing: {
    currencyInfo: "Währungsinformationen",
    product: "Produkt",
    productName: "Produktname",
    quantity: "Menge",
    salePrice: "Verkaufspreis",
    purchasePrice: "Einkaufspreis",
    transportCost: "Transportkosten",
    packagingCost: "Verpackungskosten",
    action: "Aktion",
    addProduct: "Produkt hinzufügen",
    totalAmount: "Gesamtbetrag",
    totalMargin: "Gesamtmarge",
    save: "Speichern",
    marginCalculation: "Margenberechnung",
    unnamed: "Unbenanntes Produkt",
    packaging: "Verpackung",
    marginPercent: "Marge %",
    margin: "Marge",
    saveSuccess: "Kalkulation erfolgreich gespeichert",
  },
};
