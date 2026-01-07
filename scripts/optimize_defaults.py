"""
Script pour générer les valeurs par défaut optimisées
qui donnent un score de base autour de 50-60/100
"""
import pandas as pd
import numpy as np
import joblib
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

print("=" * 60)
print("🎯 GÉNÉRATION DES VALEURS PAR DÉFAUT OPTIMISÉES")
print("=" * 60)

# Charger les données et le modèle
print("\n📥 Chargement...")
train = pd.read_csv(os.path.join(DATA_DIR, 'train.csv'))
model = joblib.load(os.path.join(MODELS_DIR, 'best_model.pkl'))
scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler.pkl'))

feature_names = [f'var_{i}' for i in range(200)]
accepted = train[train['target'] == 1]

# Paramètres de scoring
p_min = 0.006125
p_max = 0.723838

def probability_to_score(prob):
    clipped = max(min(prob, p_max), p_min)
    return ((clipped - p_min) / (p_max - p_min)) * 100

def get_score(features):
    scaled = scaler.transform([features])
    prob = model.predict_proba(scaled)[0, 1]
    return probability_to_score(prob), prob

# Charger le mapping des features
with open(os.path.join(MODELS_DIR, 'feature_mapping.json'), 'r') as f:
    feature_mapping = json.load(f)

# Commencer avec les moyennes des acceptés
base_features = [float(accepted[f].mean()) for f in feature_names]
score, prob = get_score(base_features)
print(f"\n📊 Score de base (moyennes acceptés): {score:.1f}/100 (prob: {prob:.2%})")

# Optimiser les top 20 features vers les valeurs optimales
optimized = base_features.copy()

print("\n🔧 Optimisation des top features...")
for fm in feature_mapping:
    var_idx = fm['var_index']
    direction = fm['direction']
    
    # Pour chaque feature, utiliser une valeur intermédiaire entre la moyenne et l'optimale
    if direction == 'higher':
        # Valeur plus haute = mieux -> utiliser P65 des acceptés
        optimal_val = accepted[f'var_{var_idx}'].quantile(0.65)
    else:
        # Valeur plus basse = mieux -> utiliser P35 des acceptés
        optimal_val = accepted[f'var_{var_idx}'].quantile(0.35)
    
    optimized[var_idx] = float(optimal_val)

score_opt, prob_opt = get_score(optimized)
print(f"📊 Score après optimisation: {score_opt:.1f}/100 (prob: {prob_opt:.2%})")

# Si le score est trop haut, on modère un peu
if score_opt > 70:
    # Mélanger avec les moyennes pour avoir ~55-60
    alpha = 0.5  # 50% optimisé, 50% base
    mixed = [alpha * optimized[i] + (1-alpha) * base_features[i] for i in range(200)]
    score_mixed, prob_mixed = get_score(mixed)
    print(f"📊 Score mixte (50/50): {score_mixed:.1f}/100 (prob: {prob_mixed:.2%})")
    final_features = mixed
else:
    final_features = optimized

# Génération du TypeScript
print("\n📝 Génération du fichier TypeScript...")

ts_code = f'''// ===========================================================
// FICHIER GÉNÉRÉ AUTOMATIQUEMENT LE {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}
// VALEURS PAR DÉFAUT OPTIMISÉES POUR UN SCORE DE ~{get_score(final_features)[0]:.0f}/100
// ===========================================================

/**
 * Paramètres de transformation probabilité → score (0-100)
 */
export const SCORING_PARAMS = {{
  pMin: {p_min:.6f},
  pMax: {p_max:.6f}
}};

/**
 * Transforme une probabilité brute en score de crédit 0-100
 */
export function probabilityToScore(probability: number): number {{
  const clipped = Math.min(Math.max(probability, SCORING_PARAMS.pMin), SCORING_PARAMS.pMax);
  return ((clipped - SCORING_PARAMS.pMin) / (SCORING_PARAMS.pMax - SCORING_PARAMS.pMin)) * 100;
}}

/**
 * Seuils de décision recommandés (en points sur 100)
 */
export const SCORE_THRESHOLDS = {{
  veryStrict: 70,  // Très peu de crédits accordés
  strict: 60,      // Politique restrictive
  normal: 50,      // Équilibré
  lenient: 40      // Politique souple
}};

/**
 * Valeurs par défaut OPTIMISÉES pour les 200 features
 * Score de départ attendu: ~{get_score(final_features)[0]:.0f}/100
 */
export const DEFAULT_FEATURES: number[] = [
'''

# Formater par lignes de 10
for i in range(0, 200, 10):
    line_vals = [f"{final_features[j]:.2f}" for j in range(i, min(i+10, 200))]
    ts_code += "  " + ", ".join(line_vals)
    if i + 10 < 200:
        ts_code += ",\n"
    else:
        ts_code += "\n"

