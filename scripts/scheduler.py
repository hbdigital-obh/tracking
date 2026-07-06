# ============================================================
# scheduler.py — Lance automatiquement les scripts chaque jour
# Ce fichier tourne en permanence sur le VPS
# ============================================================

import schedule
import time
from datetime import datetime
from tradedoubler import recuperer_stats_tradedoubler, envoyer_vers_airtable as td_airtable
from r_advertising import recuperer_stats_r_advertising, envoyer_vers_airtable as ra_airtable
from rapport_pdf import generer_rapport_pdf

# ============================================================
# Tâche 1 : Récupère les revenus chaque jour à 7h
# ============================================================
def tache_revenus():
    print(f"\n⏰ {datetime.now()} — Lancement récupération revenus...")
    
    # TradeDoubler
    data_td = recuperer_stats_tradedoubler()
    if data_td:
        td_airtable(data_td)
    
    # R-Advertising
    data_ra = recuperer_stats_r_advertising()
    if data_ra:
        ra_airtable(data_ra)

# ============================================================
# Tâche 2 : Génère le rapport PDF chaque lundi à 8h
# ============================================================
def tache_rapport():
    print(f"\n⏰ {datetime.now()} — Génération rapport PDF...")
    generer_rapport_pdf()

# ============================================================
# Configuration du planning automatique
# ============================================================
# Chaque jour à 7h → récupère les revenus
schedule.every().day.at("07:00").do(tache_revenus)

# Chaque lundi à 8h → génère le rapport PDF
schedule.every().monday.at("08:00").do(tache_rapport)

# ============================================================
# Boucle infinie qui vérifie les tâches toutes les minutes
# ============================================================
print("🚀 Scheduler démarré — en attente des tâches...")
print("📅 Revenus : chaque jour à 07h00")
print("📄 Rapport PDF : chaque lundi à 08h00")

while True:
    schedule.run_pending()
    time.sleep(60)  # Vérifie toutes les 60 secondes