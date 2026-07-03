# ============================================================
# main.py — Point d'entrée de l'application FastAPI
# ============================================================

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import engine, Base

# On importe les routes qu'on va créer juste après
from app.routes import tracking, admin

# ============================================================
# Fonction qui s'exécute au démarrage de l'application
# Elle crée automatiquement toutes les tables en base de données
# si elles n'existent pas encore
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

# ============================================================
# Création de l'application FastAPI
# ============================================================
app = FastAPI(
    title="HB Digital Tracking",
    description="Plateforme de tracking de liens d'affiliation",
    version="1.0.0",
    lifespan=lifespan
)

# ============================================================
# On connecte les routes à l'application
# Chaque "router" regroupe un ensemble d'endpoints
# ============================================================
app.include_router(tracking.router, prefix="/c", tags=["Tracking"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

# ============================================================
# Route de base pour vérifier que l'API fonctionne
# ============================================================
@app.get("/")
async def root():
    return {"message": "HB Digital Tracking API — opérationnelle ✅"}