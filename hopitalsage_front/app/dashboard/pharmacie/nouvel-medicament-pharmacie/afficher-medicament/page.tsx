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
  localisation: string;
}

const ListeMedicamentsPage = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Medicament>>({});
  const [searchTerm, setSearchTerm] = useState('');
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

  const startEditing = (med: Medicament) => {
    setEditingId(med.id);
    setFormData({
      marge_beneficiaire: med.marge_beneficiaire,
      quantite: med.quantite,
      localisation: med.localisation,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'marge_beneficiaire' || name === 'quantite' ? Number(value) : value,
    });
  };

  const handleSave = async (id: number) => {
    if (!token) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-pharmacie/${id}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-pharmacie/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicaments(res.data);
      setEditingId(null);
    } catch (err) {
      console.error('Erreur de mise à jour', err);
    }
  };

  const medicamentsFiltres = medicaments.filter(med =>
    med.nom_medicament.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PharmacieLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Liste des Médicaments</h1>

        <input
          type="text"
          placeholder="Rechercher un médicament..."
          className="mb-4 p-2 border border-gray-300 rounded w-full max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table className="min-w-full table-auto border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-emerald-600 text-white">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Quantité</th>
              <th className="p-3 text-left">Prix d'Achat</th>
              <th className="p-3 text-left">Prix de Vente</th>
              <th className="p-3 text-left">Localisation</th>
              <th className="p-3 text-left">Péremption</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicamentsFiltres.map((med) => {
              const isEditing = editingId === med.id;
              const prixVente = (
                med.prix_achat * (1 + ((isEditing ? formData.marge_beneficiaire : med.marge_beneficiaire) || 0) / 100)
              ).toFixed(2);

              return (
                <tr key={med.id} className="border-b hover:bg-gray-50 align-top">
                  <td className="p-3">{med.nom_medicament}</td>

                  <td className="p-3">
                    {isEditing ? (
                      <input
                        type="number"
                        name="quantite"
                        value={formData.quantite ?? ''}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-20"
                      />
                    ) : (
                      med.quantite
                    )}
                  </td>

                  <td className="p-3">{med.prix_achat} Fc</td>
                  <td className="p-3">{prixVente} Fc</td>

                  <td className="p-3">
                    {isEditing ? (
                      <input
                        type="text"
                        name="localisation"
                        value={formData.localisation ?? ''}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      <span className="block max-w-xs text-sm text-gray-700">{med.localisation}</span>
                    )}
                  </td>

                  <td className="p-3">
                    {new Date(med.date_peremption).toLocaleDateString()}
                  </td>

                  <td className="p-3 space-y-1">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          name="marge_beneficiaire"
                          value={formData.marge_beneficiaire ?? ''}
                          onChange={handleChange}
                          className="border px-2 py-1 rounded w-20"
                          placeholder="%"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSave(med.id)}
                            className="bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 text-sm"
                          >
                            Enregistrer
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="border px-2 py-1 rounded text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditing(med)}
                        className="text-emerald-600 hover:underline"
                      >
                        Modifier
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {medicamentsFiltres.length === 0 && (
          <p className="text-gray-600 mt-4">Aucun médicament trouvé.</p>
        )}
      </div>
    </PharmacieLayout>
  );
};

export default ListeMedicamentsPage;
