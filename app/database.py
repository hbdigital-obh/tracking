# ============================================================
# database.py — Configuration de la connexion à la base de données
# ============================================================

# On importe les outils SQLAlchemy pour travailler en mode async
# "async" veut dire que l'app n'est pas bloquée pendant une requête SQL
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# On importe les outils pour lire le fichier .env
from dotenv import load_dotenv
import os

# On charge les variables d'environnement depuis le fichier .env
# Ex: DATABASE_URL, SECRET_KEY, etc.
load_dotenv()

# On récupère l'URL de la base de données depuis .env
# Si elle n'existe pas, on utilise SQLite en local par défaut
# SQLite = une base de données simple stockée dans un fichier local
# Sur le VPS, cette variable pointera vers PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./hbtracking.db")

# On crée le moteur de connexion à la base de données
# echo=True = affiche toutes les requêtes SQL dans le terminal (utile pour débugger)
engine = create_async_engine(DATABASE_URL, echo=True)

# On crée une "fabrique de sessions"
# Une session = une conversation ouverte avec la base de données
# expire_on_commit=False = les objets restent accessibles après un commit
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Classe de base dont tous nos modèles (tables) vont hériter
# C'est comme une classe abstraite en Java
class Base(DeclarativeBase):
    pass

# Fonction qui ouvre une session et la fournit à une route
# Le "yield" fait que la session reste ouverte pendant toute la requête
# puis se ferme automatiquement à la fin — comme un try/finally
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session