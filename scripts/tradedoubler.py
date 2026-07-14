# ============================================================
# tradedoubler.py — Récupération automatique des revenus TradeDoubler
# Ce script tourne chaque jour à 7h automatiquement
# ============================================================

import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

# ============================================================
# Configuration TradeDoubler
# Ces clés sont dans le fichier .env
# ============================================================
TRADEDOUBLER_TOKEN = os.getenv("TRADEDOUBLER_TOKEN", "")

# ============================================================
# Fonction principale : récupère les stats du jour précédent
# ============================================================
def recuperer_stats_tradedoubler():
    
    # On calcule la date d'hier
    hier = datetime.now() - timedelta(days=1)
    date_debut = hier.strftime("%Y-%m-%d")
    date_fin = hier.strftime("%Y-%m-%d")
    
    print(f"📊 Récupération TradeDoubler pour le {date_debut}...")

    try:
        # Appel à l'API TradeDoubler
        # Documentation : https://api.tradedoubler.com
        headers = {
            "Authorization": f"Bearer {TRADEDOUBLER_TOKEN}",
            "Content-Type": "application/json"
        }
        
        url = f"https://api.tradedoubler.com/1.0/statistics/publisher"
        params = {
            "startDate": date_debut,
            "endDate": date_fin,
        }
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ TradeDoubler — données récupérées : {data}")
            return data
        else:
            print(f"❌ Erreur TradeDoubler : {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erreur connexion TradeDoubler : {e}")
        return None

# ============================================================
# Fonction : envoie les données vers Airtable
# ============================================================
def envoyer_vers_airtable(data):
    
    # Clé API Airtable (dans le .env)
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
                    "Plateforme": "TradeDoubler",
                    "Revenus": data.get("totalCommission", 0),
                    "Clics": data.get("totalClicks", 0),
                    "Leads": data.get("totalLeads", 0),
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
    print("🚀 Démarrage script TradeDoubler...")
    data = recuperer_stats_tradedoubler()
    if data:
        envoyer_vers_airtable(data)
    print("✅ Script terminé !")