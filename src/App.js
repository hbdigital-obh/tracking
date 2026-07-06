// ============================================================
// App.js — Fichier principal qui assemble tout
// ============================================================
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Editeurs from './pages/Editeurs';
import Campagnes from './pages/Campagnes';
import Clics from './pages/Clics';
import Login from './pages/Login';

// Vérifie si l'utilisateur est connecté
// Si le token existe dans localStorage → connecté
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Composant qui protège les routes
// Si pas connecté → redirige vers /login
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Page login — accessible sans être connecté */}
        <Route path="/login" element={<Login />} />

        {/* Pages protégées — faut être connecté */}
        <Route path="/*" element={
          <PrivateRoute>
            <div className="flex bg-gray-100 min-h-screen">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/editeurs" element={<Editeurs />} />
                  <Route path="/campagnes" element={<Campagnes />} />
                  <Route path="/clics" element={<Clics />} />
                </Routes>
              </div>
            </div>
          </PrivateRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;