'use client';

import { useEffect, useState } from 'react';

interface LotProduitPharmacie {
  id: number;
  numero_lot: string;
  date_peremption: string;
  date_entree: string;
  quantite: number;
  prix_achat: string;
  prix_vente: string;
  nom_medicament: string;
  produit: number;
}

export default function ListeLots({
  produitId,
  dateDebut,
  dateFin,
}: {
  produitId: number;
  dateDebut?: string;
  dateFin?: string;
}) {
  const [lots, setLots] = useState<LotProduitPharmacie[]>([]);
  const [editingLotId, setEditingLotId] = useState<number | null>(null);
  const [newDatePeremption, setNewDatePeremption] = useState('');
  const [newQuantite, setNewQuantite] = useState<number | null>(null);

  useEffect(() => {
    if (!produitId) return;

    const token = localStorage.getItem('accessToken');
    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lots/?produit=${produitId}`;
    if (dateDebut) url += `&date_debut=${dateDebut}`;
    if (dateFin) url += `&date_fin=${dateFin}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setLots(data))
      .catch((err) => console.error(err));
  }, [produitId, dateDebut, dateFin]);

  async function handleSaveModifLot(lotId: number) {
    if (!newDatePeremption || newQuantite === null) {
      return alert('Tous les champs doivent être remplis');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lots/${lotId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date_peremption: newDatePeremption,
          quantite: newQuantite,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour');

      const updatedLot = await res.json();

      setLots(lots.map((lot) => (lot.id === lotId ? updatedLot : lot)));
      setEditingLotId(null);
      setNewDatePeremption('');
      setNewQuantite(null);
    } catch (error) {
      alert('Erreur lors de la mise à jour du lot');
      console.error(error);
    }
  }

  async function handleDeleteLot(lotId: number, produitId: number, quantite: number) {
    const confirmDelete = window.confirm("Confirmez-vous la suppression de ce lot ? Le stock sera réduit.");
    if (!confirmDelete) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lotss/${lotId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operation: 'retrait_lot',
          quantite: quantite,
        }),
      });

      if (!res.ok) throw new Error('Échec du retrait');

      setLots((prev) => prev.filter((lot) => lot.id !== lotId));
      alert("✅ Lot supprimé et stock mis à jour !");
    } catch (error) {
      console.error('Erreur lors du retrait :', error);
      alert("❌ Une erreur est survenue.");
    }
  }

  if (!produitId) return null;

  const nomMedicament = lots.length > 0 ? lots[0].nom_medicament : null;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Lots du médicament sélectionné</h2>
      {nomMedicament && (
        <p className="mb-4 text-green-700 font-semibold text-md">
          Médicament : {nomMedicament}
        </p>
      )}

      {lots.length === 0 ? (
        <p className="text-gray-500">Aucun lot trouvé pour ce produit.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Numéro Lot</th>
              <th className="p-2">Date Péremption</th>
              <th className="p-2">Quantité</th>
              <th className="p-2">Prix Achat</th>
              <th className="p-2">Prix Vente</th>
              <th className="p-2">Date d’entrée</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) => (
              <tr key={lot.id} className="border-t text-center">
                <td className="p-2">{lot.numero_lot || 'N/A'}</td>

                <td className="p-2">
                  {editingLotId === lot.id ? (
                    <input
                      type="date"
                      value={newDatePeremption}
                      onChange={(e) => setNewDatePeremption(e.target.value)}
                      className="border rounded p-1"
                    />
                  ) : (
                    lot.date_peremption
                  )}
                </td>

                <td className="p-2">
                  {editingLotId === lot.id ? (
                    <input
                      type="number"
                      value={newQuantite ?? ''}
                      onChange={(e) => setNewQuantite(Number(e.target.value))}
                      className="border rounded p-1 w-20 text-center"
                    />
                  ) : (
                    lot.quantite
                  )}
                </td>

                <td className="p-2">{lot.prix_achat}</td>
                <td className="p-2">{lot.prix_vente}</td>
                <td className="p-2">{new Date(lot.date_entree).toLocaleDateString()}</td>

                <td className="p-2 space-x-2">
                  {editingLotId === lot.id ? (
                    <>
                      <button
                        onClick={() => handleSaveModifLot(lot.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => {
                          setEditingLotId(null);
                          setNewDatePeremption('');
                          setNewQuantite(null);
                        }}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingLotId(lot.id);
                          setNewDatePeremption(lot.date_peremption);
                          setNewQuantite(lot.quantite);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteLot(lot.id, lot.produit, lot.quantite)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
