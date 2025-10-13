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
    textColorHint: "Dostosuj kolor tekstu dla lepszego kontrastu z jasnym tłem",
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
    title: "O Kalkulatorze Marży",
    description:
      "Kalkulator Marży to aplikacja pomocnicza dla Bitrix24, która pozwala szybko ocenić rentowność produktu (marżę) z uwzględnieniem ceny zakupu, transportu, opakowania i kursów walut. WAŻNE: aplikacja nie zmienia kwoty transakcji, ale wprowadza informacje o cenach produktu do dodatkowych pól.",

    faq: {
      item1: {
        question: "Gdzie ustawić kursy walut i jak są wykorzystywane?",
        answer:
          "W górnej części interfejsu znajdują się pola dla kursów walut (na przykład USD/PLN, EUR/PLN, EUR/USD). Te wartości są wykorzystywane do konwersji wszystkich kwot na walutę, w której ustalona jest cena sprzedaży. Zmień kurs - obliczenie zostanie automatycznie zaktualizowane.",
      },
      item2: {
        question: "Jak obliczana jest marża (formuła)?",
        answer:
          "Wszystkie koszty (zakup, transport, opakowanie itp.) są przeliczane na walutę ceny sprzedaży według określonych kursów. Następnie stosowana jest formuła: Całkowity Przychód = Cena_Sprzedaży × Ilość; Całkowite Koszty = (Cena_Zakupu × Ilość) + Transport + Opakowanie + Inne_Koszty; Marża = Całkowity Przychód − Całkowite Koszty; % Marży = (Marża / Całkowity Przychód) × 100%",
      },
      item3: {
        question: "Co oznacza przycisk 'Zapisz'?",
        answer:
          "Przycisk zapisuje bieżące obliczenie wewnątrz aplikacji (we własnej bazie danych aplikacji) do dalszego przeglądania/analizy. Zapisanie nie zmienia kwoty transakcji Bitrix24, ale wprowadza zmiany do dodatkowych pól z informacjami o cenach.",
      },
      item4: {
        question:
          "Jak działa automatyczne pobieranie ceny zakupu przy wyborze dostawcy?",
        answer:
          "Przy wyborze dostawcy aplikacja przeszukuje swoją bazę danych w poszukiwaniu ceny tego dostawcy dla wybranego produktu i automatycznie wstawia cenę zakupu + walutę. Jeśli nie ma cen dla kombinacji 'dostawca-produkt', pole pozostaje puste i musisz wprowadzić cenę ręcznie.",
      },
      item5: {
        question: "Czy mogę dostosować widok tabeli i zestaw kolumn?",
        answer:
          "Tak. Interfejs zawiera tryby wyświetlania (tabela, karty, akordeon) oraz przycisk 'Ustawienia' do konfiguracji widocznych kolumn. Użyj tych przycisków, aby ukryć/pokazać wymagane pola.",
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
