// On importe React (obligatoire dans chaque composant)
import React from 'react';

// Notre composant StatCard
// Il reçoit 3 "props" (paramètres) : titre, valeur, couleur
// Les props c'est comme des arguments d'une fonction en Java
function StatCard({ titre, valeur, couleur }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${couleur}`}>
      <p className="text-gray-500 text-sm">{titre}</p>
      <p className="text-3xl font-bold text-gray-800">{valeur}</p>
    </div>
  );
}

// On exporte le composant pour pouvoir l'utiliser ailleurs
export default StatCard;