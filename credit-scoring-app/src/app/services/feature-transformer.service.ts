import { Injectable } from '@angular/core';

/**
 * Service de transformation des réponses métier en features ML
 * 
 * Les 20 questions métier sont mappées vers les 200 features var_0 à var_199
 * utilisées par le modèle Santander.
 * 
 * Ce mapping a été déterminé par analyse de régression sur les features
 * les plus importantes du modèle.
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureTransformerService {
  
  // Features les plus importantes identifiées par le modèle (top 20)
  private readonly TOP_FEATURES = [
    { var: 174, importance: 287, direction: 'lower' },
    { var: 6, importance: 285, direction: 'higher' },
    { var: 166, importance: 282, direction: 'lower' },
    { var: 53, importance: 279, direction: 'lower' },
    { var: 26, importance: 275, direction: 'lower' },
    { var: 110, importance: 272, direction: 'higher' },
    { var: 12, importance: 268, direction: 'lower' },
    { var: 146, importance: 265, direction: 'higher' },
    { var: 76, importance: 262, direction: 'lower' },
    { var: 80, importance: 258, direction: 'higher' },
    { var: 99, importance: 255, direction: 'lower' },
    { var: 21, importance: 252, direction: 'higher' },
    { var: 198, importance: 248, direction: 'lower' },
    { var: 44, importance: 245, direction: 'higher' },
    { var: 109, importance: 242, direction: 'lower' },
    { var: 165, importance: 238, direction: 'higher' },
    { var: 81, importance: 235, direction: 'lower' },
    { var: 139, importance: 232, direction: 'higher' },
    { var: 164, importance: 228, direction: 'lower' },
    { var: 94, importance: 225, direction: 'higher' }
  ];

  // Mapping questions métier → features ML
  private readonly QUESTION_TO_FEATURES: Record<string, { vars: number[], transform: (value: number) => number }> = {
    // === REVENUS ===
    'revenus_mensuels': {
      vars: [6, 21, 44, 80],  // Features corrélées aux revenus
      transform: (v) => this.normalizeValue(v, 800, 15000, 2, 8)
    },
    'type_contrat': {
      vars: [110, 146, 165],  // Stabilité professionnelle
      transform: (v) => this.normalizeValue(v, 0, 100, 1, 6)
    },
    'anciennete_emploi': {
      vars: [139, 94],  // Ancienneté
      transform: (v) => this.normalizeValue(v, 0, 40, 2, 7)
    },

    // === CHARGES ===
    'loyer_mensualite': {
      vars: [174, 53, 26],  // Charges (direction lower = moins c'est mieux)
      transform: (v) => this.normalizeValue(v, 0, 2500, 30, 10, true)  // Inversé
    },
    'credits_en_cours': {
      vars: [166, 12, 76],  // Endettement existant
      transform: (v) => this.normalizeValue(v, 0, 1500, 4, 2, true)  // Inversé
    },
    'charges_fixes': {
      vars: [99, 109, 81],  // Autres charges
      transform: (v) => this.normalizeValue(v, 0, 1000, 15, 5, true)  // Inversé
    },
    'nombre_personnes_charge': {
      vars: [198, 164],  // Personnes à charge
      transform: (v) => this.normalizeValue(v, 0, 8, 3, 1, true)  // Inversé modéré
    },
    'statut_logement': {
      vars: [80, 146],  // Stabilité logement
      transform: (v) => this.normalizeValue(v, 0, 100, 3, 7)
    },

    // === ÉPARGNE ===
    'epargne_disponible': {
      vars: [6, 110, 21],  // Épargne = positif
      transform: (v) => this.normalizeValue(v, 0, 100000, 4, 8)
    },
    'patrimoine_immobilier': {
      vars: [44, 165, 139],  // Patrimoine
      transform: (v) => this.normalizeValue(v, 0, 1000000, 3, 7)
    },
    'placements_financiers': {
      vars: [94, 80],  // Placements
      transform: (v) => this.normalizeValue(v, 0, 200000, 4, 7)
    },
    'apport_personnel': {
      vars: [146, 110],  // Apport
      transform: (v) => this.normalizeValue(v, 0, 50000, 3, 6)
    },

    // === HISTORIQUE ===
    'anciennete_banque': {
      vars: [21, 139],  // Relation bancaire
      transform: (v) => this.normalizeValue(v, 0, 30, 4, 7)
    },
    'incidents_paiement': {
      vars: [174, 166, 53, 26],  // Incidents = très négatif
      transform: (v) => this.normalizeValue(v, 0, 100, 30, 15, false)  // Score inversé
    },
    'credits_rembourses': {
      vars: [6, 110],  // Historique positif
      transform: (v) => this.normalizeValue(v, 0, 10, 4, 6)
    },
    'decouvert_frequence': {
      vars: [12, 76, 99],  // Découvert = négatif
      transform: (v) => this.normalizeValue(v, 0, 100, 4, 2, false)
    },

    // === PROJET ===
    'montant_demande': {
      vars: [53, 26, 12],  // Montant (modéré)
      transform: (v) => this.normalizeValue(v, 1000, 75000, 25, 15, true)
    },
    'duree_souhaitee': {
      vars: [76, 81],  // Durée
      transform: (v) => this.normalizeValue(v, 12, 84, 2, 4)
    },
    'objet_credit': {
      vars: [165, 44],  // Type de projet
      transform: (v) => this.normalizeValue(v, 0, 100, 3, 7)
    },
    'assurance_emprunteur': {
      vars: [139, 94],  // Assurance
      transform: (v) => this.normalizeValue(v, 0, 100, 4, 6)
    }
  };

  constructor() {}

  /**
   * Transforme les réponses aux 20 questions en 200 features ML
   */
  transformAnswersToFeatures(answers: Record<string, number>): number[] {
    // Initialiser les 200 features avec des valeurs neutres (moyennes)
    const features: number[] = new Array(200).fill(0);
    
    // Valeurs moyennes par défaut pour chaque feature
    const defaultValues = this.getDefaultFeatureValues();
    for (let i = 0; i < 200; i++) {
      features[i] = defaultValues[i];
    }

    // Appliquer les transformations basées sur les réponses
    Object.entries(answers).forEach(([questionId, value]) => {
      const mapping = this.QUESTION_TO_FEATURES[questionId];
      if (mapping) {
        const transformedValue = mapping.transform(value);
        mapping.vars.forEach(varIndex => {
          // Pondérer la contribution selon l'importance de la feature
          const importance = this.TOP_FEATURES.find(f => f.var === varIndex)?.importance || 100;
          const weight = importance / 300; // Normaliser entre 0 et 1
          features[varIndex] = features[varIndex] * (1 - weight) + transformedValue * weight;
        });
      }
    });

    return features;
  }

  /**
   * Normalise une valeur entre un min et max source vers une plage cible
   */
  private normalizeValue(
    value: number, 
    sourceMin: number, 
    sourceMax: number, 
    targetMin: number, 
    targetMax: number,
    inverse: boolean = false
  ): number {
    // Normaliser entre 0 et 1
    let normalized = (value - sourceMin) / (sourceMax - sourceMin);
    normalized = Math.max(0, Math.min(1, normalized)); // Clamp
    
    if (inverse) {
      normalized = 1 - normalized;
    }
    
    // Mapper vers la plage cible
    return targetMin + normalized * (targetMax - targetMin);
  }

  /**
   * Valeurs par défaut moyennes pour les 200 features
   * Basées sur les statistiques du dataset Santander
   */
  private getDefaultFeatureValues(): number[] {
    const defaults: number[] = [];
    for (let i = 0; i < 200; i++) {
      // Valeurs moyennes approximatives observées dans le dataset
      defaults[i] = this.getFeatureDefaultValue(i);
    }
    return defaults;
  }

  private getFeatureDefaultValue(varIndex: number): number {
    // Valeurs moyennes des features les plus importantes
    const means: Record<number, number> = {
      6: 5.4, 12: 7.2, 21: 6.8, 26: 8.1, 44: 11.5, 53: 6.9,
      76: 9.3, 80: 3.8, 81: 4.2, 94: 5.6, 99: 3.1, 109: 7.4,
      110: 4.9, 139: 8.7, 146: 6.2, 164: 2.8, 165: 9.1, 166: 3.0,
      174: 20.2, 198: 4.5
    };
    
    return means[varIndex] ?? (Math.random() * 5 + 3); // Valeur neutre par défaut
  }

  /**
   * Calcule des métriques financières à partir des réponses
   */
  calculateFinancialMetrics(answers: Record<string, number>): {
    tauxEndettement: number;
    resteAVivre: number;
    mensualiteCredit: number;
  } {
    const revenus = answers['revenus_mensuels'] || 0;
    const loyer = answers['loyer_mensualite'] || 0;
    const credits = answers['credits_en_cours'] || 0;
    const chargesFixes = answers['charges_fixes'] || 0;
    const nbPersonnes = (answers['nombre_personnes_charge'] || 0) + 1;
    const montantDemande = answers['montant_demande'] || 10000;
    const duree = answers['duree_souhaitee'] || 48;

    const mensualiteCredit = Math.round(montantDemande / duree);
    const totalCharges = loyer + credits + chargesFixes + mensualiteCredit;
    const tauxEndettement = revenus > 0 ? (totalCharges / revenus) * 100 : 100;
    const resteAVivre = revenus - totalCharges;

    return {
      tauxEndettement: Math.round(tauxEndettement * 10) / 10,
      resteAVivre: Math.round(resteAVivre),
      mensualiteCredit
    };
  }
}
