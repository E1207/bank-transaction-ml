"""
API Flask pour les prédictions de transactions Santander
"""
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Permettre les requêtes cross-origin

# Chemins des modèles (compatible local et Render)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.environ.get('MODEL_PATH', os.path.join(BASE_DIR, '..', 'models', 'best_model.pkl'))
SCALER_PATH = os.environ.get('SCALER_PATH', os.path.join(BASE_DIR, '..', 'models', 'scaler.pkl'))

model = None
scaler = None

def load_model():
    """Charge le modèle et le scaler"""
    global model, scaler
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            print("✅ Modèle chargé avec succès")
        else:
            print("⚠️ Modèle non trouvé. Entraînez d'abord un modèle.")
        
        if os.path.exists(SCALER_PATH):
            scaler = joblib.load(SCALER_PATH)
            print("✅ Scaler chargé avec succès")
        else:
            print("⚠️ Scaler non trouvé.")
    except Exception as e:
        print(f"❌ Erreur lors du chargement: {e}")

@app.route('/')
def home():
    """Page d'accueil de l'API"""
    return jsonify({
        'message': 'API Santander Customer Transaction Prediction',
        'status': 'active',
        'endpoints': {
            '/': 'GET - Page d\'accueil',
            '/health': 'GET - Vérifier l\'état de l\'API',
            '/predict': 'POST - Faire une prédiction'
        },
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None
    })

@app.route('/health')
def health():
    """Endpoint de santé de l'API"""
    return jsonify({
        'status': 'healthy',
        'model_status': 'loaded' if model else 'not_loaded',
        'scaler_status': 'loaded' if scaler else 'not_loaded'
    })

