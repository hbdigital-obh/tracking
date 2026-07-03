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