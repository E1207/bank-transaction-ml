#!/bin/bash

# Script de démarrage de l'application bancaire

echo "🏦 Santander Credit Scoring Application"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si on est dans le bon répertoire
if [ ! -d "api" ] || [ ! -d "credit-scoring-app" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

echo "📦 Vérification des dépendances..."

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé"
    exit 1
fi

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Dépendances OK"
echo ""

# Fonction pour démarrer l'API
start_api() {
    echo "${BLUE}🚀 Démarrage de l'API Flask...${NC}"
    cd api
    if [ -d "../.venv" ]; then
        source ../.venv/bin/activate
    elif [ -d "venv" ]; then
        source venv/bin/activate
    fi
    python app.py &
    API_PID=$!
    cd ..
    sleep 2
    echo "${GREEN}✅ API démarrée sur http://localhost:5001${NC}"
    echo ""
}

# Fonction pour démarrer Angular
start_angular() {
    echo "${BLUE}🚀 Démarrage de l'application Angular...${NC}"
    cd credit-scoring-app
    ng serve &
    NG_PID=$!
    cd ..
    echo "${GREEN}✅ Application Angular en cours de démarrage...${NC}"
    echo "${GREEN}   Accédez à http://localhost:4200${NC}"
    echo ""
}

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null
    fi
    if [ ! -z "$NG_PID" ]; then
        kill $NG_PID 2>/dev/null
    fi
    # Tuer aussi tous les processus flask et ng serve
    pkill -f "python.*app.py" 2>/dev/null
    pkill -f "ng serve" 2>/dev/null
    echo "✅ Services arrêtés"
    exit 0
}

# Capturer Ctrl+C
trap cleanup INT TERM

echo "🔧 Options de démarrage:"
echo "  1) Tout démarrer (API + Angular)"
echo "  2) API seulement"
echo "  3) Angular seulement"
echo ""
read -p "Votre choix [1-3]: " choice

case $choice in
    1)
        start_api
        start_angular
        ;;
    2)
        start_api
        ;;
    3)
        start_angular
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}✨ Application en cours d'exécution${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 Identifiants de connexion:"
echo "   Username: gestionnaire"
echo "   Password: santander123"
echo ""
echo "🌐 URLs:"
if [ ! -z "$API_PID" ]; then
    echo "   API:         http://localhost:5001"
    echo "   Health:      http://localhost:5001/health"
fi
if [ ! -z "$NG_PID" ]; then
    echo "   Application: http://localhost:4200"
fi
echo ""
echo "⏹️  Appuyez sur Ctrl+C pour arrêter"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Attendre indéfiniment
wait
