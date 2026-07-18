// ============================================================
// CreerEditeur.js — Page de création d'un éditeur
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { creerEditeur } from '../services/api';

function CreerEditeur() {
  const navigate = useNavigate();
  const [formulaire, setFormulaire] = useState({
    nom: '',
    email: '',
    slug: ''
  });
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  const handleChange = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  // Génère automatiquement le slug depuis le nom
  const genererSlug = (nom) => {
    return nom.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  };

  const handleNomChange = (e) => {
    const nom = e.target.value;
    setFormulaire({
      ...formulaire,
      nom: nom,
      slug: genererSlug(nom)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      await creerEditeur(formulaire);
      setMessage("Éditeur créé avec succès !");
      setTimeout(() => navigate('/editeurs'), 1500);
    } catch (error) {
      setErreur("Erreur lors de la création. Le slug ou l'email existe déjà.");
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/editeurs')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Créer un éditeur</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">

        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
        {erreur && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{erreur}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              name="nom"
              value={formulaire.nom}
              onChange={handleNomChange}
              className="w-full border rounded p-3"
              placeholder="Ex: Jean Dupont"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formulaire.email}
              onChange={handleChange}
              className="w-full border rounded p-3"
              placeholder="jean@dupont.fr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug * <span className="text-gray-400 text-xs">(généré automatiquement)</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formulaire.slug}
              onChange={handleChange}
              className="w-full border rounded p-3 bg-gray-50"
              placeholder="jean-dupont"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Ce slug sera utilisé dans l'URL de tracking : /c/<strong>{formulaire.slug || 'slug'}</strong>/campagne
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-medium"
          >
            Créer l'éditeur
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreerEditeur;