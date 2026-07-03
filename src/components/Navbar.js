// ============================================================
// Navbar.js — Barre de navigation latérale
// ============================================================
import React from 'react';

// On importe Link de react-router-dom
// Link c'est comme une balise <a> en HTML mais pour React
// Il permet de naviguer entre les pages sans recharger la page
import { Link } from 'react-router-dom';

function Navbar() {
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

          {/* Chaque Link pointe vers une page différente */}
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

    </div>
  );
}

export default Navbar;