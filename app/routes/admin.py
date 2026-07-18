# ============================================================
# admin.py — Routes d'administration (protégées)
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
import csv
import io

from app.database import get_db
from app.models.models import Editeur, Campagne, Clic, Lead
from app.schemas.schemas import (
    EditeurCreate, EditeurRead,
    CampagneCreate, CampagneRead,
    ClicRead, LeadRead
)

router = APIRouter()

# ============================================================
# STATS GLOBALES
# ============================================================
@router.get("/stats/global")
async def stats_global(db: AsyncSession = Depends(get_db)):
    total_clics = (await db.execute(select(func.count(Clic.id)))).scalar()
    total_leads = (await db.execute(select(func.count(Lead.id)))).scalar()
    taux_conversion = 0.0
    if total_clics > 0:
        taux_conversion = round((total_leads / total_clics) * 100, 2)
    revenu_total = (await db.execute(select(func.sum(Lead.valeur)))).scalar() or 0.0
    return {
        "total_clics": total_clics,
        "total_leads": total_leads,
        "taux_conversion": taux_conversion,
        "revenu_total": revenu_total
    }

# ============================================================
# GESTION DES ÉDITEURS
# ============================================================
@router.post("/editeurs", response_model=EditeurRead)
async def creer_editeur(editeur: EditeurCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Editeur).where(Editeur.slug == editeur.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ce slug existe déjà")
    nouvel_editeur = Editeur(nom=editeur.nom, email=editeur.email, slug=editeur.slug)
    db.add(nouvel_editeur)
    await db.commit()
    await db.refresh(nouvel_editeur)
    return nouvel_editeur

@router.get("/editeurs", response_model=list[EditeurRead])
async def lister_editeurs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Editeur))
    return result.scalars().all()

# ============================================================
# GESTION DES CAMPAGNES
# ============================================================
@router.post("/campagnes", response_model=CampagneRead)
async def creer_campagne(campagne: CampagneCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campagne).where(Campagne.slug == campagne.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ce slug existe déjà")
    nouvelle_campagne = Campagne(nom=campagne.nom, slug=campagne.slug, url_destination=campagne.url_destination)
    db.add(nouvelle_campagne)
    await db.commit()
    await db.refresh(nouvelle_campagne)
    return nouvelle_campagne

@router.get("/campagnes", response_model=list[CampagneRead])
async def lister_campagnes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campagne))
    return result.scalars().all()

# ============================================================
# LISTE DES CLICS
# ============================================================
@router.get("/clics", response_model=list[ClicRead])
async def lister_clics(page: int = 1, limite: int = 50, db: AsyncSession = Depends(get_db)):
    offset = (page - 1) * limite
    result = await db.execute(select(Clic).offset(offset).limit(limite))
    return result.scalars().all()

# ============================================================
# STATS ÉVOLUTION
# ============================================================
@router.get("/stats/evolution")
async def stats_evolution(db: AsyncSession = Depends(get_db)):
    date_debut = datetime.utcnow() - timedelta(days=30)
    result = await db.execute(select(Clic).where(Clic.timestamp >= date_debut))
    clics = result.scalars().all()
    evolution = {}
    for clic in clics:
        jour = clic.timestamp.strftime("%d/%m")
        if jour not in evolution:
            evolution[jour] = 0
        evolution[jour] += 1
    return [{"date": jour, "clics": count} for jour, count in sorted(evolution.items())]

# ============================================================
# STATS PAR ÉDITEUR
# ============================================================
@router.get("/stats/editeurs")
async def stats_editeurs(date_debut: str = None, date_fin: str = None, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Editeur))
    editeurs = result.scalars().all()
    stats = []
    for editeur in editeurs:
        total_clics = (await db.execute(select(func.count(Clic.id)).where(Clic.editeur_id == editeur.id))).scalar()
        total_leads = (await db.execute(select(func.count(Lead.id)).join(Clic, Lead.clic_id == Clic.id).where(Clic.editeur_id == editeur.id))).scalar()
        taux_conversion = round((total_leads / total_clics) * 100, 2) if total_clics > 0 else 0.0
        stats.append({
            "editeur_id": editeur.id,
            "editeur_nom": editeur.nom,
            "editeur_slug": editeur.slug,
            "total_clics": total_clics,
            "total_leads": total_leads,
            "taux_conversion": taux_conversion,
        })
    return stats

# ============================================================
# STATS PAR CAMPAGNE
# ============================================================
@router.get("/stats/campagnes")
async def stats_campagnes(date_debut: str = None, date_fin: str = None, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campagne))
    campagnes = result.scalars().all()
    stats = []
    for campagne in campagnes:
        total_clics = (await db.execute(select(func.count(Clic.id)).where(Clic.campagne_id == campagne.id))).scalar()
        total_leads = (await db.execute(select(func.count(Lead.id)).join(Clic, Lead.clic_id == Clic.id).where(Clic.campagne_id == campagne.id))).scalar()
        taux_conversion = round((total_leads / total_clics) * 100, 2) if total_clics > 0 else 0.0
        stats.append({
            "campagne_id": campagne.id,
            "campagne_nom": campagne.nom,
            "campagne_slug": campagne.slug,
            "url_destination": campagne.url_destination,
            "total_clics": total_clics,
            "total_leads": total_leads,
            "taux_conversion": taux_conversion,
        })
    return stats

# ============================================================
# EXPORT CSV
# ============================================================
@router.get("/export/csv")
async def export_csv(periode: int = 30, editeur_id: int = None, db: AsyncSession = Depends(get_db)):
    date_debut = datetime.utcnow() - timedelta(days=periode)
    query = select(Clic).where(Clic.timestamp >= date_debut)
    if editeur_id:
        query = query.where(Clic.editeur_id == editeur_id)
    result = await db.execute(query)
    clics = result.scalars().all()
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(['date', 'editeur_id', 'campagne_id', 'device', 'token', 'lead'])
    for clic in clics:
        lead_result = await db.execute(select(Lead).where(Lead.clic_id == clic.id))
        lead = lead_result.scalar_one_or_none()
        writer.writerow([
            clic.timestamp.strftime('%d/%m/%Y %H:%M:%S'),
            clic.editeur_id,
            clic.campagne_id,
            clic.device,
            clic.token,
            'oui' if lead else 'non'
        ])
    output.seek(0)
    filename = f"tracking_hbdigital_{datetime.utcnow().strftime('%Y-%m')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ============================================================
# SNIPPET JS PIXEL POUR LES ANNONCEURS
# ============================================================
@router.get("/pixel/snippet")
async def generer_snippet_pixel(campagne_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campagne).where(Campagne.id == campagne_id))
    campagne = result.scalar_one_or_none()
    if not campagne:
        raise HTTPException(status_code=404, detail="Campagne introuvable")

    base_url = "http://62.238.12.184:8000"

    snippet_js = f"""<!-- HB Digital Tracking Pixel - Campagne: {campagne.nom} -->
<script>
(function() {{
    var token = new URLSearchParams(window.location.search).get('hb_token');
    if (token) {{
        var img = new Image();
        img.src = '{base_url}/c/pixel.gif?token=' + token;
    }}
}})();
</script>
<!-- Fin HB Digital Tracking Pixel -->"""

    postback_url = base_url + "/c/postback?token={CLICK_ID}&valeur={AMOUNT}"
    pixel_url = base_url + "/c/pixel.gif?token={TOKEN}"

    return {
        "campagne_nom": campagne.nom,
        "snippet_js": snippet_js,
        "postback_url": postback_url,
        "pixel_url": pixel_url
    }
# ============================================================
# DÉTAIL D'UN ÉDITEUR
# URL : GET /admin/editeurs/{editeur_id}/stats
# ============================================================
@router.get("/editeurs/{editeur_id}/stats")
async def stats_editeur_detail(editeur_id: int, db: AsyncSession = Depends(get_db)):
    
    # On récupère l'éditeur
    result = await db.execute(select(Editeur).where(Editeur.id == editeur_id))
    editeur = result.scalar_one_or_none()
    if not editeur:
        raise HTTPException(status_code=404, detail="Éditeur introuvable")

    # Stats globales
    total_clics = (await db.execute(select(func.count(Clic.id)).where(Clic.editeur_id == editeur_id))).scalar()
    total_leads = (await db.execute(select(func.count(Lead.id)).join(Clic, Lead.clic_id == Clic.id).where(Clic.editeur_id == editeur_id))).scalar()
    taux_conversion = round((total_leads / total_clics) * 100, 2) if total_clics > 0 else 0.0

    # Evolution sur 30 jours
    date_debut = datetime.utcnow() - timedelta(days=30)
    result_clics = await db.execute(
        select(Clic).where(Clic.editeur_id == editeur_id, Clic.timestamp >= date_debut)
    )
    clics = result_clics.scalars().all()
    
    evolution = {}
    for clic in clics:
        jour = clic.timestamp.strftime("%d/%m")
        if jour not in evolution:
            evolution[jour] = 0
        evolution[jour] += 1

    return {
        "editeur": {
            "id": editeur.id,
            "nom": editeur.nom,
            "slug": editeur.slug,
            "email": editeur.email,
            "statut": editeur.statut
        },
        "stats": {
            "total_clics": total_clics,
            "total_leads": total_leads,
            "taux_conversion": taux_conversion
        },
        "evolution": [
            {"date": jour, "clics": count}
            for jour, count in sorted(evolution.items())
        ]
    }