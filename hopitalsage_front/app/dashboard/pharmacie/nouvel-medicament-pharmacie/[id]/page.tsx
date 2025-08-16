'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import PharmacieLayout from '@/app/dashboard/directeur/layout';

interface Medicament {
  id: number;
  nom_medicament: string;
  quantite: number;
  prix_achat: number;
  marge_beneficiaire: number;
  date_peremption: string;
}

const ListeMedicamentsPage = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [medicamentEdit, setMedicamentEdit] = useState<Medicament | null>(null);
  const [formData, setFormData] = useState({
    nom_medicament: '',
    quantite: 0,
    marge_beneficiaire: 0,
    date_peremption: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (token) {
      axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-pharmacie/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setMedicaments(res.data))
      .catch(err => console.error('Erreur de chargement:', err));
    }
  }, [token]);

  const ouvrirModale = (med: Medicament) => {
    setMedicamentEdit(med);
    setFormData({
      nom_medicament: med.nom_medicament,
      quantite: med.quantite,
      marge_beneficiaire: med.marge_beneficiaire,
      date_peremption: med.date_peremption.slice(0, 10), // format YYYY-MM-DD
    });
  };

  const fermerModale = () => {
    setMedicamentEdit(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicamentEdit || !token) return;

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-pharmacie/${medicamentEdit.id}/`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Rafraîchir la liste après modification
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-pharmacie/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicaments(res.data);
      fermerModale();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  return (
    <PharmacieLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Liste des Médicaments</h1>
        <table className="min-w-full table-auto border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Quantité</th>
              <th className="p-3 text-left">Prix d'Achat</th>
              <th className="p-3 text-left">Prix de Vente</th>
              <th className="p-3 text-left">Date de Péremption</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicaments.map(med => {
              const prixVente = (med.prix_achat * (1 + med.marge_beneficiaire / 100)).toFixed(2);
              return (
                <tr key={med.id} className="border-b hover:bg-gray-50 relative">
                  <td className="p-3">{med.nom_medicament}</td>
                  <td className="p-3">{med.quantite}</td>
                  <td className="p-3">{med.prix_achat} Fc</td>
                  <td className="p-3">{prixVente} Fc</td>
                  <td className="p-3">{new Date(med.date_peremption).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => ouvrirModale(med)}
                      className="text-emerald-600 hover:underline"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Modale simple */}
        {medicamentEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Modifier médicament</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom_medicament"
                    value={formData.nom_medicament}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Quantité</label>
                  <input
                    type="number"
                    name="quantite"
                    value={formData.quantite}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Marge bénéficiaire (%)</label>
                  <input
                    type="number"
                    name="marge_beneficiaire"
                    value={formData.marge_beneficiaire}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                    min={0}
                    step={0.01}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Date de péremption</label>
                  <input
                    type="date"
                    name="date_peremption"
                    value={formData.date_peremption}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 rounded"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={fermerModale}
                    className="px-4 py-2 border rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PharmacieLayout>
  );
};

export default ListeMedicamentsPage;
