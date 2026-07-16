// ============================================================
// Editeurs.js — Page de gestion des éditeurs + générateur de liens
// ============================================================
import React, { useState, useEffect } from 'react';
import { getEditeurs, creerEditeur, getCampagnes } from '../services/api';

function Editeurs() {

  const [editeurs, setEditeurs] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [formulaire, setFormulaire] = useState({
    nom: '',
    email: '',
    slug: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Générateur de liens
  const [editeurSelectionne, setEditeurSelectionne] = useState('');
  const [campagneSelectionnee, setCampagneSelectionnee] = useState('');
  const [lienGenere, setLienGenere] = useState('');

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [editeursData, campagnesData] = await Promise.all([
        getEditeurs(),
        getCampagnes()
      ]);
      setEditeurs(editeursData);
      setCampagnes(campagnesData);
    } catch (error) {
      console.error("Erreur chargement", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormulaire({
      ...formulaire,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creerEditeur(formulaire);
      setMessage("Éditeur créé avec succès !");
      chargerDonnees();
      setFormulaire({ nom: '', email: '', slug: '' });
    } catch (error) {
      setMessage("Erreur lors de la création de l'éditeur");
    }
  };

  // Génère le lien de tracking
  const genererLien = () => {
    if (!editeurSelectionne || !campagneSelectionnee) {
      setLienGenere('');
      return;
    }
    const baseUrl = 'http://127.0.0.1:8000';
    const lien = `${baseUrl}/c/${editeurSelectionne}/${campagneSelectionnee}`;
    setLienGenere(lien);
  };

  // Copie le lien dans le presse-papier
  const copierLien = () => {
    navigator.clipboard.writeText(lienGenere);
    alert('Lien copié !');
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Gestion des éditeurs
      </h1>

      {/* Générateur de liens */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-blue-800 mb-4">
          🔗 Générateur de liens de tracking
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Éditeur
            </label>
            <select
              value={editeurSelectionne}
              onChange={(e) => setEditeurSelectionne(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Sélectionner un éditeur</option>
              {editeurs.map((e) => (
                <option key={e.id} value={e.slug}>{e.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campagne
            </label>
            <select
              value={campagneSelectionnee}
              onChange={(e) => setCampagneSelectionnee(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Sélectionner une campagne</option>
              {campagnes.map((c) => (
                <option key={c.id} value={c.slug}>{c.nom}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={genererLien}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
        >
          Générer le lien
        </button>

        {lienGenere && (
          <div className="flex items-center gap-2 bg-white border rounded p-3">
            <span className="text-blue-600 flex-1 text-sm">{lienGenere}</span>
            <button
              onClick={copierLien}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
            >
              📋 Copier
            </button>
          </div>
        )}
      </div>

      {/* Formulaire de création */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Créer un éditeur</h2>

        {message && (
          <p className="text-green-600 mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formulaire.nom}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formulaire.email}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug (ex: jean-dupont)"
            value={formulaire.slug}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <button
            type="submit"
            className="col-span-3 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Créer l'éditeur
          </button>
        </form>
      </div>

      {/* Tableau des éditeurs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">
          Liste des éditeurs ({editeurs.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Date création</th>
            </tr>
          </thead>
          <tbody>
            {editeurs.map((editeur) => (
              <tr key={editeur.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{editeur.nom}</td>
                <td className="p-3">{editeur.email}</td>
                <td className="p-3 text-blue-600">{editeur.slug}</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    {editeur.statut}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(editeur.date_creation).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Editeurs;