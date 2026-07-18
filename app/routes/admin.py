# ============================================================
# admin.py — Routes d'administration (protégées)
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.database import get_db
from app.models.models import Editeur, Campagne, Clic, Lead
from app.schemas.schemas import (
    EditeurCreate, EditeurRead,
    CampagneCreate, CampagneRead,
    ClicRead, LeadRead
)

router = APIRouter()

# ============================================================
# STATS GLOBALES : KPIs principaux du dashboard
# URL : GET /admin/stats/global
# ============================================================
@router.get("/stats/global")
async def stats_global(db: AsyncSession = Depends(get_db)):

    # Nombre total de clics
    total_clics = await db.execute(select(func.count(Clic.id)))
    total_clics = total_clics.scalar()

    # Nombre total de leads
    total_leads = await db.execute(select(func.count(Lead.id)))
    total_leads = total_leads.scalar()

    # Taux de conversion (leads / clics * 100)
    taux_conversion = 0.0
    if total_clics > 0:
        taux_conversion = round((total_leads / total_clics) * 100, 2)

    # Revenu total (somme des valeurs de tous les leads)
    revenu_total = await db.execute(select(func.sum(Lead.valeur)))
    revenu_total = revenu_total.scalar() or 0.0

    return {
        "total_clics": total_clics,
        "total_leads": total_leads,
        "taux_conversion": taux_conversion,
        "revenu_total": revenu_total
    }

# ============================================================
# GESTION DES ÉDITEURS
# ============================================================

# Créer un éditeur
# URL : POST /admin/editeurs
@router.post("/editeurs", response_model=EditeurRead)
async def creer_editeur(
    editeur: EditeurCreate,
    db: AsyncSession = Depends(get_db)
):
    # On vérifie que le slug n'existe pas déjà
    result = await db.execute(
        select(Editeur).where(Editeur.slug == editeur.slug)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ce slug existe déjà")

    # On crée l'éditeur
    nouvel_editeur = Editeur(
        nom=editeur.nom,
        email=editeur.email,
        slug=editeur.slug
    )
    db.add(nouvel_editeur)
    await db.commit()
    await db.refresh(nouvel_editeur)
    return nouvel_editeur

# Lister tous les éditeurs
# URL : GET /admin/editeurs
@router.get("/editeurs", response_model=list[EditeurRead])
async def lister_editeurs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Editeur))
    return result.scalars().all()

# ============================================================
# GESTION DES CAMPAGNES
# ============================================================

# Créer une campagne
# URL : POST /admin/campagnes
@router.post("/campagnes", response_model=CampagneRead)
async def creer_campagne(
    campagne: CampagneCreate,
    db: AsyncSession = Depends(get_db)
):
    # On vérifie que le slug n'existe pas déjà
    result = await db.execute(
        select(Campagne).where(Campagne.slug == campagne.slug)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ce slug existe déjà")

    # On crée la campagne
    nouvelle_campagne = Campagne(
        nom=campagne.nom,
        slug=campagne.slug,
        url_destination=campagne.url_destination
    )
    db.add(nouvelle_campagne)
    await db.commit()
    await db.refresh(nouvelle_campagne)
    return nouvelle_campagne

# Lister toutes les campagnes
# URL : GET /admin/campagnes
@router.get("/campagnes", response_model=list[CampagneRead])
async def lister_campagnes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campagne))
    return result.scalars().all()

# ============================================================
# LISTE DES CLICS (paginée)
# URL : GET /admin/clics?page=1&limite=50
# ============================================================
@router.get("/clics", response_model=list[ClicRead])
async def lister_clics(
    page: int = 1,
    limite: int = 50,
    db: AsyncSession = Depends(get_db)
):
    # On calcule l'offset pour la pagination
    offset = (page - 1) * limite
    result = await db.execute(
        select(Clic).offset(offset).limit(limite)
    )
    return result.scalars().all()

    # ============================================================
# STATS ÉVOLUTION : Clics par jour sur les 30 derniers jours
# URL : GET /admin/stats/evolution
# ============================================================
@router.get("/stats/evolution")
async def stats_evolution(db: AsyncSession = Depends(get_db)):
    
    # On récupère tous les clics des 30 derniers jours
    date_debut = datetime.utcnow() - timedelta(days=30)
    
    result = await db.execute(
        select(Clic).where(Clic.timestamp >= date_debut)
    )
    clics = result.scalars().all()

    # On groupe les clics par jour
    # Un dictionnaire où la clé = date, valeur = nombre de clics
    evolution = {}
    for clic in clics:
        jour = clic.timestamp.strftime("%d/%m")
        if jour not in evolution:
            evolution[jour] = 0
        evolution[jour] += 1

    # On retourne une liste triée par date
    return [
        {"date": jour, "clics": count}
        for jour, count in sorted(evolution.items())
    ]
# ============================================================
# STATS PAR ÉDITEUR
# URL : GET /admin/stats/editeurs
# ============================================================
@router.get("/stats/editeurs")
async def stats_editeurs(
    date_debut: str = None,
    date_fin: str = None,
    db: AsyncSession = Depends(get_db)
):
    # On récupère tous les éditeurs
    result = await db.execute(select(Editeur))
    editeurs = result.scalars().all()

    stats = []
    for editeur in editeurs:
        # Nombre de clics par éditeur
        query_clics = select(func.count(Clic.id)).where(
            Clic.editeur_id == editeur.id
        )
        # Nombre de leads par éditeur
        query_leads = select(func.count(Lead.id)).join(
            Clic, Lead.clic_id == Clic.id
        ).where(Clic.editeur_id == editeur.id)

        total_clics = (await db.execute(query_clics)).scalar()
        total_leads = (await db.execute(query_leads)).scalar()

        taux_conversion = 0.0
        if total_clics > 0:
            taux_conversion = round((total_leads / total_clics) * 100, 2)

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
# URL : GET /admin/stats/campagnes
# ============================================================
@router.get("/stats/campagnes")
async def stats_campagnes(
    date_debut: str = None,
    date_fin: str = None,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Campagne))
    campagnes = result.scalars().all()

    stats = []
    for campagne in campagnes:
        query_clics = select(func.count(Clic.id)).where(
            Clic.campagne_id == campagne.id
        )
        query_leads = select(func.count(Lead.id)).join(
            Clic, Lead.clic_id == Clic.id
        ).where(Clic.campagne_id == campagne.id)

        total_clics = (await db.execute(query_clics)).scalar()
        total_leads = (await db.execute(query_leads)).scalar()

        taux_conversion = 0.0
        if total_clics > 0:
            taux_conversion = round((total_leads / total_clics) * 100, 2)

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
# URL : GET /admin/export/csv
# ============================================================
@router.get("/export/csv")
async def export_csv(
    periode: int = 30,
    editeur_id: int = None,
    db: AsyncSession = Depends(get_db)
):
    from fastapi.responses import StreamingResponse
    import csv
    import io
    from datetime import timedelta

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
        lead_result = await db.execute(
            select(Lead).where(Lead.clic_id == clic.id)
        )
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