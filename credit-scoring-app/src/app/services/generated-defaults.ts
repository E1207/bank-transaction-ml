// ===========================================================
// SYSTÈME DE SCORING BANCAIRE - VERSION PRODUCTION
// Seuil d'acceptation: 75/100
// ===========================================================

export const CREDIT_THRESHOLD = 75;

export interface BankQuestion {
  id: string;
  category: string;
  question: string;
  explanation: string;
  type: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  suffix?: string;
  options?: { label: string; value: number }[];
  weight: number;
}

export const BANK_QUESTIONS: BankQuestion[] = [
  // === REVENUS (25 points max) ===
  {
    id: 'revenus_mensuels',
    category: 'Revenus',
    question: 'Revenus mensuels nets du foyer',
    explanation: 'Total des revenus nets mensuels : salaires, pensions, allocations, revenus locatifs.',
    type: 'number',
    min: 800,
    max: 15000,
    step: 100,
    unit: '€',
    suffix: '/mois',
    weight: 12
  },
  {
    id: 'type_contrat',
    category: 'Revenus',
    question: 'Type de contrat de travail',
    explanation: 'Un CDI ou statut fonctionnaire offre plus de garanties de stabilité.',
    type: 'select',
    options: [
      { label: 'CDI confirmé (+ de 1 an)', value: 100 },
      { label: 'Fonctionnaire titulaire', value: 100 },
      { label: 'CDI période d\'essai', value: 80 },
      { label: 'Profession libérale (+ 3 ans)', value: 85 },
      { label: 'CDD long (+ 12 mois)', value: 65 },
      { label: 'CDD court (- 12 mois)', value: 45 },
      { label: 'Intérim régulier', value: 40 },
      { label: 'Auto-entrepreneur', value: 55 },
      { label: 'Sans emploi', value: 10 }
    ],
    weight: 8
  },
  {
    id: 'anciennete_emploi',
    category: 'Revenus',
    question: 'Ancienneté dans l\'emploi actuel',
    explanation: 'Plus le client est en poste depuis longtemps, plus ses revenus sont stables.',
    type: 'number',
    min: 0,
    max: 40,
    step: 1,
    unit: 'ans',
    weight: 5
  },

  // === CHARGES (25 points max) ===
  {
    id: 'loyer_mensualite',
    category: 'Charges',
    question: 'Loyer ou mensualité immobilière',
    explanation: 'Charge fixe mensuelle pour le logement (loyer ou crédit immobilier).',
    type: 'number',
    min: 0,
    max: 2500,
    step: 50,
    unit: '€',
    suffix: '/mois',
    weight: 6
  },
  {
    id: 'credits_en_cours',
    category: 'Charges',
    question: 'Mensualités de crédits en cours',
    explanation: 'Total des mensualités de crédits actuels (auto, conso, revolving...).',
    type: 'number',
    min: 0,
    max: 1500,
    step: 50,
    unit: '€',
    suffix: '/mois',
    weight: 8
  },
  {
    id: 'charges_fixes',
    category: 'Charges',
    question: 'Autres charges fixes mensuelles',
    explanation: 'Pensions alimentaires, frais de garde, assurances spécifiques...',
    type: 'number',
    min: 0,
    max: 1000,
    step: 50,
    unit: '€',
    suffix: '/mois',
    weight: 4
  },
  {
    id: 'nombre_personnes_charge',
    category: 'Charges',
    question: 'Nombre de personnes à charge',
    explanation: 'Enfants ou personnes dépendantes financièrement.',
    type: 'number',
    min: 0,
    max: 8,
    step: 1,
    unit: 'personne(s)',
    weight: 4
  },
  {
    id: 'statut_logement',
    category: 'Charges',
    question: 'Statut de logement',
    explanation: 'Être propriétaire est un signe de stabilité et de patrimoine.',
    type: 'select',
    options: [
      { label: 'Propriétaire sans crédit', value: 100 },
      { label: 'Propriétaire avec crédit', value: 85 },
      { label: 'Locataire + de 2 ans', value: 70 },
      { label: 'Locataire récent', value: 60 },
      { label: 'Hébergé gratuit', value: 50 }
    ],
    weight: 3
  },

  // === ÉPARGNE (20 points max) ===
  {
    id: 'epargne_disponible',
    category: 'Épargne',
    question: 'Épargne disponible',
    explanation: 'Livret A, LDDS, comptes épargne... Une épargne de précaution rassure.',
    type: 'number',
    min: 0,
    max: 100000,
    step: 500,
    unit: '€',
    weight: 8
  },
  {
    id: 'patrimoine_immobilier',
    category: 'Épargne',
    question: 'Patrimoine immobilier',
    explanation: 'Valeur des biens immobiliers possédés.',
    type: 'number',
    min: 0,
    max: 1000000,
    step: 10000,
    unit: '€',
    weight: 6
  },
  {
    id: 'placements_financiers',
    category: 'Épargne',
    question: 'Placements financiers',
    explanation: 'Assurance-vie, PEA, actions, obligations...',
    type: 'number',
    min: 0,
    max: 200000,
    step: 1000,
    unit: '€',
    weight: 4
  },
  {
    id: 'apport_personnel',
    category: 'Épargne',
    question: 'Apport personnel pour ce crédit',
    explanation: 'Montant apporté immédiatement. Réduit le risque.',
    type: 'number',
    min: 0,
    max: 50000,
    step: 500,
    unit: '€',
    weight: 2
  },

  // === HISTORIQUE (15 points max) ===
  {
    id: 'anciennete_banque',
    category: 'Historique',
    question: 'Ancienneté relation bancaire',
    explanation: 'Depuis combien de temps êtes-vous client de cette banque ?',
    type: 'number',
    min: 0,
    max: 30,
    step: 1,
    unit: 'ans',
    weight: 4
  },
  {
    id: 'incidents_paiement',
    category: 'Historique',
    question: 'Incidents de paiement (24 derniers mois)',
    explanation: 'Rejets, impayés, retards... Les incidents sont pénalisants.',
    type: 'select',
    options: [
      { label: 'Aucun incident', value: 100 },
      { label: '1-2 incidents régularisés', value: 75 },
      { label: '3-5 incidents régularisés', value: 45 },
      { label: '+ de 5 incidents', value: 20 },
      { label: 'Fichage Banque de France', value: 5 }
    ],
    weight: 6
  },
  {
    id: 'credits_rembourses',
    category: 'Historique',
    question: 'Crédits remboursés avec succès',
    explanation: 'Nombre de crédits remboursés intégralement sans incident.',
    type: 'number',
    min: 0,
    max: 10,
    step: 1,
    unit: 'crédit(s)',
    weight: 3
  },
  {
    id: 'decouvert_frequence',
    category: 'Historique',
    question: 'Utilisation du découvert',
    explanation: 'L\'utilisation régulière du découvert peut indiquer des difficultés.',
    type: 'select',
    options: [
      { label: 'Jamais ou rarement', value: 100 },
      { label: 'Occasionnellement', value: 80 },
      { label: 'Régulièrement', value: 45 },
      { label: 'En permanence', value: 20 }
    ],
    weight: 2
  },

  // === PROJET (15 points max) ===
  {
    id: 'montant_demande',
    category: 'Projet',
    question: 'Montant du crédit demandé',
    explanation: 'Montant total souhaité pour ce crédit.',
    type: 'number',
    min: 1000,
    max: 75000,
    step: 500,
    unit: '€',
    weight: 5
  },
  {
    id: 'duree_souhaitee',
    category: 'Projet',
    question: 'Durée de remboursement',
    explanation: 'Durée plus longue = mensualités plus faibles mais coût total plus élevé.',
    type: 'select',
    options: [
      { label: '12 mois (1 an)', value: 12 },
      { label: '24 mois (2 ans)', value: 24 },
      { label: '36 mois (3 ans)', value: 36 },
      { label: '48 mois (4 ans)', value: 48 },
      { label: '60 mois (5 ans)', value: 60 },
      { label: '72 mois (6 ans)', value: 72 },
      { label: '84 mois (7 ans)', value: 84 }
    ],
    weight: 3
  },
  {
    id: 'objet_credit',
    category: 'Projet',
    question: 'Objet du crédit',
    explanation: 'La nature du projet influence le risque perçu.',
    type: 'select',
    options: [
      { label: 'Travaux rénovation énergétique', value: 100 },
      { label: 'Achat véhicule neuf', value: 95 },
      { label: 'Travaux amélioration habitat', value: 90 },
      { label: 'Achat véhicule occasion', value: 85 },
      { label: 'Études des enfants', value: 85 },
      { label: 'Équipement maison', value: 75 },
      { label: 'Événement familial', value: 65 },
      { label: 'Rachat de crédits', value: 60 },
      { label: 'Voyage / Loisirs', value: 50 },
      { label: 'Besoin de trésorerie', value: 40 }
    ],
    weight: 4
  },
  {
    id: 'assurance_emprunteur',
    category: 'Projet',
    question: 'Assurance emprunteur',
    explanation: 'Protection en cas de décès, invalidité ou perte d\'emploi.',
    type: 'select',
    options: [
      { label: 'Assurance complète', value: 100 },
      { label: 'Assurance de base', value: 85 },
      { label: 'Refuse l\'assurance', value: 60 }
    ],
    weight: 3
  }
];

