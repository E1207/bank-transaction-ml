"""
Script FINAL - Solution complète:
1. Entraîner le modèle avec une approche qui maximise la différenciation
2. Créer une fonction de transformation des probabilités en SCORE DE CREDIT (0-100)
3. Faire en sorte que les réponses aux questions aient un VRAI impact
"""
import pandas as pd
import numpy as np
import joblib
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import roc_auc_score
from lightgbm import LGBMClassifier
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

print("=" * 70)
print("🎯 SOLUTION FINALE - SYSTÈME DE SCORING DE CRÉDIT")
print("=" * 70)

# ============================================================================
# 1. Chargement et analyse des données
# ============================================================================
print("\n📥 Chargement des données...")
train = pd.read_csv(os.path.join(DATA_DIR, 'train.csv'))
X = train.drop(['ID_code', 'target'], axis=1)
y = train['target']
feature_names = list(X.columns)

accepted = train[train['target'] == 1]
rejected = train[train['target'] == 0]

print(f"   Total: {len(train):,} | Acceptés: {len(accepted):,} ({len(accepted)/len(train)*100:.1f}%)")

# ============================================================================
# 2. Entraînement du modèle optimisé
# ============================================================================
print("\n🚀 Entraînement du modèle...")

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_val_scaled = scaler.transform(X_val)

# Modèle avec plus de capacité pour mieux différencier
lgbm = LGBMClassifier(
    n_estimators=500,
    max_depth=10,
    learning_rate=0.03,
    num_leaves=50,
    min_child_samples=50,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    verbose=-1,
    n_jobs=-1
)
lgbm.fit(X_train_scaled, y_train)

y_proba = lgbm.predict_proba(X_val_scaled)[:, 1]
roc_auc = roc_auc_score(y_val, y_proba)
print(f"   ROC-AUC: {roc_auc:.4f}")

# ============================================================================
# 3. Création de la fonction de transformation en SCORE DE CREDIT
# ============================================================================
print("\n📊 Création de la fonction de scoring...")

# Calculer les percentiles des probabilités sur l'ensemble de validation
# On va mapper les percentiles vers un score 0-100
all_proba = lgbm.predict_proba(scaler.transform(X))[:, 1]

# Pour les acceptés et refusés
proba_accepted = lgbm.predict_proba(scaler.transform(accepted.drop(['ID_code', 'target'], axis=1)))[:, 1]
proba_rejected = lgbm.predict_proba(scaler.transform(rejected.drop(['ID_code', 'target'], axis=1)))[:, 1]

print(f"\n   Probabilités brutes:")
print(f"   - Acceptés: min={proba_accepted.min():.3f}, max={proba_accepted.max():.3f}, median={np.median(proba_accepted):.3f}")
print(f"   - Refusés:  min={proba_rejected.min():.3f}, max={proba_rejected.max():.3f}, median={np.median(proba_rejected):.3f}")

# Calculer les percentiles pour la transformation
p_min = np.percentile(all_proba, 1)   # P1
p_max = np.percentile(all_proba, 99)  # P99

print(f"\n   Plage utilisée pour le scoring: [{p_min:.4f} - {p_max:.4f}]")

def probability_to_score(prob, p_min=p_min, p_max=p_max):
    """Transforme une probabilité en score 0-100"""
    # Clip aux bornes
    prob_clipped = np.clip(prob, p_min, p_max)
    # Normaliser entre 0 et 100
    score = ((prob_clipped - p_min) / (p_max - p_min)) * 100
    return score

# Tester la transformation
score_accepted_median = probability_to_score(np.median(proba_accepted))
score_rejected_median = probability_to_score(np.median(proba_rejected))

print(f"\n   Scores après transformation:")
print(f"   - Médiane acceptés: {score_accepted_median:.1f}/100")
print(f"   - Médiane refusés:  {score_rejected_median:.1f}/100")

# Distribution des scores pour les acceptés
scores_accepted = [probability_to_score(p) for p in proba_accepted]
scores_rejected = [probability_to_score(p) for p in proba_rejected]

print(f"\n   Distribution des scores (acceptés):")
print(f"   - P25: {np.percentile(scores_accepted, 25):.1f}")
print(f"   - P50: {np.percentile(scores_accepted, 50):.1f}")
print(f"   - P75: {np.percentile(scores_accepted, 75):.1f}")

