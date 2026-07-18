// ============================================================
// EditeurDetail.js — Page détail d'un éditeur
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

  useEffect(() => {
    chargerDetail();
  }, [id]);

  const chargerDetail = async () => {
    try {
      const response = await api.get(`/admin/editeurs/${id}/stats`);
      setData(response.data);
    } catch (error) {
      console.error("Erreur chargement détail éditeur", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!data) return <div className="p-8">Éditeur introuvable</div>;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/editeurs')} className="text-gray-500 hover:text-gray-700">
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{data.editeur.nom}</h1>
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
          {data.editeur.statut}
        </span>
      </div>

      {/* Infos éditeur */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-3">Informations</h2>
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