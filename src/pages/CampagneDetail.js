// ============================================================
// CampagneDetail.js — Page détail d'une campagne avec modification
// ============================================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../services/api';

function CampagneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modeEdition, setModeEdition] = useState(false);
  const [formulaire, setFormulaire] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    chargerDetail();
  }, [id]);

  const chargerDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/campagnes/${id}/stats`);
      setData(response.data);
      setFormulaire({
        nom: response.data.campagne.nom,
        slug: response.data.campagne.slug,
        url_destination: response.data.campagne.url_destination,
        statut: response.data.campagne.statut
      });
    } catch (error) {
      console.error("Erreur chargement détail campagne", error);
    } finally {
      setLoading(false);
    }
  };

  const sauvegarder = async () => {
    try {
      await api.put(`/admin/campagnes/${id}`, formulaire);
      setMessage("Campagne modifiée avec succès !");
      setModeEdition(false);
      await chargerDetail();
    } catch (error) {
      setMessage("Erreur lors de la modification");
    }
  };

  const changerStatut = async (nouveauStatut) => {
    const messages = {
      "pause": "Mettre en pause cette campagne ?",
      "active": "Réactiver cette campagne ?",
      "terminee": "Terminer cette campagne ?"
    };
    if (!window.confirm(messages[nouveauStatut])) return;
    try {
      await api.put(`/admin/campagnes/${id}/statut?statut=${nouveauStatut}`);
      setMessage(`Campagne ${nouveauStatut === 'active' ? 'réactivée' : nouveauStatut === 'pause' ? 'mise en pause' : 'terminée'} !`);
      await chargerDetail();
    } catch (error) {
      setMessage("Erreur lors du changement de statut");
    }
  };

  const copier = (texte) => {
    navigator.clipboard.writeText(texte);
    alert('Copié !');
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!data) return <div className="p-8">Campagne introuvable</div>;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/campagnes')} className="text-gray-500 hover:text-gray-700">
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{data.campagne.nom}</h1>
          <span className={`px-2 py-1 rounded-full text-xs ${
            data.campagne.statut === 'active' ? 'bg-green-100 text-green-700' :
            data.campagne.statut === 'pause' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {data.campagne.statut}
          </span>
        </div>
        <div className="flex gap-2">
          {!modeEdition ? (
            <>
              <button onClick={() => setModeEdition(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                ✏️ Modifier
              </button>
              {data.campagne.statut === 'active' && (
                <button onClick={() => changerStatut('pause')} className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-200 text-sm">
                  ⏸️ Pause
                </button>
              )}
              {data.campagne.statut === 'pause' && (
                <button onClick={() => changerStatut('active')} className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 text-sm">
                  ▶️ Réactiver
                </button>
              )}
              {data.campagne.statut === 'terminee' && (
                <button onClick={() => changerStatut('active')} className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 text-sm">
                  ▶️ Réactiver
                </button>
              )}
              {data.campagne.statut !== 'terminee' && (
                <button onClick={() => changerStatut('terminee')} className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 text-sm">
                  🛑 Terminer
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={sauvegarder} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                ✅ Sauvegarder
              </button>
              <button onClick={() => setModeEdition(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm">
                Annuler
              </button>
            </>
          )}
        </div>
      </div>

      {message && <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">{message}</div>}

      {/* Infos campagne */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-3">Informations</h2>
        {modeEdition ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nom</label>
              <input type="text" value={formulaire.nom} onChange={(e) => setFormulaire({...formulaire, nom: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Slug</label>
              <input type="text" value={formulaire.slug} onChange={(e) => setFormulaire({...formulaire, slug: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">URL destination</label>
              <input type="url" value={formulaire.url_destination} onChange={(e) => setFormulaire({...formulaire, url_destination: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Slug</p>
              <p className="font-medium text-blue-600">{data.campagne.slug}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">URL destination</p>
              <a href={data.campagne.url_destination} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">
                {data.campagne.url_destination}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Clics</p>
          <p className="text-3xl font-bold">{data.stats.total_clics}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Leads</p>
          <p className="text-3xl font-bold">{data.stats.total_leads}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Taux conversion</p>
          <p className="text-3xl font-bold">{data.stats.taux_conversion}%</p>
        </div>
      </div>

      {/* Graphique évolution */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Évolution des clics — 30 derniers jours</h2>
        {data.evolution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.evolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="clics" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">Aucun clic sur les 30 derniers jours</p>
        )}
      </div>

      {/* Stats par éditeur */}
      {data.stats_editeurs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Répartition des clics par éditeur</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.stats_editeurs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="editeur_nom" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_clics" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pixel & Postback */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">🎯 Intégration pixel</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">URL Postback S2S</p>
            <div className="flex items-center gap-2 bg-gray-900 rounded p-3">
              <span className="text-green-400 text-xs flex-1">
                http://62.238.12.184:8000/c/postback?token={'{CLICK_ID}'}&valeur={'{AMOUNT}'}
              </span>
              <button
                onClick={() => copier(`http://62.238.12.184:8000/c/postback?token={CLICK_ID}&valeur={AMOUNT}`)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                📋 Copier
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default CampagneDetail;