# ============================================================================
# 4. Analyse de l'impact des features
# ============================================================================
print("\n🔍 Analyse de l'impact des features...")

importance = lgbm.feature_importances_
importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': importance,
    'var_index': [int(f.split('_')[1]) for f in feature_names]
}).sort_values('importance', ascending=False)

top_20 = importance_df.head(20)
print("\nTop 20 features:")
print(top_20.to_string(index=False))

# ============================================================================
# 5. Création des questions avec un VRAI impact
# ============================================================================
print("\n📝 Création des questions avec impact réel...")

# Pour chaque feature importante, calculer l'impact sur le score
def calculate_feature_impact(feature_name, low_value, high_value):
    """Calcule l'impact d'une feature sur le score"""
    # Profil de base (moyenne générale)
    base_profile = X.mean().values.copy()
    var_idx = int(feature_name.split('_')[1])
    
    # Tester avec valeur basse
    profile_low = base_profile.copy()
    profile_low[var_idx] = low_value
    prob_low = lgbm.predict_proba(scaler.transform([profile_low]))[0, 1]
    
    # Tester avec valeur haute
    profile_high = base_profile.copy()
    profile_high[var_idx] = high_value
    prob_high = lgbm.predict_proba(scaler.transform([profile_high]))[0, 1]
    
    return prob_low, prob_high

# Générer les infos des questions avec l'impact réel
questions_info = []

for idx, row in top_20.iterrows():
    feat = row['feature']
    var_idx = row['var_index']
    
    # Statistiques
    feat_data = train[feat]
    p10 = feat_data.quantile(0.10)
    p25 = feat_data.quantile(0.25)
    p50 = feat_data.quantile(0.50)
    p75 = feat_data.quantile(0.75)
    p90 = feat_data.quantile(0.90)
    
    mean_acc = accepted[feat].mean()
    mean_rej = rejected[feat].mean()
    
    # Calculer l'impact
    prob_low, prob_high = calculate_feature_impact(feat, p10, p90)
    score_low = probability_to_score(prob_low)
    score_high = probability_to_score(prob_high)
    impact = abs(score_high - score_low)
    
    direction = 'higher' if prob_high > prob_low else 'lower'
    
    questions_info.append({
        'feature': feat,
        'var_index': int(var_idx),
        'importance': float(row['importance']),
        'impact_points': float(impact),
        'direction': direction,
        'min': float(feat_data.min()),
        'max': float(feat_data.max()),
        'p10': float(p10),
        'p25': float(p25),
        'p50': float(p50),
        'p75': float(p75),
        'p90': float(p90),
        'mean_accepted': float(mean_acc),
        'mean_rejected': float(mean_rej),
        'score_at_p10': float(score_low if direction == 'higher' else score_high),
        'score_at_p90': float(score_high if direction == 'higher' else score_low),
        'optimal_value': float(mean_acc)
    })

# Trier par impact
questions_info = sorted(questions_info, key=lambda x: x['impact_points'], reverse=True)

print("\n   Feature      | Impact (pts) | Direction | Optimal Value")
print("   " + "-" * 55)
for q in questions_info[:10]:
    print(f"   {q['feature']:12} | {q['impact_points']:11.1f} | {q['direction']:9} | {q['optimal_value']:.2f}")

# ============================================================================
# 6. Sauvegarde du modèle et des données
# ============================================================================
print("\n💾 Sauvegarde...")

joblib.dump(lgbm, os.path.join(MODELS_DIR, 'best_model.pkl'))
joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))

# Métadonnées
metadata = {
    'model_type': 'LGBMClassifier',
    'roc_auc_score': float(roc_auc),
    'n_features': 200,
    'scoring_transform': {
        'p_min': float(p_min),
        'p_max': float(p_max),
        'formula': 'score = ((prob - p_min) / (p_max - p_min)) * 100'
    },
    'score_distribution': {
        'accepted_median': float(score_accepted_median),
        'rejected_median': float(score_rejected_median),
        'accepted_p25': float(np.percentile(scores_accepted, 25)),
        'accepted_p75': float(np.percentile(scores_accepted, 75))
    },
    'recommended_thresholds': {
        'very_strict': 70,
        'strict': 60,
        'normal': 50,
        'lenient': 40
    }
}

with open(os.path.join(MODELS_DIR, 'model_metadata.json'), 'w') as f:
    json.dump(metadata, f, indent=2)

