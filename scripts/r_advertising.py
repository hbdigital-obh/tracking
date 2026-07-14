# ============================================================
# r_advertising.py — Récupération automatique des revenus R-Advertising
# Ce script tourne chaque jour à 7h automatiquement
# ============================================================

import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

# ============================================================
# Configuration R-Advertising
# Ces clés sont dans le fichier .env
# ============================================================
R_ADVERTISING_TOKEN = os.getenv("R_ADVERTISING_TOKEN", "")
R_ADVERTISING_URL = os.getenv("R_ADVERTISING_URL", "")

# ============================================================
# Fonction principale : récupère les stats du jour précédent
# ============================================================
def recuperer_stats_r_advertising():
    
    hier = datetime.now() - timedelta(days=1)
    date_debut = hier.strftime("%Y-%m-%d")
    date_fin = hier.strftime("%Y-%m-%d")
    
    print(f"📊 Récupération R-Advertising pour le {date_debut}...")

    try:
        headers = {
            "Authorization": f"Bearer {R_ADVERTISING_TOKEN}",
            "Content-Type": "application/json"
        }
        
        params = {
            "startDate": date_debut,
            "endDate": date_fin,
        }
        
        response = requests.get(
            f"{R_ADVERTISING_URL}/stats",
            headers=headers,
            params=params
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ R-Advertising — données récupérées : {data}")
            return data
        else:
            print(f"❌ Erreur R-Advertising : {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur connexion R-Advertising : {e}")
        return None

# ============================================================
# Fonction : envoie les données vers Airtable
# ============================================================
def envoyer_vers_airtable(data):
    
    AIRTABLE_TOKEN = os.getenv("AIRTABLE_TOKEN", "")
    AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID", "")
    AIRTABLE_TABLE = "Revenus"
    
    if not AIRTABLE_TOKEN:
        print("⚠️ Clé Airtable manquante dans le .env")
        return
    
    headers = {
        "Authorization": f"Bearer {AIRTABLE_TOKEN}",
        "Content-Type": "application/json"
    }
    
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE}"
    
    payload = {
        "records": [
            {
                "fields": {
                    "Date": datetime.now().strftime("%Y-%m-%d"),
                    "Plateforme": "R-Advertising",
                    "Revenus": data.get("revenue", 0),
                    "Clics": data.get("clicks", 0),
                    "Leads": data.get("leads", 0),
                }
            }
        ]
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        print("✅ Données envoyées vers Airtable !")
    else:
        print(f"❌ Erreur Airtable : {response.status_code}")

# ============================================================
# Point d'entrée du script
# ============================================================
if __name__ == "__main__":
    print("🚀 Démarrage script R-Advertising...")
    data = recuperer_stats_r_advertising()
    if data:
        envoyer_vers_airtable(data)
    print("✅ Script terminé !")