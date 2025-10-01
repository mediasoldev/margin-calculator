// frontend/src/locales/pl/index.ts

export default {
  app: {
    name: "Aplikacja Bitrix24",
    welcome: "Witamy",
    loading: "Ładowanie...",
  },
  menu: {
    home: "Strona główna",
    settings: "Ustawienia",
    license: "Licencja",
    about: "O aplikacji",
  },
  settings: {
    title: "Ustawienia",
    theme: "Motyw",
    language: "Język",
    light: "Jasny",
    dark: "Ciemny",
    auto: "Automatyczny",
    save: "Zapisz",
    saved: "Ustawienia zapisane",
    primaryColor: "Kolor główny",
    textColor: "Kolor tekstu",
    textColorHint:
      "Dostosuj kolor tekstu dla lepszego kontrastu z jasnym tłem",
    compactMode: "Tryb kompaktowy",
    compactModeOn: "Włączony - Zmniejszone odstępy",
    compactModeOff: "Wyłączony - Normalne odstępy",
    animations: "Animacje",
    animationsOn: "Włączone - Płynne przejścia",
    animationsOff: "Wyłączone - Natychmiastowe zmiany",
    preview: "Podgląd motywu",
    livePreview: "Podgląd na żywo",
    sampleTitle: "Przykładowy tytuł",
    sampleText:
      "To jest przykładowy tekst do podglądu wybranych kolorów. Możesz zobaczyć, jak kolor główny i kolor tekstu współpracują ze sobą.",
    sampleButton: "Akcja główna",
    sampleButtonSecondary: "Akcja dodatkowa",
    reset: "Przywróć domyślne",
    saveSuccess: "Ustawienia zapisane pomyślnie",
    saveError: "Nie udało się zapisać ustawień",
    resetSuccess: "Ustawienia przywrócone do domyślnych",
  },
  home: {
    title: "Kalkulator cen dla Bitrix24",
    description:
      "Profesjonalne narzędzie do obliczania cen produktów, marż i zarządzania kosztami dostawców bezpośrednio w transakcjach Bitrix24",

    features: {
      priceCalc: "Obliczanie cen",
      priceCalcDesc: "Automatyczne obliczanie marży",
      currency: "Wielowalutowość",
      currencyDesc: "Wsparcie dla PLN, USD, EUR",
      suppliers: "Dostawcy",
      suppliersDesc: "Zarządzanie cenami dostawców",
      integration: "Integracja",
      integrationDesc: "Pełna integracja z Bitrix24",
    },

    howToUse: {
      title: "Jak używać",
      step1: {
        title: "Skonfiguruj ustawienia",
        description:
          "Ustaw kursy walut i preferencje kolumn w sekcji Ustawienia",
      },
      step2: {
        title: "Otwórz transakcję w Bitrix24",
        description: "Przejdź do dowolnej transakcji w Twoim CRM Bitrix24",
        note: "Widget będzie dostępny w karcie transakcji",
      },
      step3: {
        title: "Użyj widgetu kalkulatora",
        description:
          "Kliknij widget Kalkulator cen w transakcji, aby obliczyć ceny i marże dla produktów",
      },
      step4: {
        title: "Zapisz do transakcji",
        description:
          "Obliczone dane są automatycznie zapisywane w transakcji ze wszystkimi szczegółami cenowymi",
      },
    },

    info: {
      whereToFind: {
        title: "Gdzie znaleźć widget",
        message:
          "Kalkulator cen pojawia się jako osadzony widget wewnątrz transakcji Bitrix24",
        step1: "Otwórz dowolną transakcję w CRM Bitrix24",
        step2: 'Szukaj zakładki lub widgetu "Kalkulator cen"',
        step3: "Kliknij, aby otworzyć interfejs kalkulatora",
      },
      features: {
        title: "Kluczowe funkcje",
        item1: "Konwersja walut w czasie rzeczywistym",
        item2: "Ceny specyficzne dla dostawców",
        item3: "Śledzenie kosztów transportu i pakowania",
        item4: "Automatyczne obliczanie marży",
      },
    },

    quickActions: {
      title: "Szybkie akcje",
      settings: "Skonfiguruj ustawienia",
      testWidget: "Testuj widget",
      documentation: "Zobacz dokumentację",
    },

    status: {
      title: "Status systemu",
      appVersion: "Wersja aplikacji",
      bitrixConnection: "Połączenie z Bitrix24",
      connected: "Połączono",
      disconnected: "Rozłączono",
      user: "Bieżący użytkownik",
      domain: "Domena",
      language: "Język",
      lastSync: "Ostatnia synchronizacja",
    },

    messages: {
      widgetOpened: "Widget otwarty w nowym oknie",
      widgetError: "Błąd podczas otwierania widgetu",
      documentationComingSoon: "Dokumentacja wkrótce",
    },
  },
  about: {
    title: "O Kalkulatorze cen",
    description:
      "Profesjonalny widget dla Bitrix24, który pozwala obliczać ceny produktów, marże i zarządzać kosztami bezpośrednio w Twoich transakcjach",

    faq: {
      item1: {
        question: "Jak działa kalkulator cen?",
        answer:
          "Kalkulator automatycznie pobiera produkty z Twojej transakcji Bitrix24, pozwala ustawić ceny zakupu, koszty transportu i pakowania, a następnie oblicza marże i sumy z obsługą wielu walut.",
      },
      item2: {
        question: "Gdzie mogę znaleźć widget?",
        answer:
          "Widget pojawia się wewnątrz każdej transakcji w CRM Bitrix24. Otwórz dowolną transakcję i szukaj zakładki lub panelu widgetu Kalkulator cen.",
      },
      item3: {
        question: "Czy mogę zapisywać ceny specyficzne dla dostawców?",
        answer:
          "Tak, możesz powiązać konkretne ceny z różnymi dostawcami dla każdego produktu. Te ceny są zapisywane i automatycznie ładowane po wybraniu dostawcy.",
      },
      item4: {
        question: "Jakie waluty są obsługiwane?",
        answer:
          "Kalkulator obsługuje PLN, USD i EUR z konwersją w czasie rzeczywistym opartą na kursach walut, które konfigurujesz.",
      },
      item5: {
        question: "Jak dane są zapisywane?",
        answer:
          "Wszystkie obliczenia są zapisywane bezpośrednio w transakcji Bitrix24. Dane zawierają wszystkie szczegóły cenowe, marże i informacje o dostawcach.",
      },
      item6: {
        question: "Czy mogę dostosować wyświetlane pola?",
        answer:
          "Tak, możesz skonfigurować, które kolumny pojawiają się w kalkulatorze poprzez ustawienia kolumn. Niektóre pola są wymagane i nie mogą być ukryte.",
      },
    },

    info: {
      title: "Informacje o aplikacji",
      version: "Wersja",
      lastUpdate: "Ostatnia aktualizacja",
      developer: "Deweloper",
      developerName: "Twoja firma",
      support: "Wsparcie",
    },
  },
  common: {
    yes: "Tak",
    no: "Nie",
    ok: "OK",
    cancel: "Anuluj",
    close: "Zamknij",
    error: "Błąd",
    success: "Sukces",
  },
  license: {
    title: "Licencja",
    subtitle: "Zarządzaj licencją aplikacji",
    currentLicense: "Bieżąca licencja",
    terms: "Warunki i postanowienia",
    status: "Status",
    type: "Typ licencji",
    validFrom: "Ważna od",
    validUntil: "Ważna do",
    domain: "Licencjonowana domena",
    users: "Liczba użytkowników",
    active: "Aktywna",
    expired: "Wygasła",
    expiringSoon: "Wkrótce wygasa",
    checking: "Sprawdzanie...",
    checkLicense: "Sprawdź licencję",
    activateLicense: "Aktywuj licencję",
    licenseKey: "Klucz licencji",
    enterLicenseKey: "Wprowadź swój klucz licencji",
    activationNote: "Licencja zostanie powiązana z bieżącą domeną",
    checkSuccess: "Licencja pomyślnie zweryfikowana",
    checkError: "Błąd podczas sprawdzania licencji",
    keyRequired: "Proszę wprowadzić klucz licencji",
    activationSuccess: "Licencja pomyślnie aktywowana",
    activationError: "Błąd podczas aktywacji licencji",
    termsTitle: "Warunki i postanowienia licencji",
    termsContent:
      "<p>Korzystając z tego oprogramowania, zgadzasz się na następujące warunki...</p>",
  },
  pricing: {
    currencyInfo: "Informacje o walucie",
    product: "Produkt",
    productName: "Nazwa produktu",
    quantity: "Ilość",
    salePrice: "Cena sprzedaży",
    purchasePrice: "Cena zakupu",
    transportCost: "Koszt transportu",
    packagingCost: "Koszt pakowania",
    action: "Akcja",
    addProduct: "Dodaj produkt",
    totalAmount: "Suma całkowita",
    totalMargin: "Marża całkowita",
    save: "Zapisz",
    marginCalculation: "Obliczanie marży",
    unnamed: "Produkt bez nazwy",
    packaging: "Pakowanie",
    marginPercent: "Marża %",
    margin: "Marża",
    saveSuccess: "Obliczenia zapisane pomyślnie",
  },
};