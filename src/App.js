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
import Reporting from './pages/Reporting';
import CreerEditeur from './pages/CreerEditeur';
import CreerCampagne from './pages/CreerCampagne';
import Pixels from './pages/Pixels';

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div className="flex bg-gray-100 min-h-screen">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/editeurs" element={<Editeurs />} />
                  <Route path="/editeurs/creer" element={<CreerEditeur />} />
                  <Route path="/campagnes" element={<Campagnes />} />
                  <Route path="/campagnes/creer" element={<CreerCampagne />} />
                  <Route path="/clics" element={<Clics />} />
                  <Route path="/reporting" element={<Reporting />} />
                  <Route path="/pixels" element={<Pixels />} />
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