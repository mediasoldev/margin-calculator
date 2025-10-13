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
      "To jest przykładowy tekst do podglądu Twoich wyborów kolorów. Możesz zobaczyć, jak kolor główny i kolor tekstu współpracują ze sobą.",
    sampleButton: "Główna akcja",
    sampleButtonSecondary: "Druga akcja",
    reset: "Przywróć domyślne",
    saveSuccess: "Ustawienia zapisane pomyślnie",
    saveError: "Nie udało się zapisać ustawień",
    resetSuccess: "Ustawienia przywrócone do domyślnych",
  },

  home: {
    title: "Kalkulator Marży dla Bitrix24",
    description:
      "Szybko oceń rentowność produktu z uwzględnieniem ceny zakupu, transportu, opakowania i kursów walut",

    importantNotice: "Ważne",
    noticeDescription: "Aplikacja nie zmienia kwoty transakcji, ale wprowadza informacje o cenach produktu do dodatkowych pól",

    whereToFind: {
      title: "Gdzie znaleźć widżet",
      step1: "Otwórz dowolną transakcję w Bitrix24 CRM",
      step2: "Poszukaj zakładki lub widżetu 'Kalkulator Marży' w karcie transakcji",
      step3: "Kliknij, aby otworzyć i rozpocząć obliczanie marż",
    },

    keyFeatures: {
      title: "Kluczowe funkcje",
      currencies: "Wiele walut",
      currenciesDesc: "Obsługa PLN, USD, EUR z automatyczną konwersją",
      margin: "Obliczanie marży",
      marginDesc: "Automatyczne obliczanie z uwzględnieniem wszystkich kosztów",
      suppliers: "Ceny dostawców",
      suppliersDesc: "Automatyczne uzupełnianie cen zakupu z bazy dostawców",
      flexible: "Elastyczny widok",
      flexibleDesc: "Konfigurowalny widok tabeli, kart lub akordeonu",
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
        question: "Jak działa automatyczne pobieranie ceny zakupu przy wyborze dostawcy?",
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
    subtitle: "Informacje o licencji aplikacji",
    licenseKey: "Klucz licencyjny",
    validUntil: "Ważna do",
    expiresIn: "Wygasa za",
    days: "dni",
    today: "Dziś",
    expired: "Wygasła",
    trial: "Wersja próbna",
    licensedTo: "Licencjonowana dla",
    maxUsers: "Maksymalna liczba użytkowników",
    unlimited: "Nieograniczona",
    noLicense: "Brak klucza licencyjnego",
    purchaseContactTitle: "Aby zakupić klucz licencyjny, skontaktuj się z nami w dowolny wygodny sposób:",
    website: "Strona internetowa",
    phone: "Telefon",
    email: "E-mail",
    onlineChat: "Chat online",
    checkError: "Błąd sprawdzania licencji",
  },

  pricing: {
    currencyInfo: "Informacje o walucie",
    product: "Produkt",
    productName: "Nazwa produktu",
    quantity: "Ilość",
    salePrice: "Cena sprzedaży",
    purchasePrice: "Cena zakupu",
    transportCost: "Koszt transportu",
    packagingCost: "Koszt opakowania",
    action: "Akcja",
    addProduct: "Dodaj produkt",
    totalAmount: "Całkowita kwota",
    totalMargin: "Całkowita marża",
    save: "Zapisz",
    marginCalculation: "Obliczanie marży",
    unnamed: "Produkt bez nazwy",
    packaging: "Opakowanie",
    marginPercent: "Marża %",
    margin: "Marża",
    saveSuccess: "Obliczenie zapisane pomyślnie",
  },
};