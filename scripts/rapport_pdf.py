# ============================================================
# rapport_pdf.py — Génération du rapport PDF hebdomadaire
# Ce script tourne chaque lundi matin automatiquement
# ============================================================

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import requests

load_dotenv()

# ============================================================
# Fonction : génère le rapport PDF de la semaine
# ============================================================
def generer_rapport_pdf():
    
    print("📄 Génération du rapport PDF hebdomadaire...")
    
    # Date de la semaine
    aujourd_hui = datetime.now()
    semaine_passee = aujourd_hui - timedelta(days=7)
    
    nom_fichier = f"rapport_{aujourd_hui.strftime('%Y-%m-%d')}.pdf"
    
    # Création du document PDF
    doc = SimpleDocTemplate(nom_fichier, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []
    
    # Titre
    elements.append(Paragraph("HB Digital Performance", styles['Title']))
    elements.append(Paragraph(
        f"Rapport hebdomadaire — {semaine_passee.strftime('%d/%m/%Y')} au {aujourd_hui.strftime('%d/%m/%Y')}",
        styles['Heading2']
    ))
    elements.append(Spacer(1, 20))
    
    # Récupère les stats depuis notre API
    try:
        API_URL = os.getenv("API_URL", "http://127.0.0.1:8000")
        response = requests.get(f"{API_URL}/admin/stats/global")
        stats = response.json()
        
        # Tableau des stats
        data = [
            ["Métrique", "Valeur"],
            ["Total Clics", str(stats.get("total_clics", 0))],
            ["Total Leads", str(stats.get("total_leads", 0))],
            ["Taux de conversion", f"{stats.get('taux_conversion', 0)}%"],
            ["Revenu total", f"{stats.get('revenu_total', 0)}€"],
        ]
        
        table = Table(data, colWidths=[250, 200])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F3864')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#EBF3FB')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 20))
        elements.append(Paragraph(
            f"Rapport généré automatiquement le {aujourd_hui.strftime('%d/%m/%Y à %H:%M')}",
            styles['Normal']
        ))
        
    except Exception as e:
        elements.append(Paragraph(f"Erreur récupération stats : {e}", styles['Normal']))
    
    # Génération du PDF
    doc.build(elements)
    print(f"✅ Rapport généré : {nom_fichier}")
    return nom_fichier

# ============================================================
# Point d'entrée du script
# ============================================================
if __name__ == "__main__":
    print("🚀 Démarrage génération rapport PDF...")
    generer_rapport_pdf()
    print("✅ Script terminé !")