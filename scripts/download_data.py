"""
Script pour télécharger le dataset Santander depuis Kaggle
"""
import os
import zipfile
from kaggle.api.kaggle_api_extended import KaggleApi

def download_santander_data():
    """Télécharge le dataset Santander depuis Kaggle"""
    
    print("🔑 Authentification Kaggle...")
    api = KaggleApi()
    api.authenticate()
    
    print("📥 Téléchargement du dataset Santander...")
    print("⏳ Cela peut prendre quelques minutes selon votre connexion...")
    
    # Créer le dossier data s'il n'existe pas
    os.makedirs('data', exist_ok=True)
    
    # Télécharger le dataset
    api.competition_download_files(
        'santander-customer-transaction-prediction',
        path='data',
        quiet=False
    )
    
    print("\n✅ Téléchargement terminé!")
    
    # Décompresser le fichier zip
    zip_path = 'data/santander-customer-transaction-prediction.zip'
    
    if os.path.exists(zip_path):
        print("📦 Décompression des fichiers...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall('data')
        
        print("✅ Décompression terminée!")
        
        # Supprimer le fichier zip pour gagner de l'espace
        os.remove(zip_path)
        print("🗑️  Fichier zip supprimé")
    
    # Lister les fichiers téléchargés
    print("\n📂 Fichiers disponibles dans 'data/':")
    for file in os.listdir('data'):
        file_path = os.path.join('data', file)
        if os.path.isfile(file_path):
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            print(f"   - {file} ({size_mb:.2f} MB)")
    
    print("\n🎉 Dataset prêt à être utilisé!")

if __name__ == "__main__":
    try:
        download_santander_data()
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        print("\n💡 Assurez-vous que:")
        print("   1. Vous avez un compte Kaggle")
        print("   2. Le fichier kaggle.json est dans ~/.kaggle/")
        print("   3. Vous avez accepté les règles de la compétition sur Kaggle")
