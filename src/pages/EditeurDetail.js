// ============================================================
// EditeurDetail.js — Page détail d'un éditeur avec modification
// ============================================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

function EditeurDetail() {
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
    try {
      const response = await api.get(`/admin/editeurs/${id}/stats`);
      setData(response.data);
      setFormulaire({
        nom: response.data.editeur.nom,
        email: response.data.editeur.email,
        slug: response.data.editeur.slug,
        statut: response.data.editeur.statut
      });
    } catch (error) {
      console.error("Erreur chargement détail éditeur", error);
    } finally {
      setLoading(false);
    }
  };

  const sauvegarder = async () => {
    try {
      await api.put(`/admin/editeurs/${id}`, formulaire);
      setMessage("Éditeur modifié avec succès !");
      setModeEdition(false);
      chargerDetail();
    } catch (error) {
      setMessage("Erreur lors de la modification");
    }
  };

  const desactiver = async () => {
    if (!window.confirm("Désactiver cet éditeur ? L'historique sera conservé.")) return;
    try {
      await api.delete(`/admin/editeurs/${id}`);
      setMessage("Éditeur désactivé !");
      chargerDetail();
    } catch (error) {
      setMessage("Erreur lors de la désactivation");
    }
  };

  const reactiver = async () => {
    if (!window.confirm("Réactiver cet éditeur ?")) return;
    try {
      await api.put(`/admin/editeurs/${id}`, {
        ...formulaire,
        statut: "actif"
      });
      setMessage("Éditeur réactivé !");
      chargerDetail();
    } catch (error) {
      setMessage("Erreur lors de la réactivation");
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!data) return <div className="p-8">Éditeur introuvable</div>;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/editeurs')} className="text-gray-500 hover:text-gray-700">
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{data.editeur.nom}</h1>
          <span className={`px-2 py-1 rounded-full text-xs ${data.editeur.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {data.editeur.statut}
          </span>
        </div>
        <div className="flex gap-2">
          {!modeEdition ? (
            <>
              <button onClick={() => setModeEdition(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                ✏️ Modifier
              </button>
              {data.editeur.statut === 'actif' ? (
                <button onClick={desactiver} className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 text-sm">
                  🚫 Désactiver
                </button>
              ) : (
                <button onClick={reactiver} className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 text-sm">
                  ✅ Réactiver
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

      {/* Infos éditeur */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-3">Informations</h2>
        {modeEdition ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nom</label>
              <input type="text" value={formulaire.nom} onChange={(e) => setFormulaire({...formulaire, nom: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <input type="email" value={formulaire.email} onChange={(e) => setFormulaire({...formulaire, email: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Slug</label>
              <input type="text" value={formulaire.slug} onChange={(e) => setFormulaire({...formulaire, slug: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{data.editeur.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Slug</p>
              <p className="font-medium text-blue-600">{data.editeur.slug}</p>
            </div>
            <div>
              <p className="text-gray-500">ID</p>
              <p className="font-medium">#{data.editeur.id}</p>
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

      {/* Graphique */}
      <div className="bg-white rounded-lg shadow p-6">
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

    </div>
  );
}

export default EditeurDetail;