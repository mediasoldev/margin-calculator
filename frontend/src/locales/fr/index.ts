// frontend/src/locales/fr/index.ts

export default {
  app: {
    name: "Application Bitrix24",
    welcome: "Bienvenue",
    loading: "Chargement...",
  },
  menu: {
    home: "Accueil",
    settings: "Paramètres",
    license: "Licence",
    about: "À propos",
  },
  settings: {
    title: "Paramètres",
    theme: "Thème",
    language: "Langue",
    light: "Clair",
    dark: "Sombre",
    auto: "Automatique",
    save: "Enregistrer",
    saved: "Paramètres enregistrés",
    primaryColor: "Couleur principale",
    textColor: "Couleur du texte",
    textColorHint:
      "Ajustez la couleur du texte pour un meilleur contraste avec les arrière-plans clairs",
    compactMode: "Mode compact",
    compactModeOn: "Activé - Espacement réduit",
    compactModeOff: "Désactivé - Espacement normal",
    animations: "Animations",
    animationsOn: "Activées - Transitions fluides",
    animationsOff: "Désactivées - Changements instantanés",
    preview: "Aperçu du thème",
    livePreview: "Aperçu en direct",
    sampleTitle: "Titre d'exemple",
    sampleText:
      "Ceci est un exemple de texte pour prévisualiser vos choix de couleurs. Vous pouvez voir comment la couleur principale et la couleur du texte fonctionnent ensemble.",
    sampleButton: "Action principale",
    sampleButtonSecondary: "Action secondaire",
    reset: "Réinitialiser aux valeurs par défaut",
    saveSuccess: "Paramètres enregistrés avec succès",
    saveError: "Échec de l'enregistrement des paramètres",
    resetSuccess: "Paramètres réinitialisés aux valeurs par défaut",
  },

  home: {
    title: "Calculate in Deal",
    description:
      "Évaluez rapidement la rentabilité des produits en tenant compte du prix d'achat, du transport, de l'emballage et des taux de change",

    importantNotice: "Important",
    noticeDescription:
      "L'application ne modifie pas le montant de l'affaire, mais saisit les informations de tarification des produits dans des champs supplémentaires",

    whereToFind: {
      title: "Où trouver le widget",
      step1: "Ouvrez n'importe quelle affaire dans le CRM Bitrix24",
      step2: "Recherchez l'onglet ou le widget 'Calculateur de marge' dans la fiche d'affaire",
      step3: "Cliquez pour ouvrir et commencer à calculer les marges",
    },

    keyFeatures: {
      title: "Fonctionnalités clés",
      currencies: "Multi-devises",
      currenciesDesc: "Support pour PLN, USD, EUR avec conversion automatique",
      margin: "Calcul de marge",
      marginDesc: "Calcul automatique avec tous les coûts inclus",
      suppliers: "Prix des fournisseurs",
      suppliersDesc: "Remplissage automatique des prix d'achat depuis la base de fournisseurs",
      flexible: "Affichage flexible",
      flexibleDesc: "Tableau personnalisable, cartes ou vue accordéon",
    },
  },

  about: {
    title: "À propos du calculateur de marge",
    description:
      "Le calculateur de marge est une application de support pour Bitrix24 qui vous permet d'évaluer rapidement la rentabilité d'un produit (marge) en tenant compte du prix d'achat, du transport, de l'emballage et des taux de change. IMPORTANT : l'application ne modifie pas le montant de l'affaire, mais saisit les informations de tarification des produits dans des champs supplémentaires.",

    faq: {
      item1: {
        question: "Où définir les taux de change et comment sont-ils utilisés ?",
        answer:
          "En haut de l'interface se trouvent des champs pour les taux de change (par exemple, USD/PLN, EUR/PLN, EUR/USD). Ces valeurs sont utilisées pour convertir tous les montants dans la devise dans laquelle le prix de vente est défini. Modifiez le taux - le calcul sera mis à jour automatiquement.",
      },
      item2: {
        question: "Comment la marge est-elle calculée (formule) ?",
        answer:
          "Toutes les dépenses entrantes (achat, transport, emballage, etc.) sont converties dans la devise du prix de vente selon les taux spécifiés. Ensuite, la formule est appliquée : Revenu total = Prix_de_vente × Quantité ; Dépenses totales = (Prix_d'achat × Quantité) + Transport + Emballage + Autres_dépenses ; Marge = Revenu_total − Dépenses_totales ; Marge % = (Marge / Revenu_total) × 100%",
      },
      item3: {
        question: "Que signifie le bouton 'Enregistrer' ?",
        answer:
          "Le bouton enregistre le calcul actuel dans l'application (dans la base de données propre de l'application) pour une consultation/analyse ultérieure. L'enregistrement ne modifie pas le montant de l'affaire Bitrix24, mais apporte des modifications aux champs supplémentaires pour les informations de tarification.",
      },
      item4: {
        question:
          "Comment fonctionne la récupération automatique du prix d'achat lors de la sélection d'un fournisseur ?",
        answer:
          "Lors de la sélection d'un fournisseur, l'application recherche dans sa base de données le prix de ce fournisseur pour le produit sélectionné et insère automatiquement le prix d'achat + devise. S'il n'y a pas de prix pour la combinaison 'fournisseur-produit', le champ reste vide et vous devez saisir le prix manuellement.",
      },
      item5: {
        question: "Puis-je personnaliser la vue du tableau et l'ensemble des colonnes ?",
        answer:
          "Oui. L'interface comprend des modes d'affichage (tableau, cartes, accordéon) et un bouton 'Paramètres' pour configurer les colonnes visibles. Utilisez ces boutons pour masquer/afficher les champs requis.",
      },
    },

    info: {
      title: "Informations sur l'application",
      version: "Version",
      lastUpdate: "Dernière mise à jour",
      developer: "Développeur",
      developerName: "Votre Entreprise",
      support: "Support",
    },
  },

  common: {
    yes: "Oui",
    no: "Non",
    ok: "OK",
    cancel: "Annuler",
    close: "Fermer",
    error: "Erreur",
    success: "Succès",
  },

  license: {
    title: "Licence",
    subtitle: "Informations sur la licence de l'application",
    licenseKey: "Clé de licence",
    validUntil: "Valide jusqu'au",
    expiresIn: "Expire dans",
    days: "jours",
    today: "Aujourd'hui",
    expired: "Expiré",
    trial: "Version d'essai",
    licensedTo: "Licence pour",
    maxUsers: "Utilisateurs maximum",
    unlimited: "Illimité",
    noLicense: "Aucune clé de licence",
    purchaseContactTitle:
      "Pour acheter une clé de licence, contactez-nous de manière pratique :",
    website: "Site web",
    phone: "Téléphone",
    email: "E-mail",
    onlineChat: "Chat en ligne",
    checkError: "Erreur de vérification de la licence",
  },

  pricing: {
    // Currency section
    currencyInfo: "Informations sur la devise",
    currencyRates: "Taux de change",

    // Column names (main fields)
    product: "Produit",
    productName: "Nom du produit",
    quantity: "Quantité",
    salePrice: "Prix de vente",
    purchasePrice: "Prix d'achat",
    supplier: "Fournisseur",
    transportCost: "Coût de transport",
    packagingCost: "Coût d'emballage",
    marginPercent: "Marge %",
    marginPerUnit: "Marge (par unité)",
    marginAmount: "Marge (calculée)",
    totalMargin: "Marge totale",
    action: "Action",

    // View modes
    viewMode: "Mode d'affichage",
    tableView: "Tableau",
    cardsView: "Cartes",
    accordionView: "Accordéon",

    // Actions
    columns: "Colonnes",
    refresh: "Actualiser",
    save: "Enregistrer",
    addProduct: "Ajouter un produit",
    edit: "Modifier",
    selectSupplier: "Sélectionner un fournisseur",
    loadFromBitrix: "Charger depuis Bitrix",

    // Column settings modal
    columnSettings: "Paramètres des colonnes",
    columnSettingsInfo:
      "Faites glisser pour réorganiser les colonnes. Les colonnes obligatoires ne peuvent pas être masquées mais peuvent être réorganisées.",
    requiredColumns: "Colonnes obligatoires",
    optionalColumns: "Colonnes optionnelles",
    availableColumns: "Colonnes disponibles",
    alwaysVisible: "Toujours visible",
    required: "Obligatoire",
    readOnly: "Lecture seule",
    editableField: "Modifiable",
    optional: "Optionnel",
    productField: "Champ produit",
    resetToDefaults: "Réinitialiser aux valeurs par défaut",
    visible: "visible",
    order: "Ordre",
    show: "Afficher",
    columnName: "Nom de la colonne",
    status: "Statut",
    showAll: "Tout afficher",
    hideOptional: "Masquer les optionnelles",

    // Summary
    totalAmount: "Montant total",
    productMargin: "Marge du produit",

    // Messages
    productsLoaded: "Produits chargés avec succès",
    loadedFromBitrix: "Produits chargés depuis Bitrix24 avec succès",
    loadError: "Erreur de chargement des produits",
    priceLoadError: "Erreur de chargement du prix du fournisseur",
    saveSuccess: "Calcul enregistré avec succès",
    saveError: "Erreur d'enregistrement du calcul",

    // Comparison status messages
    savedMatchesDeal: "✓ Le calcul enregistré correspond à l'affaire actuelle",
    savedDiffersFromDeal: "⚠ Le calcul enregistré diffère de l'affaire actuelle",
    notCalculatedYet: "ℹ Calcul pas encore enregistré",

    // Supplier modal
    addSupplier: "Ajouter un fournisseur",
    editSupplier: "Modifier le fournisseur",
    company: "Entreprise",
    selectCompany: "Sélectionner une entreprise",
    currency: "Devise",
    selectCurrency: "Sélectionner une devise",
    enterPrice: "Entrer le prix",
    pleaseSelectCompany: "Veuillez sélectionner une entreprise",
    pleaseEnterValidPrice: "Veuillez entrer un prix valide",
    pleaseSelectCurrency: "Veuillez sélectionner une devise",

    // Placeholder
    cardsViewComingSoon: "Vue cartes - Prochainement",
    accordionViewComingSoon: "Vue accordéon - Prochainement",

    // Unnamed product
    unnamed: "Produit sans nom",
    packaging: "Emballage",
    marginCalculation: "Calcul de marge",

    // Dynamic ProductRow fields (from Bitrix24 API)
    ID: "ID",
    OWNER_ID: "ID du propriétaire",
    OWNER_TYPE: "Type de propriétaire",
    PRODUCT_ID: "ID du produit",
    PRICE: "Prix",
    PRICE_EXCLUSIVE: "Prix réduit hors taxe",
    PRICE_NETTO: "Prix net",
    PRICE_BRUTTO: "Prix brut",
    DISCOUNT_TYPE_ID: "Type de remise",
    DISCOUNT_RATE: "Valeur de remise",
    DISCOUNT_SUM: "Montant de remise",
    TAX_RATE: "Taxe",
    TAX_INCLUDED: "Taxe incluse",
    CUSTOMIZED: "Modifié le",
    MEASURE_CODE: "Code d'unité de mesure",
    MEASURE_NAME: "Unité de mesure",
    SORT: "Tri",
    TYPE: "Type",
    ORIGINAL_PRODUCT_NAME: "Nom original du produit",
    PRODUCT_DESCRIPTION: "Description du produit",
    PRICE_ACCOUNT: "Compte de prix",
    XML_ID: "XML ID",
    STORE_ID: "Entrepôt",
    RESERVE_ID: "ID de réservation",
    RESERVE_QUANTITY: "Quantité réservée",
    DATE_RESERVE_END: "Date de fin de réservation",
  },
};