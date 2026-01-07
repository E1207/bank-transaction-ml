#!/bin/bash

# 🚀 Script de démarrage rapide pour le projet Santander

echo "🏦 Santander Customer Transaction Prediction"
echo "============================================="
echo ""

# Vérifier si l'environnement virtuel existe
if [ ! -d "venv" ]; then
    echo "❌ Environnement virtuel non trouvé!"
    echo "📝 Veuillez exécuter les commandes suivantes d'abord:"
    echo "   python3 -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Activer l'environnement virtuel
echo "🔄 Activation de l'environnement virtuel..."
source venv/bin/activate

echo ""
echo "✅ Environnement prêt!"
echo ""
echo "📋 Que souhaitez-vous faire?"
echo ""
echo "1️⃣  Télécharger les données Kaggle"
echo "2️⃣  Lancer Jupyter Notebook"
echo "3️⃣  Démarrer l'API Flask"
echo "4️⃣  Lancer l'interface Streamlit"
echo "5️⃣  Tester l'API"
echo "6️⃣  Afficher la structure du projet"
echo ""
read -p "Votre choix (1-6): " choice

case $choice in
    1)
        echo ""
        echo "📥 Téléchargement des données Kaggle..."
        python scripts/download_data.py
        ;;
    2)
        echo ""
        echo "📓 Lancement de Jupyter Notebook..."
        echo "   Notebooks disponibles dans: notebooks/"
        jupyter notebook notebooks/
        ;;
    3)
        echo ""
        echo "🔌 Démarrage de l'API Flask..."
        echo "   URL: http://localhost:5000"
        cd api && python app.py
        ;;
    4)
        echo ""
        echo "🎨 Lancement de Streamlit..."
        echo "   URL: http://localhost:8501"
        cd frontend && streamlit run streamlit_app.py
        ;;
    5)
        echo ""
        echo "🧪 Test de l'API..."
        echo "   Assurez-vous que l'API est démarrée!"
        python api/test_api.py
        ;;
    6)
        echo ""
        echo "📁 Structure du projet:"
        tree -L 2 -I 'venv|__pycache__|*.pyc'
        ;;
    *)
        echo "❌ Choix invalide!"
        ;;
esac