@app.route('/model-info')
def model_info():
    """
    Endpoint d'informations sur le modèle
    Retourne les métadonnées du modèle chargé
    """
    if model is None:
        return jsonify({
            'error': 'Modèle non chargé'
        }), 503
    
    model_type = type(model).__name__
    
    # Informations selon le type de modèle
    info = {
        'model_type': model_type,
        'n_features': 200,
        'feature_names': [f'var_{i}' for i in range(200)],
        'training_framework': 'scikit-learn',
        'scaler': 'StandardScaler' if scaler else 'None',
        'target': 'binary_classification',
        'classes': [0, 1],
        'class_names': ['No Transaction', 'Transaction']
    }
    
    # Ajouter des infos spécifiques selon le modèle
    if hasattr(model, 'coef_'):
        info['n_coefficients'] = len(model.coef_[0])
        info['intercept'] = float(model.intercept_[0])
    
    if hasattr(model, 'n_estimators'):
        info['n_estimators'] = model.n_estimators
    
    if hasattr(model, 'max_depth'):
        info['max_depth'] = model.max_depth
    
    return jsonify(info)

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint de prédiction
    
    Input JSON format:
    {
        "features": [val_0, val_1, ..., val_199]
    }
    
    Output JSON format:
    {
        "prediction": 0 or 1,
        "probability": float,
        "confidence": float
    }
    """
    try:
        # Vérifier que le modèle est chargé
        if model is None:
            return jsonify({
                'error': 'Modèle non chargé. Entraînez d\'abord un modèle.'
            }), 503
        
        # Récupérer les données JSON
        data = request.get_json()
        
        if 'features' not in data:
            return jsonify({
                'error': 'Format invalide. Attendu: {"features": [...]}'
            }), 400
        
        features = data['features']
        
        # Vérifier le nombre de features
        if len(features) != 200:
            return jsonify({
                'error': f'Nombre de features invalide. Attendu: 200, Reçu: {len(features)}'
            }), 400
        
        # Convertir en DataFrame
        feature_names = [f'var_{i}' for i in range(200)]
        df = pd.DataFrame([features], columns=feature_names)
        
        # Appliquer le scaler si disponible
        if scaler is not None:
            df_scaled = scaler.transform(df)
        else:
            df_scaled = df.values
        
        # Faire la prédiction
        prediction = model.predict(df_scaled)[0]
        probability = model.predict_proba(df_scaled)[0]
        
        # Calculer la confiance
        confidence = max(probability) * 100
        
        return jsonify({
            'prediction': int(prediction),
            'probability': {
                'no_transaction': float(probability[0]),
                'transaction': float(probability[1])
            },
            'confidence': float(confidence),
            'message': 'Transaction prédite' if prediction == 1 else 'Pas de transaction prédite'
        })
    
    except Exception as e:
        return jsonify({
            'error': f'Erreur lors de la prédiction: {str(e)}'
        }), 500

@app.route('/predict_with_threshold', methods=['POST'])
def predict_with_threshold():
    """
    Endpoint de prédiction avec seuil ajustable
    
    Input JSON format:
    {
        "features": [val_0, val_1, ..., val_199],
        "threshold": 0.6  (optionnel, défaut: 0.5)
    }
    
    Output JSON format:
    {
        "prediction": 0 or 1,
        "probability": {...},
        "decision": "CREDIT_ACCEPTED" or "CREDIT_REJECTED",
        "threshold_used": float,
        "confidence_level": "HIGH" or "MEDIUM" or "LOW",
        "risk_score": float
    }
    """
    try:
        if model is None:
            return jsonify({
                'error': 'Modèle non chargé'
            }), 503
        
        data = request.get_json()
        
        if 'features' not in data:
            return jsonify({
                'error': 'Format invalide. Attendu: {"features": [...], "threshold": 0.6}'
            }), 400
        
        features = data['features']
        threshold = float(data.get('threshold', 0.5))
        
        # Validation du seuil
        if not 0 <= threshold <= 1:
            return jsonify({
                'error': 'Le seuil doit être entre 0 et 1'
            }), 400
        
        # Vérifier le nombre de features
        if len(features) != 200:
            return jsonify({
                'error': f'Nombre de features invalide. Attendu: 200, Reçu: {len(features)}'
            }), 400
        
        # Convertir en DataFrame
        feature_names = [f'var_{i}' for i in range(200)]
        df = pd.DataFrame([features], columns=feature_names)
        
        # Appliquer le scaler si disponible
        if scaler is not None:
            df_scaled = scaler.transform(df)
        else:
            df_scaled = df.values
        
        # Faire la prédiction
        probability = model.predict_proba(df_scaled)[0]
        prob_transaction = probability[1]
        prediction = 1 if prob_transaction >= threshold else 0
        
        # Niveau de confiance
        distance_from_threshold = abs(prob_transaction - threshold)
        if distance_from_threshold > 0.3:
            confidence_level = "HIGH"
        elif distance_from_threshold > 0.1:
            confidence_level = "MEDIUM"
        else:
            confidence_level = "LOW"
        
        # Score de risque
        risk_score = 1 - prob_transaction if prediction == 1 else prob_transaction
        
        return jsonify({
            'prediction': int(prediction),
            'probability': {
                'no_transaction': float(probability[0]),
                'transaction': float(probability[1])
            },
            'probability_percent': f"{prob_transaction*100:.2f}%",
            'decision': 'CREDIT_ACCEPTED' if prediction == 1 else 'CREDIT_REJECTED',
            'threshold_used': threshold,
            'confidence_level': confidence_level,
            'risk_score': float(risk_score),
            'message': f"Probabilité de transaction: {prob_transaction*100:.1f}% (seuil: {threshold*100:.0f}%)"
        })
    
    except Exception as e:
        return jsonify({
            'error': f'Erreur lors de la prédiction: {str(e)}'
        }), 500

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """
    Endpoint pour des prédictions en batch
    
    Input JSON format:
    {
        "features": [[val_0, val_1, ..., val_199], [...], ...]
    }
    """
    try:
        if model is None:
            return jsonify({
                'error': 'Modèle non chargé.'
            }), 503
        
        data = request.get_json()
        features_list = data['features']
        
        # Convertir en DataFrame
        feature_names = [f'var_{i}' for i in range(200)]
        df = pd.DataFrame(features_list, columns=feature_names)
        
        # Appliquer le scaler
        if scaler is not None:
            df_scaled = scaler.transform(df)
        else:
            df_scaled = df.values
        
        # Prédictions
        predictions = model.predict(df_scaled)
        probabilities = model.predict_proba(df_scaled)
        
        results = []
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            results.append({
                'index': i,
                'prediction': int(pred),
                'probability': {
                    'no_transaction': float(prob[0]),
                    'transaction': float(prob[1])
                },
                'confidence': float(max(prob) * 100)
            })
        
        return jsonify({
            'predictions': results,
            'total': len(results)
        })
    
    except Exception as e:
        return jsonify({
            'error': f'Erreur: {str(e)}'
        }), 500

# Charger le modèle au démarrage
load_model()

if __name__ == '__main__':
    print("\n🚀 Démarrage de l'API Flask...")
    print("📍 API disponible sur: http://localhost:5001")
    print("\n📋 Endpoints disponibles:")
    print("   GET  /         - Page d'accueil")
    print("   GET  /health   - État de l'API")
    print("   GET  /model-info - Informations sur le modèle")
    print("   POST /predict  - Prédiction unique")
    print("   POST /predict_batch - Prédictions multiples")
    print("\n⏹️  Ctrl+C pour arrêter\n")
    
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)
