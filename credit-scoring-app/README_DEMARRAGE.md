# 🚀 GUIDE DE DÉMARRAGE - Interface Angular

## ✅ PROBLÈME: "Erreur lors de la prédiction"

### CAUSE
L'API Flask n'est pas démarrée. L'interface Angular essaie de se connecter à `http://localhost:5001` mais l'API n'est pas active.

---

## 📋 SOLUTION: Démarrer l'API ET Angular

### Étape 1: Démarrer l'API Flask (Terminal 1)

```bash
# Aller dans le dossier API
cd /Users/emmanuel/Documents/bank-transaction-ml/api

# Activer l'environnement virtuel
source ../.venv/bin/activate

# Démarrer l'API
python app.py
```

**Résultat attendu:**
```
✅ Modèle chargé avec succès
✅ Scaler chargé avec succès
🚀 Démarrage de l'API Flask...
📍 API disponible sur: http://localhost:5001
```

**⚠️ IMPORTANT:** Laissez ce terminal ouvert !

---

### Étape 2: Démarrer Angular (Terminal 2)

Ouvrez un NOUVEAU terminal :

```bash
# Aller dans le dossier Angular
cd /Users/emmanuel/Documents/bank-transaction-ml/credit-scoring-app

# Démarrer Angular
ng serve
```

**Résultat attendu:**
```
✔ Building...
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200 **
```

---

### Étape 3: Ouvrir le navigateur

Ouvrez votre navigateur sur : **http://localhost:4200**

---

## ✅ VÉRIFICATION

### 1. L'API fonctionne ?

Dans un 3ème terminal :
```bash
curl http://localhost:5001/health
```

Vous devriez voir :
```json
{
  "status": "healthy",
  "model_status": "loaded",
  "scaler_status": "loaded"
}
```

### 2. L'interface se connecte ?

Sur l'interface Angular, en haut à droite vous devriez voir :
- **🟢 API: healthy** (point vert)
- **Modèle: loaded**

Si c'est rouge 🔴, l'API n'est pas démarrée.

---

## 🎯 TEST COMPLET

1. **Ajustez le seuil** avec le slider (ex: 0.6 = 60%)
2. Cliquez sur **"🎲 Données Aléatoires"**
3. Cliquez sur **"🚀 Analyser le Crédit"**

Vous devriez voir :
- ✅ **CRÉDIT ACCEPTÉ** (vert) ou ❌ **CRÉDIT REFUSÉ** (rouge)
- Probabilité de transaction
- Niveau de confiance (HIGH/MEDIUM/LOW)
- Score de risque
- Graphiques de probabilité

---

## ❌ SI ÇA NE FONCTIONNE TOUJOURS PAS

### Problème: Port 5001 déjà utilisé

Si vous voyez :
```
Address already in use
Port 5001 is in use by another program
```

**Solution A:** Tuer le processus qui utilise le port
```bash
lsof -ti:5001 | xargs kill -9
```

**Solution B:** Changer le port dans l'API et Angular

1. Dans `api/app.py`, ligne finale :
```python
app.run(debug=True, host='0.0.0.0', port=5002)  # Changez 5001 → 5002
```

2. Dans `credit-scoring-app/src/app/services/api.service.ts`, ligne 45 :
```typescript
private apiUrl = 'http://localhost:5002';  // Changez 5001 → 5002
```

3. Redémarrez l'API et Angular

---

## 📊 ARCHITECTURE

```
┌─────────────────┐      HTTP      ┌──────────────────┐
│  Angular App    │─────────────────▶│   Flask API     │
│  (Port 4200)    │  GET /health    │   (Port 5001)   │
│                 │  POST /predict  │                 │
└─────────────────┘                 └──────────────────┘
                                            │
                                            ▼
                                    ┌──────────────────┐
                                    │  ML Model (.pkl) │
                                    │  Scaler (.pkl)   │
                                    └──────────────────┘
```

---

## 🎨 FONCTIONNALITÉS DE L'INTERFACE

### Panneau de Contrôle (gauche)
- 🎚️ **Slider de seuil** : Ajustez de 0% à 100%
  - Vert : Risque faible (accepter facilement)
  - Orange : Risque moyen
  - Rouge : Risque élevé (prudent)

- 🎲 **Données Aléatoires** : Génère 200 features aléatoires
- 📊 **Données Exemple** : Charge un exemple réel du dataset
- 🚀 **Analyser le Crédit** : Lance la prédiction

### Panneau de Résultats (droite)
- 🎯 **Décision** : ACCEPTÉ (vert) / REFUSÉ (rouge)
- 📊 **Métriques** :
  - Probabilité de transaction
  - Niveau de confiance
  - Score de risque
- 📈 **Graphiques** : Distribution des probabilités

### Historique (bas)
- 📜 Dernières 10 analyses
- Décision, probabilité, seuil utilisé

---

## 💡 CONSEILS D'UTILISATION

### Pour accepter plus de crédits :
- Baisser le seuil vers 0.3 (30%)
- Risque : Accepter des clients avec faible probabilité

### Pour être plus prudent :
- Augmenter le seuil vers 0.7 (70%)
- Risque : Refuser des clients potentiellement bons

### Seuil recommandé :
- **0.5 (50%)** : Équilibré
- **0.6 (60%)** : Prudent (banque)
- **0.4 (40%)** : Agressif (startup)

---

## 🆘 BESOIN D'AIDE ?

Envoyez-moi une capture d'écran de :
1. Le terminal de l'API
2. Le terminal Angular
3. La console du navigateur (F12 → Console)
4. L'interface avec l'erreur

Je pourrai diagnostiquer le problème exact ! 🚀
