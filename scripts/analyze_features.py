"""
Script pour analyser l'importance des features et créer un questionnaire adapté
"""
import pandas as pd
import numpy as np
import joblib
import json

# Charger le modèle et les données
model = joblib.load('../models/best_model.pkl')
scaler = joblib.load('../models/scaler.pkl')

print("📊 Analyse de l'importance des features...\n")

# Vérifier le type de modèle
model_type = type(model).__name__
print(f"Type de modèle : {model_type}")

# Extraire l'importance des features
if hasattr(model, 'coef_'):
    # Régression Logistique - coefficients
    feature_importance = np.abs(model.coef_[0])
    print("✅ Utilisation des coefficients (Logistic Regression)")
elif hasattr(model, 'feature_importances_'):
    # Random Forest, XGBoost, etc.
    feature_importance = model.feature_importances_
    print("✅ Utilisation de feature_importances_")
else:
    print("❌ Impossible d'extraire l'importance des features")
    exit(1)

# Créer un DataFrame avec les importances
feature_names = [f'var_{i}' for i in range(200)]
importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': feature_importance,
    'abs_importance': np.abs(feature_importance)
}).sort_values('abs_importance', ascending=False)

# Afficher le TOP 20
print("\n🔝 TOP 20 Features les plus importantes :\n")
print(importance_df.head(20).to_string(index=False))

# Charger quelques exemples du dataset pour voir les plages de valeurs
print("\n📈 Chargement du dataset pour analyser les distributions...")
train = pd.read_csv('../data/train.csv')

# Analyser les TOP 20 features
top_features = importance_df.head(20)['feature'].tolist()

print("\n📊 Statistiques des TOP 20 features :\n")
stats = train[top_features].describe()
print(stats.to_string())

# Créer un mapping logique (fiction) basé sur les caractéristiques statistiques
# On va créer des catégories logiques
mapping = []

for idx, row in importance_df.head(20).iterrows():
    feature = row['feature']
    var_idx = int(feature.split('_')[1])
    
    stats = train[feature].describe()
    mean = stats['mean']
    std = stats['std']
    min_val = stats['min']
    max_val = stats['max']
    
    # Attribution fictive mais logique basée sur les statistiques
    # Variables avec faible variance -> données démographiques fixes
    # Variables avec forte variance -> montants financiers
    
    if std < 2:
        category = "Démographique"
        if var_idx < 50:
            label = f"Situation familiale/Âge"
            input_type = "select"
        else:
            label = f"Statut emploi/Formation"
            input_type = "select"
    elif std < 5:
        category = "Historique"
        label = f"Historique bancaire/Crédit"
        input_type = "range"
    else:
        category = "Financier"
        if abs(mean) < 5:
            label = f"Ratio financier"
            input_type = "range"
        else:
            label = f"Montant/Solde"
            input_type = "number"
    
    mapping.append({
        'feature': feature,
        'var_index': var_idx,
        'importance': float(row['importance']),
        'category': category,
        'label': label,
        'input_type': input_type,
        'min': float(min_val),
        'max': float(max_val),
        'mean': float(mean),
        'std': float(std)
    })

# Sauvegarder le mapping
with open('../models/feature_mapping.json', 'w') as f:
    json.dump(mapping, f, indent=2)

print("\n✅ Mapping des features sauvegardé dans models/feature_mapping.json")

# Créer un questionnaire structuré
questionnaire = {
    "demographic": [],
    "financial": [],
    "history": []
}

for item in mapping:
    if item['category'] == "Démographique":
        questionnaire["demographic"].append(item)
    elif item['category'] == "Financier":
        questionnaire["financial"].append(item)
    else:
        questionnaire["history"].append(item)

with open('../models/questionnaire.json', 'w') as f:
    json.dump(questionnaire, f, indent=2)

print("✅ Questionnaire structuré sauvegardé dans models/questionnaire.json")

print(f"\n📋 Résumé :")
print(f"   - Démographique : {len(questionnaire['demographic'])} questions")
print(f"   - Financier     : {len(questionnaire['financial'])} questions")
print(f"   - Historique    : {len(questionnaire['history'])} questions")
print(f"   - TOTAL         : {len(mapping)} questions (au lieu de 200)")

print("\n💡 Les 180 autres variables seront remplies automatiquement avec les valeurs moyennes du dataset.")
