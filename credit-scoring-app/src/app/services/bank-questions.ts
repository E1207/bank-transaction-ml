/**
 * Questions bancaires basées sur l'analyse d'importance des features
 * Les 20 variables les plus importantes identifiées par régression logistique
 */

export interface BankQuestion {
  id: string;
  varIndex: number;
  category: string;
  question: string;
  type: 'number' | 'select' | 'range';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: {label: string, value: number}[];
  helpText?: string;
  importance: number;
}

export const BANK_QUESTIONS: BankQuestion[] = [
  // TOP 1: var_81 (Importance: 26.3%)
  {
    id: 'credit_history',
    varIndex: 81,
    category: 'Historique Crédit',
    question: 'Score d\'historique de crédit',
    type: 'range',
    min: 8,
    max: 23,
    step: 0.5,
    importance: 0.263,
    helpText: 'Basé sur vos crédits antérieurs et comportement de paiement'
  },
  
  // TOP 2: var_139 (Importance: 24.1%)
  {
    id: 'account_balance',
    varIndex: 139,
    category: 'Situation Financière',
    question: 'Solde moyen mensuel du compte',
    type: 'number',
    min: -21,
    max: 36,
    step: 0.1,
    unit: 'k€',
    importance: 0.241,
    helpText: 'Solde moyen sur les 12 derniers mois (en milliers d\'euros)'
  },
  
  // TOP 3: var_6 (Importance: 22.5%)
  {
    id: 'marital_status',
    varIndex: 6,
    category: 'Profil Personnel',
    question: 'Situation familiale',
    type: 'select',
    importance: 0.225,
    options: [
      {label: 'Célibataire', value: 2.5},
      {label: 'En couple (non marié)', value: 4.0},
      {label: 'Marié(e)', value: 5.4},
      {label: 'Divorcé(e)', value: 6.5},
      {label: 'Veuf(ve)', value: 7.5}
    ]
  },
  
  // TOP 4: var_12 (Importance: 21.8%)
  {
    id: 'employment_stability',
    varIndex: 12,
    category: 'Profil Personnel',
    question: 'Stabilité professionnelle',
    type: 'select',
    importance: 0.218,
    options: [
      {label: 'Intérimaire / CDD court', value: 13.5},
      {label: 'CDD long terme', value: 13.8},
      {label: 'CDI < 2 ans', value: 14.0},
      {label: 'CDI 2-5 ans', value: 14.2},
      {label: 'CDI > 5 ans / Fonctionnaire', value: 14.5}
    ]
  },
  
  // TOP 5: var_76 (Importance: 21.5%)
  {
    id: 'savings',
    varIndex: 76,
    category: 'Situation Financière',
    question: 'Épargne disponible',
    type: 'number',
    min: -22,
    max: 34,
    step: 0.5,
    unit: 'k€',
    importance: 0.215,
    helpText: 'Montant total de votre épargne (livrets, assurance-vie, etc.)'
  },
  
  // TOP 6: var_53 (Importance: 21.3%)
  {
    id: 'age_category',
    varIndex: 53,
    category: 'Profil Personnel',
    question: 'Tranche d\'âge',
    type: 'select',
    importance: 0.213,
    options: [
      {label: '18-25 ans', value: 3.5},
      {label: '26-35 ans', value: 5.0},
      {label: '36-45 ans', value: 6.0},
      {label: '46-55 ans', value: 6.5},
      {label: '56-65 ans', value: 7.0},
      {label: '> 65 ans', value: 7.5}
    ]
  },
  
  // TOP 7: var_110 (Importance: 20.9%)
  {
    id: 'debt_ratio',
    varIndex: 110,
    category: 'Situation Financière',
    question: 'Taux d\'endettement actuel',
    type: 'range',
    min: 0,
    max: 19,
    step: 1,
    unit: '%',
    importance: 0.209,
    helpText: 'Pourcentage de vos revenus consacré au remboursement de crédits'
  },
  
  // TOP 8: var_146 (Importance: 20.5%)
  {
    id: 'income',
    varIndex: 146,
    category: 'Situation Financière',
    question: 'Revenu mensuel net',
    type: 'range',
    min: 0,
    max: 20,
    step: 0.5,
    unit: 'k€',
    importance: 0.205,
    helpText: 'Votre revenu net mensuel (en milliers d\'euros)'
  },
  
  // TOP 9: var_26 (Importance: 20.2%)
  {
    id: 'overdrafts',
    varIndex: 26,
    category: 'Historique Crédit',
    question: 'Découverts bancaires (12 derniers mois)',
    type: 'range',
    min: 0,
    max: 15,
    step: 1,
    importance: 0.202,
    helpText: 'Nombre de fois où vous avez été en découvert'
  },
  
  // TOP 10: var_22 (Importance: 20.0%)
  {
    id: 'account_age',
    varIndex: 22,
    category: 'Historique Crédit',
    question: 'Ancienneté du compte bancaire principal',
    type: 'range',
    min: 0,
    max: 14,
    step: 1,
    unit: 'ans',
    importance: 0.200,
    helpText: 'Depuis combien d\'années êtes-vous client de votre banque ?'
  },
  
  // TOP 11: var_174 (Importance: 19.9%)
  {
    id: 'property_value',
    varIndex: 174,
    category: 'Patrimoine',
    question: 'Valeur du patrimoine immobilier',
    type: 'number',
    min: -3,
    max: 43,
    step: 1,
    unit: 'k€',
    importance: 0.199,
    helpText: 'Valeur estimée de vos biens immobiliers (0 si locataire)'
  },
  
  // TOP 12: var_99 (Importance: 19.4%)
  {
    id: 'payment_incidents',
    varIndex: 99,
    category: 'Historique Crédit',
    question: 'Incidents de paiement',
    type: 'select',
    importance: 0.194,
    options: [
      {label: 'Aucun incident', value: 1.0},
      {label: '1-2 retards mineurs', value: -0.5},
      {label: '3-5 retards', value: -2.0},
      {label: 'Plusieurs retards graves', value: -4.0},
      {label: 'Défaut de paiement', value: -7.0}
    ]
  },
  
  // TOP 13: var_21 (Importance: 19.2%)
  {
    id: 'monthly_expenses',
    varIndex: 21,
    category: 'Situation Financière',
    question: 'Charges mensuelles fixes',
    type: 'number',
    min: 0,
    max: 49,
    step: 0.5,
    unit: 'k€',
    importance: 0.192,
    helpText: 'Loyer, charges, crédits en cours, etc. (par mois)'
  },
  
  // TOP 14: var_190 (Importance: 19.0%)
  {
    id: 'investment_portfolio',
    varIndex: 190,
    category: 'Patrimoine',
    question: 'Portefeuille d\'investissements',
    type: 'number',
    min: -14,
    max: 18,
    step: 0.5,
    unit: 'k€',
    importance: 0.190,
    helpText: 'Actions, obligations, PEA, etc.'
  },
  
  // TOP 15: var_34 (Importance: 18.7%)
  {
    id: 'education_level',
    varIndex: 34,
    category: 'Profil Personnel',
    question: 'Niveau d\'études',
    type: 'select',
    importance: 0.187,
    options: [
      {label: 'Sans diplôme', value: 10.0},
      {label: 'CAP/BEP', value: 10.5},
      {label: 'Bac', value: 11.0},
      {label: 'Bac+2/3', value: 11.4},
      {label: 'Bac+5', value: 11.8},
      {label: 'Doctorat', value: 12.5}
    ]
  },
  
  // TOP 16: var_13 (Importance: 18.2%)
  {
    id: 'previous_loans',
    varIndex: 13,
    category: 'Historique Crédit',
    question: 'Nombre de crédits remboursés avec succès',
    type: 'range',
    min: 0,
    max: 22,
    step: 1,
    importance: 0.182,
    helpText: 'Crédits que vous avez intégralement remboursés dans le passé'
  },
  
  // TOP 17: var_80 (Importance: 18.0%)
  {
    id: 'current_loans',
    varIndex: 80,
    category: 'Situation Financière',
    question: 'Montant total des crédits en cours',
    type: 'number',
    min: -18,
    max: 30,
    step: 0.5,
    unit: 'k€',
    importance: 0.180,
    helpText: 'Somme de tous vos crédits actuels (auto, conso, immo)'
  },
  
  // TOP 18: var_166 (Importance: 17.8%)
  {
    id: 'residence_type',
    varIndex: 166,
    category: 'Profil Personnel',
    question: 'Type de logement',
    type: 'select',
    importance: 0.178,
    options: [
      {label: 'Locataire', value: 2.0},
      {label: 'Logé gratuitement', value: 2.5},
      {label: 'Propriétaire avec crédit', value: 3.0},
      {label: 'Propriétaire sans crédit', value: 3.5}
    ]
  },
  
  // TOP 19: var_133 (Importance: 17.5%)
  {
    id: 'dependents',
    varIndex: 133,
    category: 'Profil Personnel',
    question: 'Nombre de personnes à charge',
    type: 'select',
    importance: 0.175,
    options: [
      {label: '0', value: 5.5},
      {label: '1', value: 6.3},
      {label: '2', value: 6.8},
      {label: '3', value: 7.2},
      {label: '4 ou plus', value: 7.8}
    ]
  },
  
  // TOP 20: var_2 (Importance: 17.3%)
  {
    id: 'professional_category',
    varIndex: 2,
    category: 'Profil Personnel',
    question: 'Catégorie socio-professionnelle',
    type: 'select',
    importance: 0.173,
    options: [
      {label: 'Sans emploi', value: 3.0},
      {label: 'Ouvrier', value: 6.0},
      {label: 'Employé', value: 8.0},
      {label: 'Profession intermédiaire', value: 10.7},
      {label: 'Cadre', value: 13.0},
      {label: 'Profession libérale', value: 15.0},
      {label: 'Retraité', value: 12.0}
    ]
  }
];

