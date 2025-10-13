// frontend/src/locales/de/index.ts

export default {
  app: {
    name: "Bitrix24-Anwendung",
    welcome: "Willkommen",
    loading: "Wird geladen...",
  },
  menu: {
    home: "Startseite",
    settings: "Einstellungen",
    license: "Lizenz",
    about: "Über",
  },
  settings: {
    title: "Einstellungen",
    theme: "Design",
    language: "Sprache",
    light: "Hell",
    dark: "Dunkel",
    auto: "Automatisch",
    save: "Speichern",
    saved: "Einstellungen gespeichert",
    primaryColor: "Primärfarbe",
    textColor: "Textfarbe",
    textColorHint:
      "Textfarbe für besseren Kontrast mit hellen Hintergründen anpassen",
    compactMode: "Kompaktmodus",
    compactModeOn: "Aktiviert - Reduzierte Abstände",
    compactModeOff: "Deaktiviert - Normale Abstände",
    animations: "Animationen",
    animationsOn: "Aktiviert - Sanfte Übergänge",
    animationsOff: "Deaktiviert - Sofortige Änderungen",
    preview: "Design-Vorschau",
    livePreview: "Live-Vorschau",
    sampleTitle: "Beispieltitel",
    sampleText:
      "Dies ist ein Beispieltext zur Vorschau Ihrer Farbauswahl. Sie können sehen, wie die Primärfarbe und die Textfarbe zusammenarbeiten.",
    sampleButton: "Hauptaktion",
    sampleButtonSecondary: "Zweite Aktion",
    reset: "Auf Standard zurücksetzen",
    saveSuccess: "Einstellungen erfolgreich gespeichert",
    saveError: "Einstellungen konnten nicht gespeichert werden",
    resetSuccess: "Einstellungen auf Standard zurückgesetzt",
  },

  home: {
    title: "Margenrechner für Bitrix24",
    description:
      "Bewerten Sie schnell die Produktrentabilität unter Berücksichtigung von Einkaufspreis, Transport, Verpackung und Wechselkursen",

    importantNotice: "Wichtig",
    noticeDescription: "Die Anwendung ändert nicht den Deal-Betrag, sondern trägt Produktpreisinformationen in zusätzliche Felder ein",

    whereToFind: {
      title: "Wo das Widget zu finden ist",
      step1: "Öffnen Sie einen beliebigen Deal in Bitrix24 CRM",
      step2: "Suchen Sie nach dem Tab oder Widget 'Margenrechner' in der Deal-Karte",
      step3: "Klicken Sie zum Öffnen und Berechnen von Margen",
    },

    keyFeatures: {
      title: "Hauptfunktionen",
      currencies: "Mehrwährung",
      currenciesDesc: "Unterstützung für PLN, USD, EUR mit automatischer Konvertierung",
      margin: "Margenberechnung",
      marginDesc: "Automatische Berechnung mit allen Kosten",
      suppliers: "Lieferantenpreise",
      suppliersDesc: "Automatisches Ausfüllen von Einkaufspreisen aus der Lieferantendatenbank",
      flexible: "Flexible Anzeige",
      flexibleDesc: "Anpassbare Tabellen-, Karten- oder Akkordeonansicht",
    },
  },

  about: {
    title: "Über den Margenrechner",
    description:
      "Der Margenrechner ist eine Hilfsanwendung für Bitrix24, mit der Sie schnell die Rentabilität eines Produkts (Marge) unter Berücksichtigung von Einkaufspreis, Transport, Verpackung und Wechselkursen bewerten können. WICHTIG: Die Anwendung ändert nicht den Deal-Betrag, sondern trägt Produktpreisinformationen in zusätzliche Felder ein.",

    faq: {
      item1: {
        question: "Wo werden Wechselkurse festgelegt und wie werden sie verwendet?",
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
        question: "Wie funktioniert das automatische Abrufen des Einkaufspreises bei Auswahl eines Lieferanten?",
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
    purchaseContactTitle: "Um einen Lizenzschlüssel zu kaufen, kontaktieren Sie uns auf beliebige Weise:",
    website: "Webseite",
    phone: "Telefon",
    email: "E-Mail",
    onlineChat: "Online-Chat",
    checkError: "Fehler bei der Lizenzprüfung",
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
    saveSuccess: "Berechnung erfolgreich gespeichert",
  },
};