'use client';

import { useState } from 'react';
import axios from 'axios';

export default function ReceptionPage() {
  const [commandeId, setCommandeId] = useState('');
  const [lignes, setLignes] = useState([{ ligne_commande: '', quantite_recue: '' }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (index: number, field: string, value: string) => {
    const newLignes = [...lignes];
    newLignes[index][field as keyof typeof newLignes[0]] = value;
    setLignes(newLignes);
  };

  const addLigne = () => {
    setLignes([...lignes, { ligne_commande: '', quantite_recue: '' }]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reception/confirm/`, {
        commande: commandeId,
        lignes: lignes.map(l => ({
          ligne_commande: parseInt(l.ligne_commande),
          quantite_recue: parseInt(l.quantite_recue),
        })),
      });
      setMessage('✅ Réception confirmée et stock mis à jour.');
    } catch (error: any) {
      setMessage(`❌ Erreur : ${error.response?.data?.detail || JSON.stringify(error.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white shadow rounded-xl">
      <h1 className="text-xl font-semibold mb-4">Confirmation de Réception</h1>

      <label className="block mb-2 text-sm">Commande ID :</label>
      <input
        className="w-full border p-2 mb-4"
        type="text"
        value={commandeId}
        onChange={(e) => setCommandeId(e.target.value)}
      />

      {lignes.map((ligne, idx) => (
        <div key={idx} className="mb-4 border p-2 rounded bg-gray-50">
          <label className="block text-sm">Ligne Commande ID :</label>
          <input
            className="w-full border p-1"
            type="text"
            value={ligne.ligne_commande}
            onChange={(e) => handleChange(idx, 'ligne_commande', e.target.value)}
          />

          <label className="block mt-2 text-sm">Quantité Reçue :</label>
          <input
            className="w-full border p-1"
            type="text"
            value={ligne.quantite_recue}
            onChange={(e) => handleChange(idx, 'quantite_recue', e.target.value)}
          />
        </div>
      ))}

      <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={addLigne}>
        ➕ Ajouter une ligne
      </button>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Confirmation...' : 'Confirmer la Réception'}
      </button>

      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </div>
  );
}