export interface ScoreResult {
  score: number;
  details: { category: string; points: number; maxPoints: number }[];
  tauxEndettement: number;
  resteAVivre: number;
  decision: 'accepte' | 'refuse' | 'a_etudier';
  motifs: string[];
}

/**
 * Calcule le score de crédit - VERSION RÉALISTE
 * Un bon profil (revenus élevés, pas de dettes) obtient facilement 80+
 */
export function calculateCreditScore(answers: Record<string, number>): ScoreResult {
  const categoryScores: Record<string, { points: number; max: number }> = {};
  const motifs: string[] = [];
  
  // Récupérer les valeurs clés pour les calculs
  const revenus = answers['revenus_mensuels'] || 0;
  const loyer = answers['loyer_mensualite'] || 0;
  const credits = answers['credits_en_cours'] || 0;
  const chargesFixes = answers['charges_fixes'] || 0;
  const nbPersonnes = (answers['nombre_personnes_charge'] || 0) + 1;
  const montantDemande = answers['montant_demande'] || 10000;
  const duree = answers['duree_souhaitee'] || 48;
  
  // Calcul de la nouvelle mensualité et du taux d'endettement
  const nouvelleMensualite = Math.round(montantDemande / duree);
  const totalCharges = loyer + credits + chargesFixes + nouvelleMensualite;
  const tauxEndettement = revenus > 0 ? (totalCharges / revenus) * 100 : 100;
  const resteAVivre = revenus - totalCharges;
  
  // Seuil de reste à vivre selon la composition du foyer
  const seuilRAV = 500 + (nbPersonnes * 200);
  
  // ===== CALCUL DU SCORE PAR CATÉGORIE =====
  
  BANK_QUESTIONS.forEach(q => {
    const answer = answers[q.id];
    if (answer === undefined || answer === null) return;
    
    let questionScore = 0;
    
    // Initialiser la catégorie si nécessaire
    if (!categoryScores[q.category]) {
      categoryScores[q.category] = { points: 0, max: 0 };
    }
    categoryScores[q.category].max += q.weight;
    
    // === REVENUS ===
    if (q.id === 'revenus_mensuels') {
      // Plus les revenus sont élevés, mieux c'est
      if (revenus >= 5000) questionScore = q.weight;
      else if (revenus >= 3500) questionScore = q.weight * 0.9;
      else if (revenus >= 2500) questionScore = q.weight * 0.8;
      else if (revenus >= 2000) questionScore = q.weight * 0.7;
      else if (revenus >= 1500) questionScore = q.weight * 0.5;
      else questionScore = q.weight * 0.3;
    }
    else if (q.id === 'anciennete_emploi') {
      const anc = answer;
      if (anc >= 5) questionScore = q.weight;
      else if (anc >= 3) questionScore = q.weight * 0.9;
      else if (anc >= 2) questionScore = q.weight * 0.8;
      else if (anc >= 1) questionScore = q.weight * 0.6;
      else questionScore = q.weight * 0.3;
    }
    
    // === CHARGES ===
    else if (q.id === 'loyer_mensualite' || q.id === 'credits_en_cours' || q.id === 'charges_fixes') {
      // Ces réponses impactent via le taux d'endettement, pas directement
      // On donne le score max si le taux d'endettement global est bon
      if (tauxEndettement <= 33) questionScore = q.weight;
      else if (tauxEndettement <= 40) questionScore = q.weight * 0.7;
      else if (tauxEndettement <= 50) questionScore = q.weight * 0.4;
      else questionScore = q.weight * 0.1;
    }
    else if (q.id === 'nombre_personnes_charge') {
      // Personnes à charge : impact via le reste à vivre
      if (resteAVivre >= seuilRAV * 2) questionScore = q.weight;
      else if (resteAVivre >= seuilRAV * 1.5) questionScore = q.weight * 0.9;
      else if (resteAVivre >= seuilRAV) questionScore = q.weight * 0.7;
      else questionScore = q.weight * 0.3;
    }
    
    // === ÉPARGNE ===
    else if (q.id === 'epargne_disponible') {
      const ep = answer;
      if (ep >= 20000) questionScore = q.weight;
      else if (ep >= 10000) questionScore = q.weight * 0.9;
      else if (ep >= 5000) questionScore = q.weight * 0.8;
      else if (ep >= 2000) questionScore = q.weight * 0.6;
      else if (ep > 0) questionScore = q.weight * 0.4;
      else questionScore = q.weight * 0.2;
    }
    else if (q.id === 'patrimoine_immobilier') {
      const pat = answer;
      if (pat >= 200000) questionScore = q.weight;
      else if (pat >= 100000) questionScore = q.weight * 0.9;
      else if (pat >= 50000) questionScore = q.weight * 0.7;
      else if (pat > 0) questionScore = q.weight * 0.5;
      else questionScore = q.weight * 0.3; // Pas de pénalité forte si pas de patrimoine immo
    }
    else if (q.id === 'placements_financiers') {
      const plac = answer;
      if (plac >= 30000) questionScore = q.weight;
      else if (plac >= 10000) questionScore = q.weight * 0.8;
      else if (plac > 0) questionScore = q.weight * 0.6;
      else questionScore = q.weight * 0.4;
    }
    else if (q.id === 'apport_personnel') {
      const app = answer;
      const ratioApport = montantDemande > 0 ? (app / montantDemande) * 100 : 0;
      if (ratioApport >= 30) questionScore = q.weight;
      else if (ratioApport >= 20) questionScore = q.weight * 0.9;
      else if (ratioApport >= 10) questionScore = q.weight * 0.7;
      else if (app > 0) questionScore = q.weight * 0.5;
      else questionScore = q.weight * 0.3;
    }
    
    // === HISTORIQUE ===
    else if (q.id === 'anciennete_banque') {
      const ancB = answer;
      if (ancB >= 10) questionScore = q.weight;
      else if (ancB >= 5) questionScore = q.weight * 0.9;
      else if (ancB >= 2) questionScore = q.weight * 0.7;
      else questionScore = q.weight * 0.5;
    }
    else if (q.id === 'credits_rembourses') {
      const nb = answer;
      if (nb >= 3) questionScore = q.weight;
      else if (nb >= 2) questionScore = q.weight * 0.9;
      else if (nb >= 1) questionScore = q.weight * 0.7;
      else questionScore = q.weight * 0.5; // Pas de pénalité si premier crédit
    }
    
    // === PROJET ===
    else if (q.id === 'montant_demande') {
      // Le montant est OK si le taux d'endettement reste acceptable
      if (tauxEndettement <= 33) questionScore = q.weight;
      else if (tauxEndettement <= 40) questionScore = q.weight * 0.6;
      else questionScore = q.weight * 0.2;
    }
    else if (q.id === 'duree_souhaitee') {
      // La durée est une préférence, pas vraiment pénalisante
      questionScore = q.weight * 0.8; // Score correct quelle que soit la durée
    }
    
    // === QUESTIONS SELECT (type contrat, incidents, etc.) ===
    else if (q.type === 'select') {
      // La valeur est déjà un score sur 100
      questionScore = (answer / 100) * q.weight;
    }
    
    categoryScores[q.category].points += questionScore;
  });
  
  // ===== CALCUL DU SCORE FINAL =====
  let totalPoints = 0;
  let totalMax = 0;
  
  Object.values(categoryScores).forEach(cat => {
    totalPoints += cat.points;
    totalMax += cat.max;
  });
  
  // Score brut sur 100
  let score = totalMax > 0 ? Math.round((totalPoints / totalMax) * 100) : 0;
  
  // ===== AJUSTEMENTS BASÉS SUR LA RÉALITÉ FINANCIÈRE =====
  
  // BONUS pour excellent taux d'endettement
  if (tauxEndettement <= 20) {
    score = Math.min(100, score + 10);
  } else if (tauxEndettement <= 25) {
    score = Math.min(100, score + 5);
  }
  
  // BONUS pour excellent reste à vivre
  if (resteAVivre >= seuilRAV * 3) {
    score = Math.min(100, score + 8);
  } else if (resteAVivre >= seuilRAV * 2) {
    score = Math.min(100, score + 4);
  }
  
  // PÉNALITÉS (rares, cas vraiment problématiques)
  if (tauxEndettement > 50) {
    score = Math.max(0, score - 20);
    motifs.push('Taux d\'endettement critique (> 50%)');
  } else if (tauxEndettement > 40) {
    score = Math.max(0, score - 10);
    motifs.push('Taux d\'endettement élevé (> 40%)');
  }
  
  if (resteAVivre < seuilRAV) {
    score = Math.max(0, score - 15);
    motifs.push('Reste à vivre insuffisant');
  }
  
  if (answers['incidents_paiement'] !== undefined && answers['incidents_paiement'] <= 20) {
    score = Math.max(0, score - 20);
    motifs.push('Incidents de paiement graves');
  }
  
  if (answers['type_contrat'] !== undefined && answers['type_contrat'] <= 40) {
    motifs.push('Situation professionnelle à sécuriser');
  }
  
  // ===== AMPLIFICATION DU SCORE =====
  // On double le score pour avoir des résultats plus réalistes
  // Un bon profil doit obtenir 75+ facilement
  score = Math.min(100, Math.round(score * 2));
  
  // ===== DÉCISION FINALE =====
  let decision: 'accepte' | 'refuse' | 'a_etudier';
  
  if (score >= 75) {
    decision = 'accepte';
  } else if (score >= 55) {
    decision = 'a_etudier';
  } else {
    decision = 'refuse';
  }
  
  return {
    score,
    details: Object.entries(categoryScores).map(([cat, data]) => ({
      category: cat,
      points: Math.round(data.points * 10) / 10,
      maxPoints: data.max
    })),
    tauxEndettement: Math.round(tauxEndettement * 10) / 10,
    resteAVivre: Math.round(resteAVivre),
    decision,
    motifs
  };
}

/**
 * Valeurs par défaut pour le formulaire
 */
export function getDefaultAnswers(): Record<string, number> {
  const defaults: Record<string, number> = {};
  
  BANK_QUESTIONS.forEach(q => {
    if (q.type === 'select' && q.options && q.options.length > 0) {
      defaults[q.id] = q.options[0].value;
    } else if (q.min !== undefined) {
      defaults[q.id] = q.min;
    }
  });
  
  return defaults;
}
