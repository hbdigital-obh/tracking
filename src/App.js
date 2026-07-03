// ============================================================
// App.js — Fichier principal qui assemble tout
// ============================================================
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Editeurs from './pages/Editeurs';
import Campagnes from './pages/Campagnes';

function App() {
  return (
    // BrowserRouter gère la navigation entre les pages
    <BrowserRouter>
      <div className="flex bg-gray-100 min-h-screen">
        
        {/* La navbar est toujours visible à gauche */}
        <Navbar />

        {/* Le contenu change selon la page */}
        <div className="flex-1">
          <Routes>
            {/* Chaque Route associe une URL à une page */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/editeurs" element={<Editeurs />} />
            <Route path="/campagnes" element={<Campagnes />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;