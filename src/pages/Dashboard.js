// ============================================================
// Dashboard.js — Page principale avec les stats
// ============================================================
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { getStatsGlobal, getClics, getEvolution } from '../services/api';

function Dashboard() {

  const [stats, setStats] = useState(null);
  const [clics, setClics] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [statsData, clicsData, evolutionData] = await Promise.all([
          getStatsGlobal(),
          getClics(),
          getEvolution()
        ]);
        setStats(statsData);
        setClics(clicsData);
        setEvolution(evolutionData);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
      } finally {
        setLoading(false);
      }
    };
    chargerDonnees();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">Chargement...</div>;
  }

  return (
    <div className="p-8">

      {/* Titre */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard — Vue globale
      </h1>

      {/* Les 4 cartes KPI */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          titre="Total Clics"
          valeur={stats?.total_clics ?? 0}
          couleur="border-blue-500"
        />
        <StatCard
          titre="Total Leads"
          valeur={stats?.total_leads ?? 0}
          couleur="border-green-500"
        />
        <StatCard
          titre="Taux de conversion"
          valeur={`${stats?.taux_conversion ?? 0}%`}
          couleur="border-purple-500"
        />
        <StatCard
          titre="Revenu total"
          valeur={`${stats?.revenu_total ?? 0}€`}
          couleur="border-yellow-500"
        />
      </div>

      {/* Graphique évolution */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Évolution des clics — 30 derniers jours
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="clics"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau des derniers clics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Derniers clics
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Éditeur</th>
              <th className="p-3 text-left">Campagne</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Device</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Dashboard;