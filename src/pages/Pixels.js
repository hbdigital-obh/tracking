// ============================================================
// Pixels.js — Gestion des pixels et postbacks
// ============================================================
import React, { useState, useEffect } from 'react';
import { getCampagnes } from '../services/api';
import api from '../services/api';

function Pixels() {

  const [campagnes, setCampagnes] = useState([]);
  const [campagneSelectionnee, setCampagneSelectionnee] = useState('');
  const [snippet, setSnippet] = useState(null);
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

  const genererSnippet = async () => {
    if (!campagneSelectionnee) return;
    try {
      const response = await api.get(`/admin/pixel/snippet?campagne_id=${campagneSelectionnee}`);
      setSnippet(response.data);
    } catch (error) {
      console.error("Erreur génération snippet", error);
    }
  };

  const copier = (texte) => {
    navigator.clipboard.writeText(texte);
    alert('Copié !');
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🎯 Pixels & Postbacks
      </h1>

      {/* Sélection campagne */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Générer un pixel pour une campagne</h2>
        <div className="flex gap-4">
          <select
            value={campagneSelectionnee}
            onChange={(e) => setCampagneSelectionnee(e.target.value)}
            className="flex-1 border rounded p-2"
          >
            <option value="">Sélectionner une campagne</option>
            {campagnes.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <button
            onClick={genererSnippet}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Générer
          </button>
        </div>
      </div>

      {/* Résultats */}
      {snippet && (
        <div className="space-y-6">

          {/* Pixel JS */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">📄 Pixel JavaScript</h2>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Type: JS</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Colle ce code sur la page de confirmation de l'annonceur (après inscription, achat...).
            </p>
            <div className="bg-gray-900 rounded p-4 relative">
              <pre className="text-green-400 text-xs overflow-x-auto whitespace-pre-wrap">
                {snippet.snippet_js}
              </pre>
              <button
                onClick={() => copier(snippet.snippet_js)}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                📋 Copier
              </button>
            </div>
          </div>

          {/* Postback S2S */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">🔗 URL Postback S2S</h2>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Type: S2S</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              L'annonceur appelle cette URL depuis son serveur quand une conversion se produit.
              Remplace <strong>{'{CLICK_ID}'}</strong> par le token du clic et <strong>{'{AMOUNT}'}</strong> par la valeur.
            </p>
            <div className="bg-gray-900 rounded p-4 relative">
              <pre className="text-green-400 text-xs overflow-x-auto">
                {snippet.postback_url}
              </pre>
              <button
                onClick={() => copier(snippet.postback_url)}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                📋 Copier
              </button>
            </div>
          </div>

          {/* Pixel Image */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">🖼️ Pixel Image (1x1)</h2>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Type: Image</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Alternative au pixel JS. Une image invisible de 1x1 pixel.
            </p>
            <div className="bg-gray-900 rounded p-4 relative">
              <pre className="text-green-400 text-xs overflow-x-auto">
                {`<img src="${snippet.pixel_url}" width="1" height="1" style="display:none;" />`}
              </pre>
              <button
                onClick={() => copier(`<img src="${snippet.pixel_url}" width="1" height="1" style="display:none;" />`)}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                📋 Copier
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default Pixels;