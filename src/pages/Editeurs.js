// ============================================================
// Editeurs.js — Page de gestion des éditeurs
// ============================================================
import React, { useState, useEffect } from 'react';
import { getEditeurs, creerEditeur } from '../services/api';

function Editeurs() {

  // Liste des éditeurs récupérés depuis l'API
  const [editeurs, setEditeurs] = useState([]);

  // Données du formulaire pour créer un nouvel éditeur
  const [formulaire, setFormulaire] = useState({
    nom: '',
    email: '',
    slug: ''
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Au chargement de la page, on récupère les éditeurs
  useEffect(() => {
    chargerEditeurs();
  }, []);

  const chargerEditeurs = async () => {
    try {
      const data = await getEditeurs();
      setEditeurs(data);
    } catch (error) {
      console.error("Erreur chargement éditeurs", error);
    } finally {
      setLoading(false);
    }
  };

  // Quand l'utilisateur tape dans un champ du formulaire
  // on met à jour la variable formulaire
  const handleChange = (e) => {
    setFormulaire({
      ...formulaire,
      [e.target.name]: e.target.value
    });
  };

  // Quand l'utilisateur clique sur "Créer"
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creerEditeur(formulaire);
      setMessage("Éditeur créé avec succès !");
      // On recharge la liste des éditeurs
      chargerEditeurs();
      // On remet le formulaire à zéro
      setFormulaire({ nom: '', email: '', slug: '' });
    } catch (error) {
      setMessage("Erreur lors de la création de l'éditeur");
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Gestion des éditeurs
      </h1>

      {/* Formulaire de création */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Créer un éditeur</h2>

        {message && (
          <p className="text-green-600 mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formulaire.nom}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formulaire.email}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug (ex: jean-dupont)"
            value={formulaire.slug}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <button
            type="submit"
            className="col-span-3 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Créer l'éditeur
          </button>
        </form>
      </div>

      {/* Tableau des éditeurs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">
          Liste des éditeurs ({editeurs.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Date création</th>
            </tr>
          </thead>
          <tbody>
            {editeurs.map((editeur) => (
              <tr key={editeur.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{editeur.nom}</td>
                <td className="p-3">{editeur.email}</td>
                <td className="p-3 text-blue-600">{editeur.slug}</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    {editeur.statut}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(editeur.date_creation).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Editeurs;