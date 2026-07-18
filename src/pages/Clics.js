// ============================================================
// Clics.js — Liste des clics avec mise en évidence suspects
// ============================================================
import React, { useState, useEffect } from 'react';
import { getClics } from '../services/api';

function Clics() {

  const [clics, setClics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [afficherSuspects, setAfficherSuspects] = useState(true);

  useEffect(() => {
    chargerClics();
  }, [page]);

  // Rafraîchissement automatique toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      chargerClics();
    }, 60000);
    return () => clearInterval(interval);
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

  // Filtre les clics selon le filtre suspects
  const clicsFiltres = afficherSuspects
    ? clics
    : clics.filter(c => !c.is_suspect);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Journal des clics</h1>
        <div className="flex items-center gap-3">
          {/* Filtre suspects */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={afficherSuspects}
              onChange={(e) => setAfficherSuspects(e.target.checked)}
              className="rounded"
            />
            Afficher clics suspects
          </label>
          <button
            onClick={chargerClics}
            className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">

        {/* Légende */}
        <div className="flex gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-white border rounded inline-block"></span>
            Clic normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-100 border border-orange-300 rounded inline-block"></span>
            Clic suspect
          </span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Éditeur</th>
              <th className="p-3 text-left">Campagne</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Device</th>
              <th className="p-3 text-left">IP</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Token</th>
            </tr>
          </thead>
          <tbody>
            {clicsFiltres.map((clic) => (
              <tr
                key={clic.id}
                className={`border-t ${clic.is_suspect ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'}`}
              >
                <td className="p-3">{clic.id}</td>
                <td className="p-3">{clic.editeur_id}</td>
                <td className="p-3">{clic.campagne_id}</td>
                <td className="p-3">{new Date(clic.timestamp).toLocaleString('fr-FR')}</td>
                <td className="p-3">{clic.device}</td>
                <td className="p-3 text-xs text-gray-500">{clic.ip_anonyme}</td>
                <td className="p-3">
                  {clic.is_suspect ? (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                      ⚠️ Suspect
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      ✅ Normal
                    </span>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-400">{clic.token?.slice(0, 8)}...</td>
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