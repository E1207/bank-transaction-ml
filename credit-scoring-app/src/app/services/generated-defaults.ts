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
  // === REVENUS ===
  {
    id: 'revenus_mensuels',
    category: 'Revenus',
    question: 'Revenus mensuels nets du foyer',
    explanation: 'Total des revenus nets mensuels : salaires, pensions, allocations.',
    type: 'number',
    min: 800,
    max: 15000,
    step: 100,
    unit: 'euros',
    suffix: '/mois',
    weight: 15
  },
  {
    id: 'type_contrat',
    category: 'Revenus',
    question: 'Type de contrat de travail',
    explanation: 'Un CDI ou statut fonctionnaire offre plus de garanties.',
    type: 'select',
    options: [
      { label: 'CDI confirme (+1 an)', value: 100 },
      { label: 'Fonctionnaire titulaire', value: 100 },
      { label: 'CDI periode essai', value: 85 },
      { label: 'Profession liberale (+2 ans)', value: 90 },
      { label: 'CDD long (+12 mois)', value: 75 },
      { label: 'CDD court (-12 mois)', value: 55 },
      { label: 'Interim regulier', value: 50 },
      { label: 'Auto-entrepreneur (+1 an)', value: 65 },
      { label: 'Sans emploi', value: 15 }
    ],
    weight: 12
  },
  {
    id: 'anciennete_emploi',
    category: 'Revenus',
    question: 'Anciennete dans emploi actuel',
    explanation: 'Meme une anciennete courte est acceptable si le contrat est stable.',
    type: 'number',
    min: 0,
    max: 40,
    step: 1,
    unit: 'ans',
    weight: 5
  },

  // === CHARGES ===
  {
    id: 'loyer_mensualite',
    category: 'Charges',
    question: 'Loyer ou mensualite immobiliere',
    explanation: 'Charge fixe mensuelle pour le logement.',
    type: 'number',
    min: 0,
    max: 2500,
    step: 50,
    unit: 'euros',
    suffix: '/mois',
    weight: 8
  },
  {
    id: 'credits_en_cours',
    category: 'Charges',
    question: 'Mensualites de credits en cours',
    explanation: 'Total des mensualites de credits actuels.',
    type: 'number',
    min: 0,
    max: 1500,
    step: 50,
    unit: 'euros',
    suffix: '/mois',
    weight: 10
  },
  {
    id: 'charges_fixes',
    category: 'Charges',
    question: 'Autres charges fixes mensuelles',
    explanation: 'Pensions alimentaires, frais de garde, assurances...',
    type: 'number',
    min: 0,
    max: 1000,
    step: 50,
    unit: 'euros',
    suffix: '/mois',
    weight: 5
  },
  {
    id: 'nombre_personnes_charge',
    category: 'Charges',
    question: 'Nombre de personnes a charge',
    explanation: 'Enfants ou personnes dependantes financierement.',
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
    explanation: 'Votre situation actuelle de logement.',
    type: 'select',
    options: [
      { label: 'Proprietaire sans credit', value: 100 },
      { label: 'Proprietaire avec credit', value: 90 },
      { label: 'Locataire', value: 80 },
      { label: 'Heberge gratuit', value: 75 }
    ],
    weight: 3
  },

  // === EPARGNE ===
  {
    id: 'epargne_disponible',
    category: 'Epargne',
    question: 'Epargne disponible',
    explanation: 'Livret A, LDDS, comptes epargne... Meme une petite epargne compte.',
    type: 'number',
    min: 0,
    max: 100000,
    step: 500,
    unit: 'euros',
    weight: 6
  },
  {
    id: 'patrimoine_immobilier',
    category: 'Epargne',
    question: 'Patrimoine immobilier (optionnel)',
    explanation: 'Valeur des biens immobiliers. 0 si premier achat, c est normal.',
    type: 'number',
    min: 0,
    max: 1000000,
    step: 10000,
    unit: 'euros',
    weight: 3
  },
  {
    id: 'placements_financiers',
    category: 'Epargne',
    question: 'Placements financiers (optionnel)',
    explanation: 'Assurance-vie, PEA, actions... Pas obligatoire.',
    type: 'number',
    min: 0,
    max: 200000,
    step: 1000,
    unit: 'euros',
    weight: 2
  },
  {
    id: 'apport_personnel',
    category: 'Epargne',
    question: 'Apport personnel pour ce credit',
    explanation: 'Idealement 10% du montant demande, mais pas obligatoire.',
    type: 'number',
    min: 0,
    max: 50000,
    step: 500,
    unit: 'euros',
    weight: 4
  },

  // === HISTORIQUE ===
  {
    id: 'anciennete_banque',
    category: 'Historique',
    question: 'Anciennete relation bancaire',
    explanation: 'Depuis combien de temps etes-vous client ?',
    type: 'number',
    min: 0,
    max: 30,
    step: 1,
    unit: 'ans',
    weight: 3
  },
  {
    id: 'incidents_paiement',
    category: 'Historique',
    question: 'Incidents de paiement (24 mois)',
    explanation: 'Rejets, impayes, retards...',
    type: 'select',
    options: [
      { label: 'Aucun incident', value: 100 },
      { label: '1-2 incidents regularises', value: 80 },
      { label: '3-5 incidents regularises', value: 55 },
      { label: '+5 incidents', value: 25 },
      { label: 'Fichage Banque de France', value: 5 }
    ],
    weight: 8
  },
  {
    id: 'credits_rembourses',
    category: 'Historique',
    question: 'Credits rembourses avec succes',
    explanation: 'Nombre de credits rembourses. 0 si premier credit, c est OK.',
    type: 'number',
    min: 0,
    max: 10,
    step: 1,
    unit: 'credit(s)',
    weight: 2
  },
  {
    id: 'decouvert_frequence',
    category: 'Historique',
    question: 'Utilisation du decouvert',
    explanation: 'Frequence d utilisation du decouvert autorise.',
    type: 'select',
    options: [
      { label: 'Jamais ou rarement', value: 100 },
      { label: 'Occasionnellement', value: 85 },
      { label: 'Regulierement', value: 55 },
      { label: 'En permanence', value: 25 }
    ],
    weight: 3
  },

  // === PROJET ===
  {
    id: 'montant_demande',
    category: 'Projet',
    question: 'Montant du credit demande',
    explanation: 'Montant total souhaite.',
    type: 'number',
    min: 1000,
    max: 300000,
    step: 1000,
    unit: 'euros',
    weight: 5
  },
  {
    id: 'duree_souhaitee',
    category: 'Projet',
    question: 'Duree de remboursement',
    explanation: 'Duree en annees. Jusqu a 25-30 ans pour l immobilier.',
    type: 'select',
    options: [
      { label: '1 an (12 mois)', value: 12 },
      { label: '2 ans (24 mois)', value: 24 },
      { label: '3 ans (36 mois)', value: 36 },
      { label: '5 ans (60 mois)', value: 60 },
      { label: '7 ans (84 mois)', value: 84 },
      { label: '10 ans (120 mois)', value: 120 },
      { label: '15 ans (180 mois)', value: 180 },
      { label: '20 ans (240 mois)', value: 240 },
      { label: '25 ans (300 mois)', value: 300 }
    ],
    weight: 2
  },
  {
    id: 'objet_credit',
    category: 'Projet',
    question: 'Objet du credit',
    explanation: 'La nature du projet.',
    type: 'select',
    options: [
      { label: 'Achat residence principale', value: 100 },
      { label: 'Travaux renovation energetique', value: 100 },
      { label: 'Achat vehicule', value: 95 },
      { label: 'Travaux amelioration habitat', value: 95 },
      { label: 'Investissement locatif', value: 90 },
      { label: 'Etudes des enfants', value: 90 },
      { label: 'Equipement maison', value: 85 },
      { label: 'Evenement familial', value: 80 },
      { label: 'Rachat de credits', value: 75 },
      { label: 'Voyage / Loisirs', value: 70 },
      { label: 'Besoin de tresorerie', value: 60 }
    ],
    weight: 3
  },
  {
    id: 'assurance_emprunteur',
    category: 'Projet',
    question: 'Assurance emprunteur',
    explanation: 'Protection recommandee.',
    type: 'select',
    options: [
      { label: 'Assurance complete', value: 100 },
      { label: 'Assurance de base', value: 90 },
      { label: 'Refuse assurance', value: 70 }
    ],
    weight: 2
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

export function calculateCreditScore(answers: Record<string, number>): ScoreResult {
  const categoryScores: Record<string, { points: number; max: number }> = {};
  const motifs: string[] = [];
  
  const revenus = answers['revenus_mensuels'] || 0;
  const loyer = answers['loyer_mensualite'] || 0;
  const credits = answers['credits_en_cours'] || 0;
  const chargesFixes = answers['charges_fixes'] || 0;
  const nbPersonnes = (answers['nombre_personnes_charge'] || 0) + 1;
  const montantDemande = answers['montant_demande'] || 10000;
  const duree = answers['duree_souhaitee'] || 48;
  const apport = answers['apport_personnel'] || 0;
  
  const nouvelleMensualite = Math.round(montantDemande / duree);
  const totalCharges = loyer + credits + chargesFixes + nouvelleMensualite;
  const tauxEndettement = revenus > 0 ? (totalCharges / revenus) * 100 : 100;
  const resteAVivre = revenus - totalCharges;
  
  // Seuil reste a vivre: 400 EUR par personne
  const seuilRAV = 400 * nbPersonnes;
  
  // Ratio apport / montant demande
  const ratioApport = montantDemande > 0 ? (apport / montantDemande) * 100 : 0;
  
  BANK_QUESTIONS.forEach((q: BankQuestion) => {
    const answer = answers[q.id];
    if (answer === undefined || answer === null) return;
    
    let questionScore = 0;
    
    if (!categoryScores[q.category]) {
      categoryScores[q.category] = { points: 0, max: 0 };
    }
    categoryScores[q.category].max += q.weight;
    
    // === REVENUS ===
    if (q.id === 'revenus_mensuels') {
      // Revenus: plus c'est haut mieux c'est, mais 2000 EUR est deja correct
      if (revenus >= 4000) questionScore = q.weight;
      else if (revenus >= 3000) questionScore = q.weight * 0.95;
      else if (revenus >= 2500) questionScore = q.weight * 0.90;
      else if (revenus >= 2000) questionScore = q.weight * 0.85;
      else if (revenus >= 1800) questionScore = q.weight * 0.75;
      else if (revenus >= 1500) questionScore = q.weight * 0.65;
      else questionScore = q.weight * 0.4;
    }
    else if (q.id === 'anciennete_emploi') {
      // Anciennete emploi: 1-2 ans est deja bien
      if (answer >= 3) questionScore = q.weight;
      else if (answer >= 2) questionScore = q.weight * 0.95;
      else if (answer >= 1) questionScore = q.weight * 0.85;
      else if (answer >= 0.5) questionScore = q.weight * 0.70;
      else questionScore = q.weight * 0.50;
    }
    
    // === CHARGES - Base sur taux d'endettement ===
    else if (q.id === 'loyer_mensualite' || q.id === 'credits_en_cours' || q.id === 'charges_fixes') {
      // Le critere cle est le taux d'endettement <= 35%
      if (tauxEndettement <= 30) questionScore = q.weight;
      else if (tauxEndettement <= 33) questionScore = q.weight * 0.95;
      else if (tauxEndettement <= 35) questionScore = q.weight * 0.85;
      else if (tauxEndettement <= 40) questionScore = q.weight * 0.65;
      else if (tauxEndettement <= 45) questionScore = q.weight * 0.45;
      else questionScore = q.weight * 0.20;
    }
    else if (q.id === 'nombre_personnes_charge') {
      // Personnes a charge: impact via reste a vivre
      if (resteAVivre >= seuilRAV * 1.5) questionScore = q.weight;
      else if (resteAVivre >= seuilRAV * 1.2) questionScore = q.weight * 0.90;
      else if (resteAVivre >= seuilRAV) questionScore = q.weight * 0.75;
      else if (resteAVivre >= seuilRAV * 0.8) questionScore = q.weight * 0.50;
      else questionScore = q.weight * 0.25;
    }
    
    // === EPARGNE - Criteres assouplis ===
    else if (q.id === 'epargne_disponible') {
      // Epargne: meme petite epargne est valorisee
      if (answer >= 10000) questionScore = q.weight;
      else if (answer >= 5000) questionScore = q.weight * 0.95;
      else if (answer >= 3000) questionScore = q.weight * 0.85;
      else if (answer >= 1000) questionScore = q.weight * 0.75;
      else if (answer > 0) questionScore = q.weight * 0.60;
      else questionScore = q.weight * 0.40; // Pas d'epargne = pas eliminatoire
    }
    else if (q.id === 'patrimoine_immobilier') {
      // Patrimoine immo: OPTIONNEL, 0 est tout a fait acceptable
      if (answer >= 100000) questionScore = q.weight;
      else if (answer >= 50000) questionScore = q.weight * 0.90;
      else if (answer > 0) questionScore = q.weight * 0.80;
      else questionScore = q.weight * 0.70; // 0 = premier achat, c'est normal!
    }
    else if (q.id === 'placements_financiers') {
      // Placements: OPTIONNEL, 0 est acceptable
      if (answer >= 10000) questionScore = q.weight;
      else if (answer >= 5000) questionScore = q.weight * 0.90;
      else if (answer > 0) questionScore = q.weight * 0.80;
      else questionScore = q.weight * 0.65; // Pas de placements = OK
    }
    else if (q.id === 'apport_personnel') {
      // Apport: 10% est le seuil ideal
      if (ratioApport >= 20) questionScore = q.weight;
      else if (ratioApport >= 10) questionScore = q.weight * 0.95;
      else if (ratioApport >= 5) questionScore = q.weight * 0.80;
      else if (apport > 0) questionScore = q.weight * 0.65;
      else questionScore = q.weight * 0.45; // Pas d'apport = acceptable
    }
    
    // === HISTORIQUE ===
    else if (q.id === 'anciennete_banque') {
      // Anciennete banque: 2-3 ans suffit
      if (answer >= 5) questionScore = q.weight;
      else if (answer >= 3) questionScore = q.weight * 0.95;
      else if (answer >= 2) questionScore = q.weight * 0.85;
      else if (answer >= 1) questionScore = q.weight * 0.75;
      else questionScore = q.weight * 0.60;
    }
    else if (q.id === 'credits_rembourses') {
      // Credits rembourses: 0 = premier credit, c'est OK
      if (answer >= 2) questionScore = q.weight;
      else if (answer >= 1) questionScore = q.weight * 0.90;
      else questionScore = q.weight * 0.75; // Premier credit = normal
    }
    
    // === PROJET ===
    else if (q.id === 'montant_demande') {
      // Le montant est OK si taux endettement reste acceptable
      if (tauxEndettement <= 33) questionScore = q.weight;
      else if (tauxEndettement <= 35) questionScore = q.weight * 0.85;
      else if (tauxEndettement <= 40) questionScore = q.weight * 0.60;
      else questionScore = q.weight * 0.30;
    }
    else if (q.id === 'duree_souhaitee') {
      // Duree: toutes les durees sont acceptables
      questionScore = q.weight * 0.90;
    }
    
    // === QUESTIONS SELECT ===
    else if (q.type === 'select') {
      questionScore = (answer / 100) * q.weight;
    }
    
    categoryScores[q.category].points += questionScore;
  });
  
  // Calcul du score brut
  let totalPoints = 0;
  let totalMax = 0;
  Object.values(categoryScores).forEach(cat => {
    totalPoints += cat.points;
    totalMax += cat.max;
  });
  
  let score = totalMax > 0 ? Math.round((totalPoints / totalMax) * 100) : 0;
  
  // === BONUS ===
  // Excellent taux d'endettement
  if (tauxEndettement <= 25) score = Math.min(100, score + 8);
  else if (tauxEndettement <= 30) score = Math.min(100, score + 5);
  
  // Bon reste a vivre
  if (resteAVivre >= seuilRAV * 2) score = Math.min(100, score + 5);
  else if (resteAVivre >= seuilRAV * 1.5) score = Math.min(100, score + 3);
  
  // === PENALITES (seulement pour cas vraiment problematiques) ===
  if (tauxEndettement > 50) {
    score = Math.max(0, score - 15);
    motifs.push('Taux endettement trop eleve (>50%)');
  } else if (tauxEndettement > 40) {
    score = Math.max(0, score - 8);
    motifs.push('Taux endettement eleve (>40%)');
  }
  
  if (resteAVivre < seuilRAV * 0.7) {
    score = Math.max(0, score - 12);
    motifs.push('Reste a vivre insuffisant');
  }
  
  // Incidents graves uniquement
  if (answers['incidents_paiement'] !== undefined && answers['incidents_paiement'] <= 25) {
    score = Math.max(0, score - 15);
    motifs.push('Incidents de paiement importants');
  }
  
  // Decision finale
  let decision: 'accepte' | 'refuse' | 'a_etudier';
  if (score >= 75) decision = 'accepte';
  else if (score >= 55) decision = 'a_etudier';
  else decision = 'refuse';
  
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

export function getDefaultAnswers(): Record<string, number> {
  const defaults: Record<string, number> = {};
  BANK_QUESTIONS.forEach((q: BankQuestion) => {
    if (q.type === 'select' && q.options && q.options.length > 0) {
      defaults[q.id] = q.options[0].value;
    } else if (q.min !== undefined) {
      defaults[q.id] = q.min;
    }
  });
  return defaults;
}
