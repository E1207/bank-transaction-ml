# 📊 Data Directory

Ce dossier contient les datasets Santander.

## Fichiers attendus:

- `train.csv` - Dataset d'entraînement (~200,000 lignes)
- `test.csv` - Dataset de test

## Téléchargement:

Exécutez le script suivant pour télécharger les données depuis Kaggle:

```bash
python scripts/download_data.py
```

**Note**: Vous devez avoir configuré votre API Kaggle au préalable.

## Structure des données:

### train.csv
- `ID_code` - Identifiant unique
- `target` - Variable cible (0 ou 1)
- `var_0` à `var_199` - 200 features anonymisées

### test.csv
- `ID_code` - Identifiant unique
- `var_0` à `var_199` - 200 features anonymisées

**Note**: Les fichiers CSV sont volumineux et sont ignorés par Git (voir .gitignore)