// Valeurs par défaut pour les 180 autres variables (moyennes du dataset)
export const DEFAULT_FEATURES = [
  8.50, 4.48, 10.72, 6.54, 11.12, 10.68, 5.41, 2.01, 11.64, 8.48,
  2.33, 8.71, 14.02, 8.53, 8.06, 10.43, 7.62, 9.19, 11.53, 7.36,
  8.38, 17.26, 4.31, 9.25, 9.93, 9.12, -4.06, 8.68, 8.83, 7.57,
  7.50, 7.79, 9.55, 8.01, 11.43, 9.56, 9.81, 6.42, 9.26, 7.72,
  6.80, 9.96, 7.72, 9.33, 7.74, 8.31, 11.55, 7.82, 8.07, 9.54,
  8.47, 9.19, 8.24, 6.01, 8.26, 11.29, 9.39, 8.93, 5.94, 8.40,
  8.65, 8.92, 9.48, 7.87, 10.73, 10.84, 8.39, 9.07, 10.13, 8.96,
  11.61, 10.34, 8.44, 9.35, 8.28, 8.89, 6.05, 7.20, 10.25, 7.93,
  5.80, 14.72, 7.36, 8.76, 8.23, 6.57, 9.20, 9.73, 5.54, 9.66,
  9.32, 9.76, 10.67, 8.84, 6.44, 8.86, 9.13, 8.41, 9.06, -0.75,
  10.09, 8.93, 8.03, 10.22, 10.98, 8.97, 8.42, 8.98, 8.22, 8.99,
  5.51, 9.18, 7.98, 7.67, 8.71, 9.18, 9.23, 8.30, 6.25, 9.21,
  9.66, 7.37, 7.95, 6.79, 8.24, 8.45, 10.88, 12.35, 9.45, 7.70,
  9.03, 9.11, 9.66, 6.81, 10.04, 7.26, 10.00, 8.43, 9.51, 7.76,
  10.46, 10.01, 10.79, 8.29, 9.58, 9.31, 10.34, 9.49, 10.40, 5.72,
  10.29, 9.14, 8.73, 9.43, 8.86, 8.93, 8.91, 7.91, 10.34, 8.12,
  9.37, 10.23, 9.14, 9.53, 8.38, 8.63, 2.96, 10.51, 8.27, 8.74,
  10.10, 7.76, 8.69, 7.82, 20.21, 9.37, 8.50, 8.95, 7.79, 8.83,
  8.32, 10.16, 9.43, 10.84, 8.86, 8.60, 9.57, 8.43, 10.52, 9.65,
  3.23, 10.64, 8.93, 8.61, 9.72, 10.59, 9.90, 9.14, 11.22, 9.22
];
