// frontend/src/locales/pl/index.ts

export default {
  app: {
    name: "Aplikacja Bitrix24",
    welcome: "Witaj",
    loading: "Ładowanie...",
  },
  menu: {
    home: "Główna",
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
      "Dostosuj kolor tekstu dla lepszego kontrastu z jasnymi tłami",
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
    resetSuccess: "Przywrócono ustawienia domyślne",


    "------------------------": "------------------------",
    "bitrixIntegration": "Integracja Bitrix24",
    "appTheme": "Motyw aplikacji",
    "storageStatus": "Status magazynów danych",
    "productSuppliersStorage": "Magazyn dostawców produktów",
    "calculationsStorage": "Magazyn kalkulacji marży",
    "created": "Utworzony",
    "notCreated": "Nie utworzony",
    "fieldMapping": "Mapowanie pól",
    "totalMarginField": "Pole dla marży całkowitej",
    "selectField": "Wybierz pole",
    "totalMarginFieldHint": "Wybierz pole w umowie, do którego będzie zapisywana wartość marży całkowitej",
    "clearMapping": "Wyczyść mapowanie",
    "currentMapping": "Aktualne mapowanie",
    "notConfigured": "Nie skonfigurowane",
    "checkStorageError": "Błąd podczas sprawdzania magazynów",
    "loadFieldsError": "Błąd podczas ładowania pól"
  },

  home: {
    title: "Calculate in Deal",
    description:
      "Szybko oceniaj rentowność produktów uwzględniając cenę zakupu, transport, opakowanie i kursy walut",

    importantNotice: "Ważne",
    noticeDescription:
      "Aplikacja nie zmienia kwoty transakcji, ale wprowadza informacje o cenach produktów do dodatkowych pól",

    whereToFind: {
      title: "Gdzie znaleźć widget",
      step1: "Otwórz dowolną transakcję w CRM Bitrix24",
      step2: "Poszukaj zakładki lub widgetu 'Kalkulator marży' w karcie transakcji",
      step3: "Kliknij, aby otworzyć i rozpocząć obliczanie marż",
    },

    keyFeatures: {
      title: "Kluczowe funkcje",
      currencies: "Wiele walut",
      currenciesDesc: "Obsługa PLN, USD, EUR z automatyczną konwersją",
      margin: "Obliczanie marży",
      marginDesc: "Automatyczne obliczanie z uwzględnieniem wszystkich kosztów",
      suppliers: "Ceny dostawców",
      suppliersDesc: "Automatyczne wypełnianie cen zakupu z bazy dostawców",
      flexible: "Elastyczne wyświetlanie",
      flexibleDesc: "Konfigurowalna tabela, karty lub widok akordeonowy",
    },
  },

  about: {
    title: "O kalkulatorze marży",
    description:
      "Kalkulator marży to aplikacja wspomagająca dla Bitrix24, która pozwala szybko ocenić rentowność produktu (marżę) uwzględniając cenę zakupu, transport, opakowanie i kursy walut. WAŻNE: aplikacja nie zmienia kwoty transakcji, ale wprowadza informacje o cenach produktów do dodatkowych pól.",

    faq: {
      item1: {
        question: "Gdzie ustawić kursy walut i jak są wykorzystywane?",
        answer:
          "Na górze interfejsu znajdują się pola kursów walut (na przykład USD/PLN, EUR/PLN, EUR/USD). Te wartości są wykorzystywane do przeliczania wszystkich kwot na walutę, w której ustawiona jest cena sprzedaży. Zmień kurs - obliczenia zaktualizują się automatycznie.",
      },
      item2: {
        question: "Jak obliczana jest marża (formuła)?",
        answer:
          "Wszystkie koszty przychodzące (zakup, transport, opakowanie itp.) są przeliczane na walutę ceny sprzedaży zgodnie z podanymi kursami. Następnie stosowana jest formuła: Całkowity przychód = Cena_sprzedaży × Ilość; Całkowite koszty = (Cena_zakupu × Ilość) + Transport + Opakowanie + Inne_koszty; Marża = Całkowity_przychód − Całkowite_koszty; Marża % = (Marża / Całkowity_przychód) × 100%",
      },
      item3: {
        question: "Co oznacza przycisk 'Zapisz'?",
        answer:
          "Przycisk zapisuje bieżące obliczenie wewnątrz aplikacji (we własnej bazie danych aplikacji) do dalszego przeglądania/analizy. Zapisywanie nie zmienia kwoty transakcji Bitrix24, ale wprowadza zmiany do dodatkowych pól z informacjami o cenach.",
      },
      item4: {
        question:
          "Jak działa automatyczne pobieranie ceny zakupu przy wyborze dostawcy?",
        answer:
          "Przy wyborze dostawcy aplikacja przeszukuje swoją bazę danych w poszukiwaniu ceny tego dostawcy dla wybranego produktu i automatycznie wstawia cenę zakupu + walutę. Jeśli nie ma cen dla kombinacji 'dostawca-produkt', pole pozostaje puste i należy wprowadzić cenę ręcznie.",
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
      developerName: "Twoja Firma",
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
    subtitle: "Informacje o licencji aplikacji",
    licenseKey: "Klucz licencyjny",
    validUntil: "Ważna do",
    expiresIn: "Wygasa za",
    days: "dni",
    today: "Dzisiaj",
    expired: "Wygasła",
    trial: "Wersja próbna",
    licensedTo: "Licencja dla",
    maxUsers: "Maksymalna liczba użytkowników",
    unlimited: "Nieograniczona",
    noLicense: "Brak klucza licencyjnego",
    purchaseContactTitle:
      "Aby zakupić klucz licencyjny, skontaktuj się z nami w dowolny wygodny sposób:",
    website: "Strona internetowa",
    phone: "Telefon",
    email: "E-mail",
    onlineChat: "Chat online",
    checkError: "Błąd sprawdzania licencji",
  },

  pricing: {
    // Currency section
    currencyInfo: "Informacje o walucie",
    currencyRates: "Kursy walut",

    // Column names (main fields)
    product: "Produkt",
    productName: "Nazwa produktu",
    quantity: "Ilość",
    salePrice: "Cena sprzedaży",
    purchasePrice: "Cena zakupu",
    supplier: "Dostawca",
    transportCost: "Koszt transportu",
    packagingCost: "Koszt opakowania",
    marginPercent: "Marża %",
    marginPerUnit: "Marża (za sztukę)",
    marginAmount: "Marża (obliczona)",
    totalMargin: "Marża całkowita",
    action: "Akcja",

    // View modes
    viewMode: "Tryb wyświetlania",
    tableView: "Tabela",
    cardsView: "Karty",
    accordionView: "Akordeon",

    // Actions
    columns: "Kolumny",
    refresh: "Odśwież",
    save: "Zapisz",
    addProduct: "Dodaj produkt",
    edit: "Edytuj",
    selectSupplier: "Wybierz dostawcę",
    loadFromBitrix: "Wczytaj z Bitrix",

    // Column settings modal
    columnSettings: "Ustawienia kolumn",
    columnSettingsInfo:
      "Przeciągnij, aby zmienić kolejność kolumn. Wymagane kolumny nie mogą być ukryte, ale można zmienić ich kolejność.",
    requiredColumns: "Wymagane kolumny",
    optionalColumns: "Opcjonalne kolumny",
    availableColumns: "Dostępne kolumny",
    alwaysVisible: "Zawsze widoczne",
    required: "Wymagane",
    readOnly: "Tylko do odczytu",
    editableField: "Edytowalne",
    optional: "Opcjonalne",
    productField: "Pole produktu",
    resetToDefaults: "Przywróć domyślne",
    visible: "widoczne",
    order: "Kolejność",
    show: "Pokaż",
    columnName: "Nazwa kolumny",
    status: "Status",
    showAll: "Pokaż wszystkie",
    hideOptional: "Ukryj opcjonalne",

    // Summary
    totalAmount: "Kwota całkowita",
    productMargin: "Marża produktu",

    // Messages
    productsLoaded: "Produkty załadowane pomyślnie",
    loadedFromBitrix: "Produkty załadowane z Bitrix24 pomyślnie",
    loadError: "Błąd ładowania produktów",
    priceLoadError: "Błąd ładowania ceny dostawcy",
    saveSuccess: "Obliczenie zapisane pomyślnie",
    saveError: "Błąd zapisywania obliczenia",

    // Comparison status messages
    savedMatchesDeal: "✓ Zapisane obliczenie pasuje do bieżącej transakcji",
    savedDiffersFromDeal: "⚠ Zapisane obliczenie różni się od bieżącej transakcji",
    notCalculatedYet: "ℹ Obliczenie jeszcze nie zostało zapisane",

    // Supplier modal
    addSupplier: "Dodaj dostawcę",
    editSupplier: "Edytuj dostawcę",
    company: "Firma",
    selectCompany: "Wybierz firmę",
    currency: "Waluta",
    selectCurrency: "Wybierz walutę",
    enterPrice: "Wprowadź cenę",
    pleaseSelectCompany: "Proszę wybrać firmę",
    pleaseEnterValidPrice: "Proszę wprowadzić prawidłową cenę",
    pleaseSelectCurrency: "Proszę wybrać walutę",

    // Placeholder
    cardsViewComingSoon: "Widok kart - Wkrótce",
    accordionViewComingSoon: "Widok akordeonowy - Wkrótce",

    // Unnamed product
    unnamed: "Produkt bez nazwy",
    packaging: "Opakowanie",
    marginCalculation: "Obliczanie marży",

    // Dynamic ProductRow fields (from Bitrix24 API)
    ID: "ID",
    OWNER_ID: "ID właściciela",
    OWNER_TYPE: "Typ właściciela",
    PRODUCT_ID: "ID produktu",
    PRICE: "Cena",
    PRICE_EXCLUSIVE: "Cena po rabacie bez VAT",
    PRICE_NETTO: "Cena netto",
    PRICE_BRUTTO: "Cena brutto",
    DISCOUNT_TYPE_ID: "Typ rabatu",
    DISCOUNT_RATE: "Wartość rabatu",
    DISCOUNT_SUM: "Kwota rabatu",
    TAX_RATE: "Podatek",
    TAX_INCLUDED: "Podatek wliczony",
    CUSTOMIZED: "Zmodyfikowano",
    MEASURE_CODE: "Kod jednostki miary",
    MEASURE_NAME: "Jednostka miary",
    SORT: "Sortowanie",
    TYPE: "Typ",
    ORIGINAL_PRODUCT_NAME: "Oryginalna nazwa produktu",
    PRODUCT_DESCRIPTION: "Opis produktu",
    PRICE_ACCOUNT: "Konto cenowe",
    XML_ID: "XML ID",
    STORE_ID: "Magazyn",
    RESERVE_ID: "ID rezerwacji",
    RESERVE_QUANTITY: "Ilość zarezerwowana",
    DATE_RESERVE_END: "Data zakończenia rezerwacji",
  },
};