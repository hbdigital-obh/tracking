# ============================================================
# auth.py — Authentification JWT
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.database import get_db
from app.models.models import Utilisateur
from app.schemas.schemas import LoginSchema, TokenSchema

router = APIRouter()

# ============================================================
# Configuration JWT
# ============================================================
SECRET_KEY = "hbdigital-secret-key-2026"  # À changer en production !
ALGORITHM = "HS256"
EXPIRATION_MINUTES = 60  # Le token expire après 60 minutes

# Outil pour hasher et vérifier les mots de passe
# On ne stocke JAMAIS un mot de passe en clair dans la base de données
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

# ============================================================
# Fonctions utilitaires
# ============================================================

def verifier_mot_de_passe(mot_de_passe, hash):
    # Vérifie si le mot de passe correspond au hash stocké en BDD
    return pwd_context.verify(mot_de_passe, hash)

def hasher_mot_de_passe(mot_de_passe):
    # Transforme un mot de passe en hash sécurisé
    return pwd_context.hash(mot_de_passe)

def creer_token(data: dict):
    # Crée un token JWT avec une date d'expiration
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ============================================================
# ROUTE : Créer un admin (temporaire pour les tests)
# URL : POST /auth/register
# ============================================================
@router.post("/register")
async def register(data: LoginSchema, db: AsyncSession = Depends(get_db)):
    # On hashe le mot de passe avant de le stocker
    hash = hasher_mot_de_passe(data.mot_de_passe)
    utilisateur = Utilisateur(
        email=data.email,
        mot_de_passe_hash=hash
    )
    db.add(utilisateur)
    await db.commit()
    return {"message": "Compte créé avec succès"}

# ============================================================
# ROUTE : Login — retourne un token JWT
# URL : POST /auth/login
# ============================================================
@router.post("/login", response_model=TokenSchema)
async def login(data: LoginSchema, db: AsyncSession = Depends(get_db)):
    # On cherche l'utilisateur par email
    result = await db.execute(
        select(Utilisateur).where(Utilisateur.email == data.email)
    )
    utilisateur = result.scalar_one_or_none()

    # Si l'utilisateur n'existe pas ou mot de passe incorrect → erreur
    if not utilisateur or not verifier_mot_de_passe(data.mot_de_passe, utilisateur.mot_de_passe_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    # On crée et retourne le token JWT
    token = creer_token({"sub": utilisateur.email})
    return {"access_token": token, "token_type": "bearer"}