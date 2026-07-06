// ============================================================
// Clics.js — Page qui affiche tous les clics
// ============================================================
import React, { useState, useEffect } from 'react';
import { getClics } from '../services/api';

function Clics() {

  const [clics, setClics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    chargerClics();
  }, [page]);

  const chargerClics = async () => {
    try {
      const data = await getClics(page);
      setClics(data);
    } catch (error) {
      console.error("Erreur chargement clics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Liste des clics
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Éditeur</th>
              <th className="p-3 text-left">Campagne</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Device</th>
              <th className="p-3 text-left">Token</th>
            </tr>
          </thead>
          <tbody>
            {clics.map((clic) => (
              <tr key={clic.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{clic.id}</td>
                <td className="p-3">{clic.editeur_id}</td>
                <td className="p-3">{clic.campagne_id}</td>
                <td className="p-3">
                  {new Date(clic.timestamp).toLocaleString('fr-FR')}
                </td>
                <td className="p-3">{clic.device}</td>
                <td className="p-3 text-xs text-gray-400">{clic.token}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={clics.length < 50}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>

      </div>
    </div>
  );
}

export default Clics;