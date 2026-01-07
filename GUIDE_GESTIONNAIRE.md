# 🎯 GUIDE D'UTILISATION - GESTIONNAIRE BANCAIRE

## 📋 Démarrage

### Étape 1: Lancer l'API
```bash
cd api
source ../.venv/bin/activate
python app.py
```
✅ API disponible sur http://localhost:5001

### Étape 2: Lancer l'Application
```bash
cd credit-scoring-app
ng serve
```
✅ Application disponible sur http://localhost:4200

---

## 🔐 Connexion

**Identifiants gestionnaire:**
- Username: `gestionnaire`
- Password: `santander123`

---

## 📊 Workflow Complet

### 1️⃣ Informations Client
Renseigner:
- Nom complet
- Âge (18-80 ans)
- Montant demandé
- Revenus mensuels
- Objectif du crédit

Choisir la **politique bancaire**:
- 🛡️ **Prudente** (75%) : Minimiser les risques
- ⚖️ **Standard** (65%) : Équilibre (recommandé)
- 🚀 **Dynamique** (50%) : Maximiser les approbations

### 2️⃣ Questionnaire (20 questions)
Naviguer parmi 4 catégories:

**👤 Profil Personnel**
- Situation familiale
- Stabilité professionnelle
- Ancienneté emploi

**💰 Situation Financière**
- Épargne
- Revenus nets
- Dettes en cours
- Ratio d'endettement

**📊 Historique Crédit**
- Score de crédit
- Cartes de crédit
- Incidents de paiement

**🏠 Patrimoine**
- Propriété immobilière
- Investissements

### 3️⃣ Résultats

**Taux d'Éligibilité** (0-100%)
- 🟢 80-100%: EXCELLENT → Crédit accordé
- 🟢 70-79%: TRÈS BON → Crédit accordé
- 🟡 60-69%: BON → Crédit accordé
- 🟠 50-59%: MOYEN → Attention
- 🔴 0-49%: FAIBLE → Crédit refusé

**Décision Automatique**
- ✅ CRÉDIT ACCORDÉ si score ≥ seuil
- ❌ CRÉDIT REFUSÉ si score < seuil

**Métriques Complémentaires**
- Probabilité de transaction
- Niveau de confiance (HIGH/MEDIUM/LOW)
- Score de risque
- Recommandations personnalisées

---

## 💡 Exemples de Cas

### Cas 1: Client Excellent (Score: 85%)
- Situation: Marié, CDI 10 ans
- Revenus: 4 500 €/mois
- Épargne: 25 000 €
- Historique: Aucun incident
➡️ **CRÉDIT ACCORDÉ** ✅

### Cas 2: Client Moyen (Score: 58%)
- Situation: Célibataire, CDD 1 an
- Revenus: 1 800 €/mois
- Épargne: 2 000 €
- Historique: 1 retard de paiement
➡️ **ATTENTION** ⚠️ (Garanties supplémentaires recommandées)

### Cas 3: Client À Risque (Score: 35%)
- Situation: Divorcé, Intérim
- Revenus: 1 200 €/mois
- Épargne: 500 €
- Historique: Plusieurs incidents
➡️ **CRÉDIT REFUSÉ** ❌

---

## 🔧 Fonctionnalités Avancées

### Modifier les Réponses
- Bouton "Modifier les réponses" depuis les résultats
- Retour au questionnaire avec valeurs sauvegardées

### Nouvelle Analyse
- Bouton "Nouvelle analyse" pour réinitialiser
- Commencer un nouveau dossier client

### Changer la Politique en Cours
- Ajuster le seuil d'acceptation
- Relancer l'analyse avec nouveau seuil

---

## ⚠️ Points d'Attention

1. **Les 180 variables non questionnées** sont automatiquement remplies avec les moyennes du dataset (transparence ML)

2. **Le modèle est entraîné** sur 200 000 transactions réelles Santander

3. **ROC-AUC de 0.8599** = 85.99% de précision sur données de validation

4. **L'importance des questions** est affichée en pourcentage (basée sur l'analyse ML)

---

## 📞 Support

En cas de problème:
1. Vérifier que l'API est démarrée (http://localhost:5001/health)
2. Vider le cache du navigateur (Ctrl+Shift+R)
3. Consulter la console développeur (F12)

---

**Bonne évaluation !** 🎯