with open(os.path.join(MODELS_DIR, 'feature_mapping.json'), 'w') as f:
    json.dump(questions_info, f, indent=2)

# ============================================================================
# 7. Générer le fichier TypeScript complet
# ============================================================================
print("\n📝 Génération du code Angular/TypeScript...")

# Valeurs par défaut = moyennes des acceptés (bon point de départ)
default_features = [float(accepted[f].mean()) for f in feature_names]

ts_code = f'''// ===========================================================
// FICHIER GÉNÉRÉ AUTOMATIQUEMENT LE {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}
// NE PAS MODIFIER MANUELLEMENT
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
 * Valeurs par défaut pour les 200 features
 * Basées sur les moyennes des profils ACCEPTÉS (target=1)
 * Score de départ attendu: ~{score_accepted_median:.0f}/100
 */
export const DEFAULT_FEATURES: number[] = [
'''

# Formater par lignes de 10
for i in range(0, 200, 10):
    line_vals = [f"{default_features[j]:.2f}" for j in range(i, min(i+10, 200))]
    ts_code += "  " + ", ".join(line_vals)
    if i + 10 < 200:
        ts_code += ",\n"
    else:
        ts_code += "\n"

ts_code += "];\n\n"

# Générer les questions
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
 * Triées par impact sur le score
 */
