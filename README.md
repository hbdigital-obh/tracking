# HB Digital — Plateforme de Tracking

Plateforme de tracking de liens d'affiliation développée pour remplacer Affilae.

---

## 📋 Description du projet

HB Digital Performance est une agence de marketing digital spécialisée dans l'affiliation. Cette plateforme permet de :
- Tracker les clics sur les liens d'affiliation
- Enregistrer les conversions (leads)
- Visualiser les stats dans un dashboard
- Gérer les éditeurs et campagnes
- Automatiser la récupération des revenus externes

---

## 🏗️ Architecture
[React Dashboard] → [FastAPI Backend] → [PostgreSQL]

↓

[Scripts automatisation]

TradeDoubler / R-Advertising → Airtable
---

## 🛠️ Stack technique

| Technologie | Usage |
|---|---|
| Python 3.14 + FastAPI | Backend API REST |
| SQLAlchemy + Alembic | ORM + migrations BDD |
| PostgreSQL (prod) / SQLite (dev) | Base de données |
| React + Tailwind CSS | Frontend dashboard |
| JWT (python-jose) | Authentification |
| Docker + Nginx | Déploiement VPS |
| Reportlab | Génération PDF |
| Schedule | Automatisation des scripts |

---

## 🚀 Installation en local

### 1. Cloner le repo
```bash
git clone https://github.com/hbdigital-obh/tracking.git
cd tracking
```

### 2. Backend FastAPI
```bash
cd hb-tracking
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend React
```bash
cd dashboard-hb
npm install
npm start
```

### 4. Variables d'environnement
Crée un fichier `.env` dans `hb-tracking` :
DATABASE_URL=sqlite+aiosqlite:///./hbtracking.db

SECRET_KEY=hbdigital-secret-key-2026
---

## 📡 Endpoints API

### Tracking (public)
| Méthode | Route | Description |
|---|---|---|
| GET | /c/{slug_editeur}/{slug_campagne} | Tracker un clic et rediriger |
| GET | /c/pixel.gif?token=XXX | Pixel de tracking |
| GET | /c/postback?token=XXX&valeur=XX | Signal de conversion |

### Admin (protégé JWT)
| Méthode | Route | Description |
|---|---|---|
| POST | /auth/register | Créer un compte admin |
| POST | /auth/login | Se connecter |
| GET | /admin/stats/global | KPIs globaux |
| GET | /admin/stats/evolution | Évolution des clics |
| GET/POST | /admin/editeurs | Gestion des éditeurs |
| GET/POST | /admin/campagnes | Gestion des campagnes |
| GET | /admin/clics | Liste des clics |

---

## 🤖 Scripts automatisation

| Script | Fréquence | Description |
|---|---|---|
| tradedoubler.py | Chaque jour à 7h | Récupère revenus TradeDoubler → Airtable |
| r_advertising.py | Chaque jour à 7h | Récupère revenus R-Advertising → Airtable |
| rapport_pdf.py | Chaque lundi à 8h | Génère rapport PDF hebdomadaire |
| scheduler.py | Permanent | Lance automatiquement les scripts |

Pour lancer le scheduler :
```bash
cd scripts
python scheduler.py
```

---

## 🗄️ Modèle de données

- **editeurs** → les partenaires qui diffusent les liens
- **campagnes** → les offres à promouvoir
- **clics** → chaque clic sur un lien de tracking
- **leads** → les conversions générées
- **utilisateurs** → les comptes admin

---

## 👨‍💻 Développé par

Stagiaire L3 MIAGE — Stage HB Digital Performance 2026