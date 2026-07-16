// ============================================================
// api.js — Configuration des appels vers notre API FastAPI
// ============================================================

import axios from 'axios';

// L'URL de base de notre API FastAPI qui tourne en local
const API_BASE_URL = 'http://62.238.12.184:8000';

// On crée une instance axios configurée avec l'URL de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Récupérer les stats globales
export const getStatsGlobal = async () => {
  const response = await api.get('/admin/stats/global');
  return response.data;
};

// Récupérer la liste des éditeurs
export const getEditeurs = async () => {
  const response = await api.get('/admin/editeurs');
  return response.data;
};

// Créer un éditeur
export const creerEditeur = async (editeur) => {
  const response = await api.post('/admin/editeurs', editeur);
  return response.data;
};

// Récupérer la liste des campagnes
export const getCampagnes = async () => {
  const response = await api.get('/admin/campagnes');
  return response.data;
};

// Créer une campagne
export const creerCampagne = async (campagne) => {
  const response = await api.post('/admin/campagnes', campagne);
  return response.data;
};

// Récupérer la liste des clics
export const getClics = async (page = 1) => {
  const response = await api.get(`/admin/clics?page=${page}&limite=50`);
  return response.data;
};

// Récupérer l'évolution des clics sur 30 jours
export const getEvolution = async () => {
  const response = await api.get('/admin/stats/evolution');
  return response.data;
};

export default api;