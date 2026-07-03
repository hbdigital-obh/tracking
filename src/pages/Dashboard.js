// ============================================================
// Dashboard.js — Page principale avec les stats
// ============================================================
import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { getStatsGlobal, getClics } from '../services/api';

// useState → permet de stocker des données dans le composant
// useEffect → permet d'exécuter du code au chargement de la page
// C'est comme un constructeur en Java

function Dashboard() {

  // On déclare les variables d'état
  // stats → les KPIs globaux (clics, leads, revenu...)
  // clics → la liste des derniers clics
  // loading → true pendant le chargement, false quand c'est prêt
  const [stats, setStats] = useState(null);
  const [clics, setClics] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect s'exécute automatiquement quand la page se charge
  // C'est ici qu'on appelle notre API FastAPI
  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        // On appelle l'API pour récupérer les stats et les clics
        const statsData = await getStatsGlobal();
        const clicsData = await getClics();
        setStats(statsData);
        setClics(clicsData);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
      } finally {
        setLoading(false);
      }
    };
    chargerDonnees();
  }, []); // [] = s'exécute une seule fois au chargement

  // Si les données sont en cours de chargement, on affiche un message
  if (loading) {
    return <div className="p-8 text-gray-500">Chargement...</div>;
  }

  return (
    <div className="p-8">

      {/* Titre de la page */}
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