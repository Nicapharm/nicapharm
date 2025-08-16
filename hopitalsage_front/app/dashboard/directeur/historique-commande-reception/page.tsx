'use client';

import { useEffect, useState } from 'react';

interface ProduitCommande {
  produit: string;
  quantite_commandee: number;
  quantite_recue: number;
  prix_achat: string;
}

interface Mouvement {
  id: number;
  date_commande: string;
  etat: string;
  fabricant: string;
  date_reception: string | null;
  utilisateur_reception: string | null;
  produits: ProduitCommande[];
}

export default function HistoriqueMouvements() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/historique-mouvements/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Erreur lors du chargement');
          return res.json();
        })
        .then((data) => {
          setMouvements(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Erreur de chargement');
          setLoading(false);
        });
    }
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Historique des Commandes et Réceptions</h2>

      {loading && <p className="text-gray-600">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {mouvements.map((mouvement) => (
        <div key={mouvement.id} className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="mb-2 text-sm text-gray-500">
            <p><strong>Commande du :</strong> {new Date(mouvement.date_commande).toLocaleString()}</p>
            <p><strong>Fabricant :</strong> {mouvement.fabricant}</p>
            <p><strong>État :</strong> <span className={`font-semibold ${mouvement.etat === 'reçu' ? 'text-green-600' : 'text-yellow-600'}`}>{mouvement.etat}</span></p>
            {mouvement.date_reception && (
              <p><strong>Réception le :</strong> {new Date(mouvement.date_reception).toLocaleString()}</p>
            )}
            {mouvement.utilisateur_reception && (
              <p><strong>Reçu par :</strong> {mouvement.utilisateur_reception}</p>
            )}
          </div>

          <table className="w-full text-sm table-auto border mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Produit</th>
                <th className="p-2 text-left">Quantité commandée</th>
                <th className="p-2 text-left">Quantité reçue</th>
                <th className="p-2 text-left">Prix achat</th>
              </tr>
            </thead>
            <tbody>
              {mouvement.produits.map((produit, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{produit.produit}</td>
                  <td className="p-2">{produit.quantite_commandee}</td>
                  <td className="p-2">{produit.quantite_recue}</td>
                  <td className="p-2">{produit.prix_achat} Fc</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
