# ============================================================
# main.py — Point d'entrée de l'application FastAPI
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.routes import tracking, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="HB Digital Tracking",
    description="Plateforme de tracking de liens d'affiliation",
    version="1.0.0",
    lifespan=lifespan
)

# ============================================================
# CORS — Autorise le dashboard React à appeler l'API
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # L'adresse du dashboard React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tracking.router, prefix="/c", tags=["Tracking"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "HB Digital Tracking API — opérationnelle ✅"}