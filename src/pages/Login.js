// ============================================================
// Login.js — Page de connexion admin
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {

  // useNavigate permet de rediriger vers une autre page
  const navigate = useNavigate();

  const [formulaire, setFormulaire] = useState({
    email: '',
    mot_de_passe: ''
  });

  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormulaire({
      ...formulaire,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');

    try {
      // On envoie email + mot de passe à l'API
      const response = await api.post('/auth/login', formulaire);
      
      // On sauvegarde le token dans le localStorage
      // Comme ça il reste même si on rafraîchit la page
      localStorage.setItem('token', response.data.access_token);
      
      // On redirige vers le dashboard
      navigate('/');

    } catch (error) {
      setErreur('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">HB Digital</h1>
          <p className="text-gray-500 mt-1">Plateforme de Tracking</p>
        </div>

        {/* Message d'erreur */}
        {erreur && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {erreur}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formulaire.email}
              onChange={handleChange}
              className="w-full border rounded p-3 focus:outline-none focus:border-blue-500"
              placeholder="admin@hbdigital.fr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="mot_de_passe"
              value={formulaire.mot_de_passe}
              onChange={handleChange}
              className="w-full border rounded p-3 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;