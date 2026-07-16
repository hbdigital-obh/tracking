// ============================================================
// Navbar.js — Barre de navigation latérale
// ============================================================
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  // Fonction de déconnexion
  // On supprime le token du localStorage et on redirige vers /login
  const deconnexion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-900 min-h-screen text-white flex flex-col">
      
      {/* Logo HB Digital */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">HB Digital</h1>
        <p className="text-gray-400 text-sm">Tracking Platform</p>
      </div>

      {/* Menu de navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link to="/" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition">
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/editeurs" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition">
              👥 Éditeurs
            </Link>
          </li>
          <li>
            <Link to="/campagnes" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition">
              📢 Campagnes
            </Link>
          </li>
          <li>
            <Link to="/clics" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition">
              🖱️ Clics
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bouton déconnexion en bas */}
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