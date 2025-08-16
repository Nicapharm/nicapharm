'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

interface LigneCommande {
  id: number;
  nom_produit: string;
  quantite_commande: number; // Assurez-vous que ce champ existe dans la réponse API
  quantite_recue: string;
}

export default function ReceptionCommandePage() {
  const { id } = useParams() as { id: string };
  const numericId = parseInt(id);

  const [lignes, setLignes] = useState<LigneCommande[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        setMessage('Token d’accès manquant');
        return;
      }
      try {
        console.log("Fetching commande avec id:", numericId);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/commande/${numericId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Vérifiez si `res.data.lignes` existe et contient les champs attendus
        const lignesInitiales = res.data.lignes.map((l: any) => ({
          id: l.id,
          nom_produit: l.nom_produit,
          quantite_commande: l.quantite_commande || 0, // Utilisez une valeur par défaut si le champ est manquant
          quantite_recue: '',
        }));

        setLignes(lignesInitiales);
      } catch (err) {
        console.error(err);
        setMessage('Erreur lors du chargement des lignes.');
      }
    };

    fetchData();
  }, [id]);

const handleChange = (index: number, value: string) => {
  const quantiteRecue = parseInt(value, 10) || 0;
  const quantiteCommandee = lignes[index].quantite_commande;

  if (quantiteRecue > quantiteCommandee) {
    alert(`⚠️ La quantité reçue ne peut pas dépasser la quantité commandée (${quantiteCommandee}).`);
    return;
  }

  const newLignes = [...lignes];
  newLignes[index].quantite_recue = value;
  setLignes(newLignes);
};
const lignesInvalides = lignes.filter(l => parseInt(l.quantite_recue, 10) > l.quantite_commande);

if (lignesInvalides.length > 0) {
  alert('⚠️ Certaines quantités reçues dépassent les quantités commandées.');
  setLoading(false);
  return;
}


  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    const token = getToken();

    if (!token) {
      setMessage('⚠️ Token d’accès manquant.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reception/confirm/`,
        {
          commande: id,
          lignes: lignes.map((l) => ({
            ligne_commande: l.id,
            quantite_recue: parseInt(l.quantite_recue),
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('✅ Réception confirmée avec succès !');
    } catch (error: any) {
      console.error(error);
      setMessage('❌ Erreur : ' + JSON.stringify(error.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Réception de la commande #{id}</h1>

      {lignes.length === 0 ? (
        <p>Aucune ligne de commande disponible.</p>
      ) : (
        lignes.map((ligne, idx) => (
          <div key={ligne.id} className="border p-3 rounded mb-4 bg-gray-50">
            <p className="font-medium">{ligne.nom_produit}</p>
            <p>Quantité commandée : {ligne.quantite_commande}</p>
            <label className="block mt-2 text-sm">Quantité reçue :</label>
            <input
              type="number"
              className="border w-full p-1"
              value={ligne.quantite_recue}
              onChange={(e) => handleChange(idx, e.target.value)}
            />
          </div>
        ))
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
      >
        {loading ? 'Traitement...' : 'Confirmer la réception'}
      </button>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}