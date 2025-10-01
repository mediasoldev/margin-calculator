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
      "Ceci est un texte d'exemple pour prévisualiser vos choix de couleurs. Vous pouvez voir comment la couleur principale et la couleur du texte fonctionnent ensemble.",
    sampleButton: "Action principale",
    sampleButtonSecondary: "Action secondaire",
    reset: "Réinitialiser par défaut",
    saveSuccess: "Paramètres enregistrés avec succès",
    saveError: "Échec de l'enregistrement des paramètres",
    resetSuccess: "Paramètres réinitialisés par défaut",
  },
  home: {
    title: "Calculateur de prix pour Bitrix24",
    description:
      "Outil professionnel pour calculer les prix des produits, les marges et gérer les coûts des fournisseurs directement dans vos affaires Bitrix24",

    features: {
      priceCalc: "Calcul des prix",
      priceCalcDesc: "Calcul automatique des marges",
      currency: "Multi-devises",
      currencyDesc: "Support pour PLN, USD, EUR",
      suppliers: "Fournisseurs",
      suppliersDesc: "Gestion des prix fournisseurs",
      integration: "Intégration",
      integrationDesc: "Intégration complète avec Bitrix24",
    },

    howToUse: {
      title: "Comment utiliser",
      step1: {
        title: "Configurer les paramètres",
        description:
          "Configurez les taux de change et les préférences de colonnes dans la section Paramètres",
      },
      step2: {
        title: "Ouvrir une affaire dans Bitrix24",
        description: "Naviguez vers n'importe quelle affaire dans votre CRM Bitrix24",
        note: "Le widget sera disponible dans la fiche de l'affaire",
      },
      step3: {
        title: "Utiliser le widget calculateur",
        description:
          "Cliquez sur le widget Calculateur de prix dans l'affaire pour calculer les prix et les marges des produits",
      },
      step4: {
        title: "Enregistrer dans l'affaire",
        description:
          "Les données calculées sont automatiquement enregistrées dans l'affaire avec tous les détails de tarification",
      },
    },

    info: {
      whereToFind: {
        title: "Où trouver le widget",
        message:
          "Le calculateur de prix apparaît comme un widget intégré dans les affaires Bitrix24",
        step1: "Ouvrez n'importe quelle affaire dans le CRM Bitrix24",
        step2: 'Cherchez l\'onglet ou le widget "Calculateur de prix"',
        step3: "Cliquez pour ouvrir l'interface du calculateur",
      },
      features: {
        title: "Fonctionnalités principales",
        item1: "Conversion de devises en temps réel",
        item2: "Prix spécifiques aux fournisseurs",
        item3: "Suivi des coûts de transport et d'emballage",
        item4: "Calcul automatique des marges",
      },
    },

    quickActions: {
      title: "Actions rapides",
      settings: "Configurer les paramètres",
      testWidget: "Tester le widget",
      documentation: "Voir la documentation",
    },

    status: {
      title: "État du système",
      appVersion: "Version de l'application",
      bitrixConnection: "Connexion Bitrix24",
      connected: "Connecté",
      disconnected: "Déconnecté",
      user: "Utilisateur actuel",
      domain: "Domaine",
      language: "Langue",
      lastSync: "Dernière synchronisation",
    },

    messages: {
      widgetOpened: "Widget ouvert dans une nouvelle fenêtre",
      widgetError: "Erreur lors de l'ouverture du widget",
      documentationComingSoon: "Documentation à venir",
    },
  },
  about: {
    title: "À propos du Calculateur de prix",
    description:
      "Un widget professionnel pour Bitrix24 qui vous permet de calculer les prix des produits, les marges et de gérer les coûts directement dans vos affaires",

    faq: {
      item1: {
        question: "Comment fonctionne le calculateur de prix ?",
        answer:
          "Le calculateur récupère automatiquement les produits de votre affaire Bitrix24, vous permet de définir les prix d'achat, les coûts de transport et d'emballage, puis calcule les marges et les totaux avec support multi-devises.",
      },
      item2: {
        question: "Où puis-je trouver le widget ?",
        answer:
          "Le widget apparaît dans chaque affaire du CRM Bitrix24. Ouvrez n'importe quelle affaire et cherchez l'onglet ou le panneau du widget Calculateur de prix.",
      },
      item3: {
        question: "Puis-je enregistrer des prix spécifiques aux fournisseurs ?",
        answer:
          "Oui, vous pouvez associer des prix spécifiques à différents fournisseurs pour chaque produit. Ces prix sont enregistrés et automatiquement chargés lorsque vous sélectionnez un fournisseur.",
      },
      item4: {
        question: "Quelles devises sont supportées ?",
        answer:
          "Le calculateur supporte PLN, USD et EUR avec conversion en temps réel basée sur les taux de change que vous configurez.",
      },
      item5: {
        question: "Comment les données sont-elles enregistrées ?",
        answer:
          "Tous les calculs sont enregistrés directement dans l'affaire Bitrix24. Les données incluent tous les détails de tarification, les marges et les informations sur les fournisseurs.",
      },
      item6: {
        question: "Puis-je personnaliser les champs affichés ?",
        answer:
          "Oui, vous pouvez configurer quelles colonnes apparaissent dans le calculateur via les paramètres de colonnes. Certains champs sont obligatoires et ne peuvent pas être masqués.",
      },
    },

    info: {
      title: "Informations sur l'application",
      version: "Version",
      lastUpdate: "Dernière mise à jour",
      developer: "Développeur",
      developerName: "Votre entreprise",
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
    subtitle: "Gérer votre licence d'application",
    currentLicense: "Licence actuelle",
    terms: "Termes et conditions",
    status: "Statut",
    type: "Type de licence",
    validFrom: "Valide depuis",
    validUntil: "Valide jusqu'à",
    domain: "Domaine sous licence",
    users: "Nombre d'utilisateurs",
    active: "Active",
    expired: "Expirée",
    expiringSoon: "Expire bientôt",
    checking: "Vérification...",
    checkLicense: "Vérifier la licence",
    activateLicense: "Activer la licence",
    licenseKey: "Clé de licence",
    enterLicenseKey: "Entrez votre clé de licence",
    activationNote: "La licence sera liée au domaine actuel",
    checkSuccess: "Licence vérifiée avec succès",
    checkError: "Erreur lors de la vérification de la licence",
    keyRequired: "Veuillez entrer une clé de licence",
    activationSuccess: "Licence activée avec succès",
    activationError: "Erreur lors de l'activation de la licence",
    termsTitle: "Termes et conditions de la licence",
    termsContent:
      "<p>En utilisant ce logiciel, vous acceptez les conditions suivantes...</p>",
  },
  pricing: {
    currencyInfo: "Information sur la devise",
    product: "Produit",
    productName: "Nom du produit",
    quantity: "Quantité",
    salePrice: "Prix de vente",
    purchasePrice: "Prix d'achat",
    transportCost: "Coût de transport",
    packagingCost: "Coût d'emballage",
    action: "Action",
    addProduct: "Ajouter un produit",
    totalAmount: "Montant total",
    totalMargin: "Marge totale",
    save: "Enregistrer",
    marginCalculation: "Calcul de marge",
    unnamed: "Produit sans nom",
    packaging: "Emballage",
    marginPercent: "Marge %",
    margin: "Marge",
    saveSuccess: "Calcul enregistré avec succès",
  },
};