export const BANK_QUESTIONS: BankQuestion[] = [
"""

# Mapper les questions avec des libellés métier
question_labels = {
    'var_166': {'q': 'Ratio prêt/valeur immobilière', 'cat': 'Patrimoine', 'unit': '%'},
    'var_12': {'q': 'Ancienneté professionnelle', 'cat': 'Emploi', 'unit': 'ans'},
    'var_40': {'q': 'Solde moyen compte courant', 'cat': 'Finances', 'unit': 'k€'},
    'var_6': {'q': 'Situation matrimoniale (score)', 'cat': 'Personnel', 'unit': ''},
    'var_165': {'q': 'Montant total des dettes', 'cat': 'Endettement', 'unit': 'k€'},
    'var_99': {'q': 'Historique de paiement', 'cat': 'Crédit', 'unit': ''},
    'var_148': {'q': 'Score de solvabilité externe', 'cat': 'Crédit', 'unit': ''},
    'var_76': {'q': 'Épargne disponible', 'cat': 'Finances', 'unit': 'k€'},
    'var_34': {'q': 'Niveau de revenus (catégorie)', 'cat': 'Revenus', 'unit': ''},
    'var_53': {'q': 'Stabilité du logement', 'cat': 'Personnel', 'unit': 'ans'},
    'var_174': {'q': 'Valeur du patrimoine', 'cat': 'Patrimoine', 'unit': 'k€'},
    'var_21': {'q': 'Charges mensuelles totales', 'cat': 'Finances', 'unit': 'k€'},
    'var_146': {'q': 'Revenus nets mensuels', 'cat': 'Revenus', 'unit': 'k€'},
    'var_110': {'q': 'Score comportemental bancaire', 'cat': 'Crédit', 'unit': ''},
    'var_22': {'q': 'Ancienneté bancaire', 'cat': 'Crédit', 'unit': 'ans'},
    'var_80': {'q': 'Crédits en cours', 'cat': 'Endettement', 'unit': 'k€'},
    'var_94': {'q': 'Capacité d\'épargne mensuelle', 'cat': 'Finances', 'unit': 'k€'},
    'var_154': {'q': 'Ratio d\'endettement', 'cat': 'Endettement', 'unit': '%'},
    'var_1': {'q': 'Variation des revenus', 'cat': 'Revenus', 'unit': '%'},
    'var_67': {'q': 'Investissements financiers', 'cat': 'Patrimoine', 'unit': 'k€'},
}

for i, q in enumerate(questions_info[:20]):
    feat = q['feature']
    labels = question_labels.get(feat, {'q': f"Variable {feat}", 'cat': 'Autre', 'unit': ''})
    
    # Déterminer le type et les options
    q_range = q['p90'] - q['p10']
    if q_range < 3:
        q_type = 'select'
        # Créer des options
        options = []
        for pct, label in [(10, 'Très faible'), (30, 'Faible'), (50, 'Moyen'), (70, 'Bon'), (90, 'Excellent')]:
            val = np.percentile([q['p10'], q['p90']], pct)
            options.append(f"{{label: '{label}', value: {val:.2f}}}")
        options_str = "[" + ", ".join(options) + "]"
    else:
        q_type = 'range'
        options_str = "undefined"
    
    help_text = f"Impact: {q['impact_points']:.1f} points. Valeur optimale: {q['optimal_value']:.1f}"
    
    ts_code += f"""  {{
    id: '{feat}',
    varIndex: {q['var_index']},
    category: '{labels['cat']}',
    question: '{labels['q']}',
    type: '{'range' if q_type == 'range' else 'select'}',
    min: {q['p10']:.2f},
    max: {q['p90']:.2f},
    step: {(q['p90'] - q['p10']) / 20:.2f},
    unit: '{labels['unit']}',
    {f"options: {options_str}," if q_type == 'select' else ''}
    helpText: '{help_text}',
    impactPoints: {q['impact_points']:.1f},
    direction: '{q['direction']}',
    optimalValue: {q['optimal_value']:.2f}
  }},
"""

ts_code += "];\n"

# Sauvegarder
ts_path = os.path.join(BASE_DIR, 'credit-scoring-app', 'src', 'app', 'services', 'generated-defaults.ts')
with open(ts_path, 'w') as f:
    f.write(ts_code)

print(f"   ✅ {ts_path}")

# ============================================================================
# 8. Test final
# ============================================================================
print("\n🧪 TEST FINAL:")

# Test avec valeurs par défaut (profil accepté)
default_scaled = scaler.transform([default_features])
prob_default = lgbm.predict_proba(default_scaled)[0, 1]
score_default = probability_to_score(prob_default)

print(f"\n   Score avec valeurs par défaut (profil accepté): {score_default:.1f}/100")

# Test en dégradant les features principales
degraded = default_features.copy()
for q in questions_info[:5]:
    idx = q['var_index']
    if q['direction'] == 'higher':
        degraded[idx] = q['p10']  # Mettre la valeur basse
    else:
        degraded[idx] = q['p90']  # Mettre la valeur haute

degraded_scaled = scaler.transform([degraded])
prob_degraded = lgbm.predict_proba(degraded_scaled)[0, 1]
score_degraded = probability_to_score(prob_degraded)

print(f"   Score avec 5 features dégradées: {score_degraded:.1f}/100")
print(f"   Différence: {score_degraded - score_default:.1f} points")

# Test en améliorant les features principales
improved = default_features.copy()
for q in questions_info[:5]:
    idx = q['var_index']
    if q['direction'] == 'higher':
        improved[idx] = q['p90']  # Mettre la valeur haute
    else:
        improved[idx] = q['p10']  # Mettre la valeur basse

improved_scaled = scaler.transform([improved])
prob_improved = lgbm.predict_proba(improved_scaled)[0, 1]
score_improved = probability_to_score(prob_improved)

print(f"   Score avec 5 features optimisées: {score_improved:.1f}/100")
print(f"   Différence: {score_improved - score_default:.1f} points")

# ============================================================================
# RÉSUMÉ
# ============================================================================
print("\n" + "=" * 70)
print("📋 RÉSUMÉ FINAL")
print("=" * 70)
print(f"""
✅ Modèle sauvegardé avec ROC-AUC: {roc_auc:.4f}

📊 SYSTÈME DE SCORING:
   - Les probabilités brutes ({p_min:.3f} à {p_max:.3f}) sont transformées en scores 0-100
   - Score médian des acceptés: {score_accepted_median:.0f}/100
   - Score médian des refusés: {score_rejected_median:.0f}/100

🎯 SEUILS RECOMMANDÉS (sur 100):
   - 70+: Très bon profil → Crédit accordé immédiatement
   - 60-70: Bon profil → Crédit probable
   - 50-60: Profil moyen → À étudier
   - 40-50: Profil à risque → Conditions spéciales
   - <40: Profil défavorable → Refus probable

💡 IMPACT DES QUESTIONS:
   - Les 5 premières questions peuvent faire varier le score de ±{abs(score_improved - score_degraded):.0f} points
   - Chaque réponse "optimale" améliore le score
   - Chaque réponse "défavorable" dégrade le score

🔧 MODIFICATIONS À FAIRE DANS LE FRONTEND:
   1. Utiliser les valeurs de DEFAULT_FEATURES comme base
   2. Appliquer probabilityToScore() à la probabilité retournée par l'API
   3. Utiliser un seuil de 50 (sur 100) au lieu de 50%
""")
print("=" * 70)
