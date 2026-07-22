# ============================================================
# Dockerfile — Image de production HB Digital Tracking
# ============================================================

# On utilise Python 3.12 slim (léger)
FROM python:3.12-slim

# Répertoire de travail dans le conteneur
WORKDIR /app

# On copie les dépendances en premier (cache Docker)
COPY requirements.txt .

# Installation des dépendances
RUN pip install --no-cache-dir -r requirements.txt

# On copie tout le code
COPY . .

# Port exposé
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]