ts_code += "];\n\n"

# Ajouter l'interface et les questions
ts_code += """/**
 * Interface pour les questions bancaires
 */
export interface BankQuestion {
  id: string;
  varIndex: number;
  category: string;
  question: string;
  type: 'number' | 'select' | 'range';
  min: number;
  max: number;
  step?: number;
  unit?: string;
  options?: {label: string, value: number}[];
  helpText?: string;
  impactPoints: number;
  direction: 'higher' | 'lower';
  optimalValue: number;
}

/**
 * Questions bancaires basées sur les 20 features les plus importantes
 */
export const BANK_QUESTIONS: BankQuestion[] = [
"""

# Labels pour les questions
question_labels = {
    'var_174': {'q': 'Valeur du patrimoine immobilier', 'cat': 'Patrimoine', 'unit': 'k€'},
    'var_6': {'q': 'Situation matrimoniale', 'cat': 'Personnel', 'unit': ''},
    'var_166': {'q': 'Ratio prêt/valeur', 'cat': 'Crédit', 'unit': '%'},
    'var_34': {'q': 'Niveau de qualification', 'cat': 'Emploi', 'unit': ''},
    'var_146': {'q': 'Revenus mensuels nets', 'cat': 'Revenus', 'unit': 'k€'},
    'var_22': {'q': 'Ancienneté bancaire', 'cat': 'Historique', 'unit': 'ans'},
    'var_190': {'q': 'Investissements financiers', 'cat': 'Patrimoine', 'unit': 'k€'},
    'var_76': {'q': 'Épargne disponible', 'cat': 'Finances', 'unit': 'k€'},
    'var_53': {'q': 'Stabilité résidentielle', 'cat': 'Personnel', 'unit': 'ans'},
    'var_1': {'q': 'Variation des revenus', 'cat': 'Revenus', 'unit': '%'},
    'var_12': {'q': 'Ancienneté professionnelle', 'cat': 'Emploi', 'unit': 'ans'},
    'var_139': {'q': 'Solde moyen compte', 'cat': 'Finances', 'unit': 'k€'},
    'var_21': {'q': 'Charges mensuelles fixes', 'cat': 'Finances', 'unit': 'k€'},
    'var_170': {'q': 'Capacité remboursement', 'cat': 'Crédit', 'unit': '%'},
    'var_165': {'q': 'Encours de crédits', 'cat': 'Endettement', 'unit': 'k€'},
    'var_78': {'q': 'Historique épargne', 'cat': 'Finances', 'unit': ''},
    'var_13': {'q': 'Nombre de crédits remboursés', 'cat': 'Historique', 'unit': ''},
    'var_40': {'q': 'Solde compte courant', 'cat': 'Finances', 'unit': 'k€'},
    'var_33': {'q': 'Niveau de revenus', 'cat': 'Revenus', 'unit': ''},
    'var_191': {'q': 'Score de solvabilité', 'cat': 'Crédit', 'unit': ''},
}

for fm in feature_mapping[:20]:
    feat = f"var_{fm['var_index']}"
    labels = question_labels.get(feat, {'q': f"Variable {feat}", 'cat': 'Autre', 'unit': ''})
    
    ts_code += f"""  {{
    id: '{feat}',
    varIndex: {fm['var_index']},
    category: '{labels['cat']}',
    question: '{labels['q']}',
    type: 'range',
    min: {fm['min_all'] if 'min_all' in fm else fm.get('min', 0):.2f},
    max: {fm['max_all'] if 'max_all' in fm else fm.get('max', 100):.2f},
    step: {(fm['max_all'] - fm['min_all']) / 20 if 'min_all' in fm and 'max_all' in fm else 1:.2f},
    unit: '{labels['unit']}',
    helpText: 'Direction: {fm["direction"]} = mieux. Valeur optimale: {fm.get("mean_accepted", fm.get("optimal_value", 0)):.1f}',
    impactPoints: {fm.get('impact_points', 5):.1f},
    direction: '{fm["direction"]}',
    optimalValue: {fm.get('mean_accepted', fm.get('optimal_value', 0)):.2f}
  }},
"""

ts_code += "];\n"

# Sauvegarder
ts_path = os.path.join(BASE_DIR, 'credit-scoring-app', 'src', 'app', 'services', 'generated-defaults.ts')
with open(ts_path, 'w') as f:
    f.write(ts_code)

print(f"   ✅ {ts_path}")

# Test final
final_score, final_prob = get_score(final_features)
print(f"\n📊 Score final des valeurs par défaut: {final_score:.1f}/100")
print(f"   Probabilité: {final_prob:.2%}")

print("\n" + "=" * 60)
print("✅ TERMINÉ!")
print("=" * 60)
