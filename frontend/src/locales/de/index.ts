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
        description: "Navigieren Sie zu einem beliebigen Deal in Ihrem Bitrix24 CRM",
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
        step2: 'Suchen Sie nach der Registerkarte oder dem Widget "Preiskalkulator"',
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
    title: "Über den Preiskalkulator",
    description:
      "Ein professionelles Widget für Bitrix24, mit dem Sie Produktpreise, Margen berechnen und Kosten direkt in Ihren Deals verwalten können",

    faq: {
      item1: {
        question: "Wie funktioniert der Preiskalkulator?",
        answer:
          "Der Kalkulator ruft automatisch Produkte aus Ihrem Bitrix24 Deal ab, ermöglicht es Ihnen, Einkaufspreise, Transport- und Verpackungskosten festzulegen und berechnet dann Margen und Summen mit Unterstützung mehrerer Währungen.",
      },
      item2: {
        question: "Wo finde ich das Widget?",
        answer:
          "Das Widget erscheint in jedem Deal im Bitrix24 CRM. Öffnen Sie einen beliebigen Deal und suchen Sie nach der Registerkarte oder dem Widget-Panel Preiskalkulator.",
      },
      item3: {
        question: "Kann ich lieferantenspezifische Preise speichern?",
        answer:
          "Ja, Sie können für jedes Produkt spezifische Preise mit verschiedenen Lieferanten verknüpfen. Diese Preise werden gespeichert und automatisch geladen, wenn Sie einen Lieferanten auswählen.",
      },
      item4: {
        question: "Welche Währungen werden unterstützt?",
        answer:
          "Der Kalkulator unterstützt PLN, USD und EUR mit Echtzeit-Umrechnung basierend auf von Ihnen konfigurierten Wechselkursen.",
      },
      item5: {
        question: "Wie werden die Daten gespeichert?",
        answer:
          "Alle Berechnungen werden direkt im Bitrix24 Deal gespeichert. Die Daten umfassen alle Preisdetails, Margen und Lieferanteninformationen.",
      },
      item6: {
        question: "Kann ich anpassen, welche Felder angezeigt werden?",
        answer:
          "Ja, Sie können über die Spalteneinstellungen konfigurieren, welche Spalten im Kalkulator erscheinen. Einige Felder sind erforderlich und können nicht ausgeblendet werden.",
      },
    },

    info: {
      title: "Anwendungsinformationen",
      version: "Version",
      lastUpdate: "Letztes Update",
      developer: "Entwickler",
      developerName: "Ihre Firma",
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