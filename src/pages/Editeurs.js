// ============================================================
// Editeurs.js — Liste des éditeurs uniquement
// ============================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEditeurs, getCampagnes } from '../services/api';

function Editeurs() {
  const navigate = useNavigate();
  const [editeurs, setEditeurs] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const genererLien = () => {
    if (!editeurSelectionne || !campagneSelectionnee) {
      setLienGenere('');
      return;
    }
    const lien = `http://62.238.12.184:8000/c/${editeurSelectionne}/${campagneSelectionnee}`;
    setLienGenere(lien);
  };

  const copierLien = () => {
    navigator.clipboard.writeText(lienGenere);
    alert('Lien copié !');
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Liste des éditeurs</h1>
        <button
          onClick={() => navigate('/editeurs/creer')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Nouvel éditeur
        </button>
      </div>

      {/* Générateur de liens */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-blue-800 mb-4">🔗 Générateur de liens de tracking</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Éditeur</label>
            <select value={editeurSelectionne} onChange={(e) => setEditeurSelectionne(e.target.value)} className="w-full border rounded p-2">
              <option value="">Sélectionner un éditeur</option>
              {editeurs.map((e) => (<option key={e.id} value={e.slug}>{e.nom}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campagne</label>
            <select value={campagneSelectionnee} onChange={(e) => setCampagneSelectionnee(e.target.value)} className="w-full border rounded p-2">
              <option value="">Sélectionner une campagne</option>
              {campagnes.map((c) => (<option key={c.id} value={c.slug}>{c.nom}</option>))}
            </select>
          </div>
        </div>
        <button onClick={genererLien} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4">
          Générer le lien
        </button>
        {lienGenere && (
          <div className="flex items-center gap-2 bg-white border rounded p-3">
            <span className="text-blue-600 flex-1 text-sm">{lienGenere}</span>
            <button onClick={copierLien} className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm">📋 Copier</button>
          </div>
        )}
      </div>

      {/* Tableau des éditeurs */}
      <div className="bg-white rounded-lg shadow p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">ID</th>
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
                <td className="p-3 text-gray-400">{editeur.id}</td>
                <td className="p-3 font-medium">{editeur.nom}</td>
                <td className="p-3">{editeur.email}</td>
                <td className="p-3 text-blue-600">{editeur.slug}</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{editeur.statut}</span>
                </td>
                <td className="p-3">{new Date(editeur.date_creation).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Editeurs;