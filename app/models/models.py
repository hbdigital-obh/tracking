# ============================================================
# models.py — Définition des tables de la base de données
# ============================================================

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# ============================================================
# TABLE : Editeurs
# Les partenaires qui diffusent les liens de tracking
# ============================================================
class Editeur(Base):
    __tablename__ = "editeurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)          # Nom de l'éditeur
    slug = Column(String, unique=True, index=True) # Identifiant unique dans l'URL ex: "jean-dupont"
    email = Column(String, unique=True)            # Email de contact
    statut = Column(String, default="actif")       # actif / inactif
    date_creation = Column(DateTime, default=datetime.utcnow)

    # Un éditeur peut avoir plusieurs clics (relation 1 → N)
    clics = relationship("Clic", back_populates="editeur")

# ============================================================
# TABLE : Campagnes
# Les offres à promouvoir (ex: "Campagne Crédit Agricole")
# ============================================================
class Campagne(Base):
    __tablename__ = "campagnes"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)            # Nom de la campagne
    slug = Column(String, unique=True, index=True)  # Identifiant unique dans l'URL
    url_destination = Column(String, nullable=False) # URL vers laquelle on redirige
    statut = Column(String, default="active")        # active / inactive
    date_creation = Column(DateTime, default=datetime.utcnow)

    # Une campagne peut avoir plusieurs clics (relation 1 → N)
    clics = relationship("Clic", back_populates="campagne")

# ============================================================
# TABLE : Clics
# Chaque clic sur un lien de tracking
# ============================================================
class Clic(Base):
    __tablename__ = "clics"

    id = Column(Integer, primary_key=True, index=True)
    # Clés étrangères : à quel éditeur et quelle campagne ce clic appartient
    editeur_id = Column(Integer, ForeignKey("editeurs.id"))
    campagne_id = Column(Integer, ForeignKey("campagnes.id"))
    timestamp = Column(DateTime, default=datetime.utcnow) # Quand le clic a eu lieu
    ip_anonyme = Column(String)                            # IP anonymisée (RGPD)
    device = Column(String)                                # mobile / desktop / tablet
    token = Column(String, unique=True, index=True)        # Token unique pour identifier ce clic

    # Relations vers les autres tables
    editeur = relationship("Editeur", back_populates="clics")
    campagne = relationship("Campagne", back_populates="clics")
    lead = relationship("Lead", back_populates="clic", uselist=False)

# ============================================================
# TABLE : Leads
# Une conversion générée par un clic (ex: formulaire rempli)
# ============================================================
class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    clic_id = Column(Integer, ForeignKey("clics.id"), unique=True) # Un lead = un seul clic
    valeur = Column(Float, default=0.0)      # Valeur monétaire du lead en euros
    source = Column(String)                  # "pixel" ou "postback"
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relation vers le clic qui a généré ce lead
    clic = relationship("Clic", back_populates="lead")

# ============================================================
# TABLE : Utilisateurs
# Les comptes admin qui accèdent au dashboard
# ============================================================
class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    mot_de_passe_hash = Column(String, nullable=False) # On ne stocke JAMAIS le mot de passe en clair
    role = Column(String, default="admin")
    date_creation = Column(DateTime, default=datetime.utcnow)