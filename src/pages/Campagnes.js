// ============================================================
// Campagnes.js — Liste des campagnes uniquement
// ============================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampagnes } from '../services/api';

function Campagnes() {
  const navigate = useNavigate();
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const couleurStatut = (statut) => {
    switch(statut) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pause': return 'bg-yellow-100 text-yellow-700';
      case 'terminee': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Liste des campagnes</h1>
        <button
          onClick={() => navigate('/campagnes/creer')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Nouvelle campagne
        </button>
      </div>

      {/* Tableau des campagnes */}
      <div className="bg-white rounded-lg shadow p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">ID</th>
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
                <td className="p-3 text-gray-400">{campagne.id}</td>
                <td className="p-3 font-medium">
                  <button
                    onClick={() => navigate(`/campagnes/${campagne.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    {campagne.nom}
                  </button>
                </td>
                <td className="p-3 text-blue-600">{campagne.slug}</td>
                <td className="p-3">
                  <a href={campagne.url_destination} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">
                    {campagne.url_destination}
                  </a>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${couleurStatut(campagne.statut)}`}>
                    {campagne.statut}
                  </span>
                </td>
                <td className="p-3">{new Date(campagne.date_creation).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Campagnes;