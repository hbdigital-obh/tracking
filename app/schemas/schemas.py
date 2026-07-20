# ============================================================
# schemas.py — Validation des données entrantes et sortantes
# ============================================================

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ============================================================
# SCHÉMAS : Editeur
# ============================================================

class EditeurCreate(BaseModel):
    nom: str
    email: str
    slug: str
    statut: str = "actif"

class EditeurRead(BaseModel):
    id: int
    nom: str
    slug: str
    email: str
    statut: str
    date_creation: datetime

    model_config = {"from_attributes": True}

# ============================================================
# SCHÉMAS : Campagne
# ============================================================

class CampagneCreate(BaseModel):
    nom: str
    slug: str
    url_destination: str
    statut: str = "active"  # ← AJOUTÉ

class CampagneRead(BaseModel):
    id: int
    nom: str
    slug: str
    url_destination: str
    statut: str
    date_creation: datetime

    model_config = {"from_attributes": True}

# ============================================================
# SCHÉMAS : Clic
# ============================================================

class ClicRead(BaseModel):
    id: int
    editeur_id: int
    campagne_id: int
    timestamp: datetime
    ip_anonyme: str
    device: str
    token: str
    is_suspect: bool = False

    model_config = {"from_attributes": True}

# ============================================================
# SCHÉMAS : Lead
# ============================================================

class LeadRead(BaseModel):
    id: int
    clic_id: int
    valeur: float
    source: str
    timestamp: datetime

    model_config = {"from_attributes": True}

# ============================================================
# SCHÉMAS : Authentification
# ============================================================

class LoginSchema(BaseModel):
    email: str
    mot_de_passe: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"