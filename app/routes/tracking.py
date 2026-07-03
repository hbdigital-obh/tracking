# ============================================================
# tracking.py — Routes publiques de tracking
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import hashlib
from datetime import datetime

from app.database import get_db
from app.models.models import Editeur, Campagne, Clic, Lead

router = APIRouter()

# ============================================================
# ROUTE PRINCIPALE : Enregistre le clic et redirige
# URL : /c/{slug_editeur}/{slug_campagne}
# Ex : /c/jean-dupont/credit-agricole
# ============================================================
@router.get("/{slug_editeur}/{slug_campagne}")
async def tracker_clic(
    slug_editeur: str,
    slug_campagne: str,
    db: AsyncSession = Depends(get_db)
):
    # On cherche l'éditeur dans la base de données
    result = await db.execute(
        select(Editeur).where(Editeur.slug == slug_editeur)
    )
    editeur = result.scalar_one_or_none()

    # Si l'éditeur n'existe pas → erreur 404
    if not editeur:
        raise HTTPException(status_code=404, detail="Éditeur introuvable")

    # On cherche la campagne dans la base de données
    result = await db.execute(
        select(Campagne).where(Campagne.slug == slug_campagne)
    )
    campagne = result.scalar_one_or_none()

    # Si la campagne n'existe pas → erreur 404
    if not campagne:
        raise HTTPException(status_code=404, detail="Campagne introuvable")

    # On génère un token unique pour identifier ce clic
    # uuid4() génère un identifiant unique aléatoire
    token = str(uuid.uuid4())

    # On crée le clic en base de données
    clic = Clic(
        editeur_id=editeur.id,
        campagne_id=campagne.id,
        timestamp=datetime.utcnow(),
        ip_anonyme="0.0.0.0",  # On anonymise l'IP pour respecter le RGPD
        device="unknown",       # On détectera le device plus tard
        token=token
    )
    db.add(clic)
    await db.commit()

    # On redirige le visiteur vers l'URL de destination (302 = redirection temporaire)
    return RedirectResponse(url=campagne.url_destination, status_code=302)


# ============================================================
# PIXEL DE TRACKING : Signal de conversion côté navigateur
# URL : /c/pixel.gif?token=XXX
# Le navigateur charge une image invisible qui signale la conversion
# ============================================================
@router.get("/pixel.gif")
async def pixel_tracking(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    # On cherche le clic associé à ce token
    result = await db.execute(
        select(Clic).where(Clic.token == token)
    )
    clic = result.scalar_one_or_none()

    # Si le clic existe et n'a pas encore de lead → on crée le lead
    if clic:
        lead = Lead(
            clic_id=clic.id,
            valeur=0.0,
            source="pixel",
            timestamp=datetime.utcnow()
        )
        db.add(lead)
        await db.commit()

    # On retourne une image GIF transparente de 1x1 pixel
    gif = b"GIF89a\x01\x00\x01\x00\x00\xff\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x00;"
    return Response(content=gif, media_type="image/gif")


# ============================================================
# POSTBACK : Signal de conversion serveur à serveur
# URL : /c/postback?token=XXX&valeur=XX
# L'annonceur envoie ce signal quand un visiteur convertit
# ============================================================
@router.get("/postback")
async def postback(
    token: str,
    valeur: float = 0.0,
    db: AsyncSession = Depends(get_db)
):
    # On cherche le clic associé à ce token
    result = await db.execute(
        select(Clic).where(Clic.token == token)
    )
    clic = result.scalar_one_or_none()

    if not clic:
        raise HTTPException(status_code=404, detail="Token invalide")

    # On crée le lead avec la valeur monétaire envoyée par l'annonceur
    lead = Lead(
        clic_id=clic.id,
        valeur=valeur,
        source="postback",
        timestamp=datetime.utcnow()
    )
    db.add(lead)
    await db.commit()

    return {"message": "Lead enregistré avec succès", "token": token, "valeur": valeur}