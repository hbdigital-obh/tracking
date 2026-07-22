# ============================================================
# tracking.py — Routes publiques de tracking
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import hashlib
from datetime import datetime, timedelta

from app.database import get_db
from app.models.models import Editeur, Campagne, Clic, Lead

router = APIRouter()

# Liste complète des user-agents bots connus
BOTS_USER_AGENTS = [
    "bot", "crawler", "spider", "slurp", "googlebot",
    "bingbot", "yahoo", "baidu", "yandex", "duckduck",
    "semrush", "ahrefs", "mj12bot", "dotbot", "applebot",
    "facebookexternalhit", "twitterbot", "linkedinbot",
    "whatsapp", "telegrambot", "slackbot", "discordbot",
    "scrapy", "wget", "curl", "python-requests", "java",
    "headlesschrome", "phantomjs", "selenium", "puppeteer",
    "lighthouse", "pingdom", "uptimerobot", "datadog",
    "nessus", "nikto", "sqlmap", "masscan", "nmap",
    "archive.org", "ia_archiver", "wayback", "httrack",
    "screaming frog", "sitebulb", "deepcrawl", "oncrawl"
]

def is_bot(user_agent: str) -> bool:
    """Vérifie si le user-agent est un bot connu"""
    if not user_agent:
        return True  # Pas de user-agent = suspect
    ua_lower = user_agent.lower()
    return any(bot in ua_lower for bot in BOTS_USER_AGENTS)

def anonymiser_ip(ip: str) -> str:
    """Anonymise l'IP en hashant les 2 derniers octets (RGPD)"""
    if not ip:
        return "0.0.0.0"
    parts = ip.split(".")
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.xxx.xxx"
    return hashlib.md5(ip.encode()).hexdigest()[:10]

def detecter_device(user_agent: str) -> str:
    """Détecte le type d'appareil depuis le user-agent"""
    if not user_agent:
        return "unknown"
    ua_lower = user_agent.lower()
    if any(m in ua_lower for m in ["mobile", "android", "iphone", "ipad"]):
        return "mobile"
    return "desktop"

# ============================================================
# ROUTE PRINCIPALE : Enregistre le clic et redirige
# ============================================================
@router.get("/{slug_editeur}/{slug_campagne}")
async def tracker_clic(
    slug_editeur: str,
    slug_campagne: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host
    user_agent = request.headers.get("user-agent", "")

    result = await db.execute(
        select(Editeur).where(Editeur.slug == slug_editeur)
    )
    editeur = result.scalar_one_or_none()
    if not editeur:
        raise HTTPException(status_code=404, detail="Éditeur introuvable")

    result = await db.execute(
        select(Campagne).where(Campagne.slug == slug_campagne)
    )
    campagne = result.scalar_one_or_none()
    if not campagne:
        raise HTTPException(status_code=404, detail="Campagne introuvable")

    # Détection anti-fraude
    suspect = False

    # 1. Vérifie si c'est un bot
    if is_bot(user_agent):
        suspect = True

    # 2. Déduplication : même IP + même campagne < 30 secondes
    if not suspect:
        ip_anonyme = anonymiser_ip(ip)
        trente_secondes = datetime.utcnow() - timedelta(seconds=30)
        result_doublon = await db.execute(
            select(Clic).where(
                Clic.ip_anonyme == ip_anonyme,
                Clic.campagne_id == campagne.id,
                Clic.timestamp >= trente_secondes
            )
        )
        if result_doublon.scalars().first():
            suspect = True

    token = str(uuid.uuid4())

    clic = Clic(
        editeur_id=editeur.id,
        campagne_id=campagne.id,
        timestamp=datetime.utcnow(),
        ip_anonyme=anonymiser_ip(ip),
        device=detecter_device(user_agent),
        token=token,
        is_suspect=suspect
    )
    db.add(clic)
    await db.commit()

    return RedirectResponse(url=campagne.url_destination, status_code=302)


# ============================================================
# PIXEL DE TRACKING
# ============================================================
@router.get("/pixel.gif")
async def pixel_tracking(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Clic).where(Clic.token == token)
    )
    clic = result.scalar_one_or_none()

    if clic:
        lead = Lead(
            clic_id=clic.id,
            valeur=0.0,
            source="pixel",
            timestamp=datetime.utcnow()
        )
        db.add(lead)
        await db.commit()

    gif = b"GIF89a\x01\x00\x01\x00\x00\xff\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x00;"
    return Response(content=gif, media_type="image/gif")


# ============================================================
# POSTBACK
# ============================================================
@router.get("/postback")
async def postback(
    token: str,
    valeur: float = 0.0,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Clic).where(Clic.token == token)
    )
    clic = result.scalar_one_or_none()

    if not clic:
        raise HTTPException(status_code=404, detail="Token invalide")

    lead = Lead(
        clic_id=clic.id,
        valeur=valeur,
        source="postback",
        timestamp=datetime.utcnow()
    )
    db.add(lead)
    await db.commit()

    return {"message": "Lead enregistré avec succès", "token": token, "valeur": valeur}