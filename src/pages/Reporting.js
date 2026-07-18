// ============================================================
// Reporting.js — Page de reporting avec stats par éditeur/campagne
// ============================================================
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Reporting() {

  const [statsEditeurs, setStatsEditeurs] = useState([]);
  const [statsCampagnes, setStatsCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('30');
  const [onglet, setOnglet] = useState('editeurs');

  useEffect(() => {
    chargerStats();
  }, [periode]);

  const chargerStats = async () => {
    setLoading(true);
    try {
      const [resEditeurs, resCampagnes] = await Promise.all([
        api.get('/admin/stats/editeurs'),
        api.get('/admin/stats/campagnes')
      ]);
      setStatsEditeurs(resEditeurs.data);
      setStatsCampagnes(resCampagnes.data);
    } catch (error) {
      console.error("Erreur chargement stats", error);
    } finally {
      setLoading(false);
    }
  };

  const exporterCSV = async () => {
    try {
      const response = await api.get(`/admin/export/csv?periode=${periode}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tracking_hbdigital_${new Date().toISOString().slice(0,7)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur export CSV", error);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reporting</h1>
        <div className="flex gap-3">
          {/* Filtre période */}
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="border rounded p-2 text-sm"
          >
            <option value="1">Aujourd'hui</option>
            <option value="7">Cette semaine</option>
            <option value="30">Ce mois-ci</option>
            <option value="60">Mois dernier</option>
            <option value="90">3 derniers mois</option>
          </select>
          {/* Bouton export CSV */}
          <button
            onClick={exporterCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            📥 Exporter CSV
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setOnglet('editeurs')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${onglet === 'editeurs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          👥 Par éditeur
        </button>
        <button
          onClick={() => setOnglet('campagnes')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${onglet === 'campagnes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          📢 Par campagne
        </button>
      </div>

      {/* Stats par éditeur */}
      {onglet === 'editeurs' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Performance par éditeur</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="p-3 text-left">Éditeur</th>
                <th className="p-3 text-left">Total Clics</th>
                <th className="p-3 text-left">Total Leads</th>
                <th className="p-3 text-left">Taux conversion</th>
              </tr>
            </thead>
            <tbody>
              {statsEditeurs.map((stat) => (
                <tr key={stat.editeur_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{stat.editeur_nom}</td>
                  <td className="p-3">{stat.total_clics}</td>
                  <td className="p-3">{stat.total_leads}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${stat.taux_conversion > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {stat.taux_conversion}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats par campagne */}
      {onglet === 'campagnes' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Performance par campagne</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="p-3 text-left">Campagne</th>
                <th className="p-3 text-left">URL destination</th>
                <th className="p-3 text-left">Total Clics</th>
                <th className="p-3 text-left">Total Leads</th>
                <th className="p-3 text-left">Taux conversion</th>
              </tr>
            </thead>
            <tbody>
              {statsCampagnes.map((stat) => (
                <tr key={stat.campagne_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{stat.campagne_nom}</td>
                  <td className="p-3 text-blue-600 text-xs">{stat.url_destination}</td>
                  <td className="p-3">{stat.total_clics}</td>
                  <td className="p-3">{stat.total_leads}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${stat.taux_conversion > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {stat.taux_conversion}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default Reporting;