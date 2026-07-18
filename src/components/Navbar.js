// ============================================================
// Navbar.js — Barre de navigation avec sous-menus
// ============================================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [editeursOpen, setEditeursOpen] = useState(false);
  const [campagnesOpen, setCampagnesOpen] = useState(false);

  const deconnexion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-900 min-h-screen text-white flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">HB Digital</h1>
        <p className="text-gray-400 text-sm">Tracking Platform</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">

          {/* Dashboard */}
          <li>
            <Link to="/" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition">
              📊 Dashboard
            </Link>
          </li>

          {/* Éditeurs avec sous-menu */}
          <li>
            <button
              onClick={() => setEditeursOpen(!editeursOpen)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition"
            >
              <span>👥 Éditeurs</span>
              <span>{editeursOpen ? '▲' : '▼'}</span>
            </button>
            {editeursOpen && (
              <ul className="ml-4 mt-1 space-y-1">
                <li>
                  <Link to="/editeurs" className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition text-gray-300 text-sm">
                    📋 Liste des éditeurs
                  </Link>
                </li>
                <li>
                  <Link to="/editeurs/creer" className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition text-gray-300 text-sm">
                    ➕ Créer un éditeur
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Campagnes avec sous-menu */}
          <li>
            <button
              onClick={() => setCampagnesOpen(!campagnesOpen)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition"
            >
              <span>📢 Campagnes</span>
              <span>{campagnesOpen ? '▲' : '▼'}</span>
            </button>
            {campagnesOpen && (
              <ul className="ml-4 mt-1 space-y-1">
                <li>
                  <Link to="/campagnes" className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition text-gray-300 text-sm">
                    📋 Liste des campagnes
                  </Link>
                </li>
                <li>
                  <Link to="/campagnes/creer" className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition text-gray-300 text-sm">
                    ➕ Créer une campagne
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Clics */}
          <li>
            <Link to="/clics" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition">
              🖱️ Clics
            </Link>
          </li>

          {/* Reporting */}
          <li>
            <Link to="/reporting" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition">
              📈 Reporting
            </Link>
          </li>
          {/* Pixels — AJOUTE ICI */}
          <li>
            <Link to="/pixels" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition">
               🎯 Pixels & Postbacks
            </Link>
          </li>
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={deconnexion}
          className="w-full flex items-center p-3 rounded-lg hover:bg-red-700 transition text-red-400 hover:text-white"
        >
          🚪 Déconnexion
        </button>
      </div>

    </div>
  );
}

export default Navbar;