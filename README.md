# 🏦 Santander Customer Transaction Prediction

## 📊 Description du Projet

Application complète de Machine Learning pour prédire si un client effectuera une transaction bancaire.

### Dataset
- **Source** : [Kaggle - Santander Customer Transaction Prediction](https://www.kaggle.com/c/santander-customer-transaction-prediction)
- **Type** : Classification binaire
- **Features** : 200 variables anonymisées (var_0 à var_199)
- **Observations** : ~200,000 lignes

## 🏗️ Architecture

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   PHASE 1: ML    │─────▶│  PHASE 2: API    │─────▶│ PHASE 3: FRONT   │
│                  │      │                  │      │                  │
│ • Exploration    │      │ • Flask REST API │      │ • Streamlit/     │
│ • Preprocessing  │      │ • Endpoints      │      │   Flask/Django   │
│ • Training       │      │ • Predictions    │      │ • Interface web  │
│ • Evaluation     │      │ • JSON Response  │      │ • Visualisation  │
│ • Model Save     │      │                  │      │                  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

## 📁 Structure du Projet

```
bank-transaction-ml/
├── data/                   # Données brutes
├── notebooks/              # Notebooks Jupyter
├── models/                 # Modèles sauvegardés
├── api/                    # API Flask
├── frontend/               # Interface utilisateur
├── scripts/                # Scripts utilitaires
└── README.md
```

## 🚀 Installation

### 1. Créer l'environnement virtuel
```bash
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
```

### 2. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 3. Configurer Kaggle API
```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

### 4. Télécharger les données
```bash
python scripts/download_data.py
```

## 📓 Phase 1 : Machine Learning

### Notebooks disponibles :
1. **01_exploration.ipynb** - Analyse exploratoire des données
2. **02_preprocessing.ipynb** - Nettoyage et feature engineering
3. **03_modeling.ipynb** - Entraînement et évaluation des modèles

```bash
jupyter notebook notebooks/
```

## 🔌 Phase 2 : API REST

### Lancer l'API Flask
```bash
cd api
python app.py
```

L'API sera disponible sur `http://localhost:5000`

### Endpoints :
- `GET /` - Page d'accueil
- `POST /predict` - Prédiction de transaction

## 🎨 Phase 3 : Interface Web

### Option 1 : Streamlit (Recommandé)
```bash
cd frontend
streamlit run streamlit_app.py
```

### Option 2 : Flask
```bash
cd frontend/flask_app
python app.py
```

## 🧪 Tests

```bash
python api/test_api.py
```

## 📊 Résultats Attendus

- **Modèles** : XGBoost, Random Forest, LightGBM
- **Métrique principale** : ROC-AUC Score
- **Target** : AUC > 0.85

## 🛠️ Technologies Utilisées

- **ML** : scikit-learn, XGBoost, LightGBM
- **Data** : pandas, numpy
- **Visualisation** : matplotlib, seaborn
- **API** : Flask, Flask-CORS
- **Frontend** : Streamlit
- **Deployment** : joblib

## 👨‍💻 Auteur

Projet réalisé dans le cadre d'un apprentissage du Machine Learning

## 📝 Licence

Ce projet est à usage éducatif.
