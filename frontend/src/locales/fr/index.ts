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
      "Ajustez la couleur du texte pour un meilleur contraste avec les fonds clairs",
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
    reset: "Réinitialiser par défaut",
    saveSuccess: "Paramètres enregistrés avec succès",
    saveError: "Échec de l'enregistrement des paramètres",
    resetSuccess: "Paramètres réinitialisés par défaut",
  },

  home: {
    title: "Calculateur de Marge pour Bitrix24",
    description:
      "Évaluez rapidement la rentabilité du produit en tenant compte du prix d'achat, du transport, de l'emballage et des taux de change",

    importantNotice: "Important",
    noticeDescription: "L'application ne modifie pas le montant de la transaction, mais saisit les informations de tarification du produit dans des champs supplémentaires",

    whereToFind: {
      title: "Où trouver le widget",
      step1: "Ouvrez n'importe quelle transaction dans Bitrix24 CRM",
      step2: "Recherchez l'onglet ou le widget 'Calculateur de Marge' dans la fiche de transaction",
      step3: "Cliquez pour ouvrir et commencer à calculer les marges",
    },

    keyFeatures: {
      title: "Fonctionnalités clés",
      currencies: "Multi-devises",
      currenciesDesc: "Prise en charge de PLN, USD, EUR avec conversion automatique",
      margin: "Calcul de marge",
      marginDesc: "Calcul automatique avec tous les coûts inclus",
      suppliers: "Prix des fournisseurs",
      suppliersDesc: "Remplissage automatique des prix d'achat depuis la base de fournisseurs",
      flexible: "Affichage flexible",
      flexibleDesc: "Vue tableau, cartes ou accordéon personnalisable",
    },
  },

  about: {
    title: "À propos du Calculateur de Marge",
    description:
      "Le Calculateur de Marge est une application d'assistance pour Bitrix24 qui vous permet d'évaluer rapidement la rentabilité du produit (marge) en tenant compte du prix d'achat, du transport, de l'emballage et des taux de change. IMPORTANT : l'application ne modifie pas le montant de la transaction, mais saisit les informations de tarification du produit dans des champs supplémentaires.",

    faq: {
      item1: {
        question: "Où définir les taux de change et comment sont-ils utilisés ?",
        answer:
          "En haut de l'interface, il y a des champs pour les taux de change (par exemple, USD/PLN, EUR/PLN, EUR/USD). Ces valeurs sont utilisées pour convertir tous les montants dans la devise dans laquelle le prix de vente est fixé. Modifiez le taux - le calcul sera mis à jour automatiquement.",
      },
      item2: {
        question: "Comment la marge est-elle calculée (formule) ?",
        answer:
          "Toutes les dépenses entrantes (achat, transport, emballage, etc.) sont converties dans la devise du prix de vente selon les taux spécifiés. Ensuite, la formule est appliquée : Revenu Total = Prix_de_Vente × Quantité ; Dépenses Totales = (Prix_d'Achat × Quantité) + Transport + Emballage + Autres_Dépenses ; Marge = Revenu Total − Dépenses Totales ; % de Marge = (Marge / Revenu Total) × 100%",
      },
      item3: {
        question: "Que signifie le bouton 'Enregistrer' ?",
        answer:
          "Le bouton enregistre le calcul actuel dans l'application (dans la propre base de données de l'application) pour consultation/analyse ultérieure. L'enregistrement ne modifie pas le montant de la transaction Bitrix24, mais apporte des modifications aux champs supplémentaires pour les informations de tarification.",
      },
      item4: {
        question: "Comment fonctionne la récupération automatique du prix d'achat lors de la sélection d'un fournisseur ?",
        answer:
          "Lors de la sélection d'un fournisseur, l'application recherche dans sa base de données le prix de ce fournisseur pour le produit sélectionné et insère automatiquement le prix d'achat + la devise. S'il n'y a pas de prix pour la combinaison 'fournisseur-produit', le champ reste vide et vous devez saisir le prix manuellement.",
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
    subtitle: "Informations sur la licence de l'application",
    licenseKey: "Clé de licence",
    validUntil: "Valide jusqu'au",
    expiresIn: "Expire dans",
    days: "jours",
    today: "Aujourd'hui",
    expired: "Expirée",
    trial: "Version d'essai",
    licensedTo: "Licence pour",
    maxUsers: "Utilisateurs maximum",
    unlimited: "Illimité",
    noLicense: "Pas de clé de licence",
    purchaseContactTitle: "Pour acheter une clé de licence, contactez-nous de la manière qui vous convient :",
    website: "Site web",
    phone: "Téléphone",
    email: "E-mail",
    onlineChat: "Chat en ligne",
    checkError: "Erreur lors de la vérification de la licence",
  },

  pricing: {
    currencyInfo: "Informations sur la devise",
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