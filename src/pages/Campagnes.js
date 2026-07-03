// ============================================================
// Campagnes.js — Page de gestion des campagnes
// ============================================================
import React, { useState, useEffect } from 'react';
import { getCampagnes, creerCampagne } from '../services/api';

function Campagnes() {

  const [campagnes, setCampagnes] = useState([]);
  const [formulaire, setFormulaire] = useState({
    nom: '',
    slug: '',
    url_destination: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    chargerCampagnes();
  }, []);

  const chargerCampagnes = async () => {
    try {
      const data = await getCampagnes();
      setCampagnes(data);
    } catch (error) {
      console.error("Erreur chargement campagnes", error);
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
      await creerCampagne(formulaire);
      setMessage("Campagne créée avec succès !");
      chargerCampagnes();
      setFormulaire({ nom: '', slug: '', url_destination: '' });
    } catch (error) {
      setMessage("Erreur lors de la création de la campagne");
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Gestion des campagnes
      </h1>

      {/* Formulaire de création */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Créer une campagne</h2>

        {message && (
          <p className="text-green-600 mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom de la campagne"
            value={formulaire.nom}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug (ex: credit-agricole)"
            value={formulaire.slug}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            type="url"
            name="url_destination"
            placeholder="URL destination"
            value={formulaire.url_destination}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <button
            type="submit"
            className="col-span-3 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Créer la campagne
          </button>
        </form>
      </div>

      {/* Tableau des campagnes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">
          Liste des campagnes ({campagnes.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">URL destination</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Date création</th>
            </tr>
          </thead>
          <tbody>
            {campagnes.map((campagne) => (
              <tr key={campagne.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{campagne.nom}</td>
                <td className="p-3 text-blue-600">{campagne.slug}</td>
                <td className="p-3">
                  <a
                    href={campagne.url_destination}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {campagne.url_destination}
                  </a>
                </td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    {campagne.statut}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(campagne.date_creation).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Campagnes;