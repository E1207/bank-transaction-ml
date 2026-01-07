# 🏦 Santander Credit Scoring - Interface Angular

Interface web professionnelle pour l'application de scoring de crédit.

## 🚀 DÉMARRAGE RAPIDE

### 1. API Backend (Terminal 1)
```bash
cd /Users/emmanuel/Documents/bank-transaction-ml/api
source ../.venv/bin/activate
python app.py
```
➡️ API sur http://localhost:5001

### 2. Frontend Angular (Terminal 2)
```bash
cd /Users/emmanuel/Documents/bank-transaction-ml/credit-scoring-app
ng serve
```
➡️ App sur http://localhost:4200

## ✨ Fonctionnalités

- ✅ Dashboard interactif en temps réel
- ✅ Slider de seuil ajustable (0% - 100%)
- ✅ Décisions claires (ACCEPTÉ / REFUSÉ)
- ✅ Graphiques de probabilités
- ✅ Historique des 10 dernières analyses
- ✅ Design moderne et professionnel

## 🎯 Guide d'Utilisation

1. **Ajuster le seuil** : Utilisez le slider (0.5 = 50% par défaut)
2. **Charger des données** : Cliquez sur "Générer Données Aléatoires"
3. **Analyser** : Cliquez sur "Analyser le Client"
4. **Interpréter** : Voir la décision + métriques détaillées

## 📊 Métriques Affichées

- **Probabilité de Transaction** : % de risque
- **Décision** : ACCEPTÉ ou REFUSÉ (avec couleurs)
- **Niveau de Confiance** : HIGH / MEDIUM / LOW
- **Score de Risque** : Risque global calculé

## 🎨 Technologies

- Angular 19
- TypeScript
- SCSS
- RxJS
- HttpClient

## 📝 Commandes

```bash
ng serve              # Démarrer
ng build              # Build production
ng serve --open       # Ouvrir navigateur
```

## 🐛 Dépannage

**API déconnectée ?**
- Vérifiez que l'API tourne sur le port 5001
- Testez : `curl http://localhost:5001/health`

**Port 4200 occupé ?**
```bash
ng serve --port 4201
```

**Voir plus de détails dans le projet principal**
