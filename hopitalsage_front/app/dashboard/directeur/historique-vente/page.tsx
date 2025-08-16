'use client';

import { useEffect, useState } from 'react';

// Types
interface VenteLigne {
  produit: string;
  quantite: number;
  prix_unitaire: string;
  total: string;
  stock_restant: number; // ← Stock restant ajouté
}

interface Vente {
  id: number;
  date_vente: string;
  utilisateur: string | null;
  client: string | null;
  montant_total: string;
  lignes: VenteLigne[];
}

interface Depense {
  id: number;
  date_depense: string;
  utilisateur: string | null;
  montant: string;
  description: string;
  categorie: string;
}

export default function HistoriqueVentesDepenses() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const fetchData = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Token d\'authentification manquant.');
      setLoading(false);
      return;
    }

    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/historique-ventes/`;
    const params = new URLSearchParams();

    if (dateDebut) params.append('date_debut', dateDebut);
    if (dateFin) params.append('date_fin', dateFin);

    if (params.toString()) url += `?${params.toString()}`;

    setLoading(true);
    setError(null);

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erreur ${res.status}: ${errText}`);
        }
        return res.json();
      })
      .then((data) => {
        setVentes(data.ventes || []);
        setDepenses(data.depenses || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur de récupération des données:', err);
        setError(err.message || 'Impossible de charger les données.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcul des totaux
  const totalVentes = ventes.reduce(
    (acc, vente) => acc + parseFloat(vente.montant_total),
    0
  );

  const totalDepenses = depenses.reduce(
    (acc, depense) => acc + parseFloat(depense.montant),
    0
  );

  const solde = totalVentes - totalDepenses;

  // Formatage des nombres (ex: 1 500 000 Fc)
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Historique des Ventes et Dépenses
      </h2>

      {/* Résumé des totaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Ventes */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total des Ventes</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatAmount(totalVentes)} Fc
            </p>
          </div>
          <div className="text-4xl">💰</div>
        </div>

        {/* Total Dépenses */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total des Dépenses</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatAmount(totalDepenses)} Fc
            </p>
          </div>
          <div className="text-4xl">💸</div>
        </div>

        {/* Solde */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Solde</h3>
            <p
              className={`text-2xl font-bold ${
                solde >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatAmount(solde)} Fc
            </p>
          </div>
          <div className="text-4xl">{solde >= 0 ? '📈' : '📉'}</div>
        </div>
      </div>

      {/* Filtres par date */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <div>
          <label className="text-sm text-gray-600">Date début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border px-2 py-1 rounded mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Date fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="border px-2 py-1 rounded mt-1"
          />
        </div>
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mt-5"
        >
          Rechercher
        </button>
      </div>

      {/* Chargement ou erreur */}
      {loading && <p className="text-gray-600 text-center">Chargement des données...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <>
          {/* Section Ventes */}
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Ventes</h3>
          {ventes.length === 0 ? (
            <p className="text-gray-500 mb-6">Aucune vente trouvée.</p>
          ) : (
            ventes.map((vente) => (
              <div key={vente.id} className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="mb-3 text-sm text-gray-600">
                  <p>
                    <strong>Vente le :</strong>{' '}
                    {new Date(vente.date_vente).toLocaleString()}
                  </p>
                  {vente.utilisateur && (
                    <p>
                      <strong>Utilisateur :</strong> {vente.utilisateur}
                    </p>
                  )}
                  {vente.client && (
                    <p>
                      <strong>Client :</strong> {vente.client}
                    </p>
                  )}
                  <p>
                    <strong>Montant total :</strong>{' '}
                    <span className="font-medium">{vente.montant_total} Fc</span>
                  </p>
                </div>

                <table className="w-full text-sm table-auto border border-gray-200 rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Produit</th>
                      <th className="p-2 text-left">Qté vendue</th>
                      <th className="p-2 text-left">Prix unitaire</th>
                      <th className="p-2 text-left">Total</th>
                      <th className="p-2 text-left">Stock restant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vente.lignes.map((ligne, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-medium">{ligne.produit}</td>
                        <td className="p-2">{ligne.quantite}</td>
                        <td className="p-2">{ligne.prix_unitaire} Fc</td>
                        <td className="p-2">{ligne.total} Fc</td>
                        <td className="p-2 font-semibold">
                          <span
                            className={
                              ligne.stock_restant <= 5
                                ? 'text-red-600'
                                : 'text-green-600'
                            }
                          >
                            {ligne.stock_restant}
                          </span>
                          {ligne.stock_restant <= 5 && (
                            <span className="ml-1 text-xs">⚠️</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}

          {/* Section Dépenses */}
          <h3 className="text-xl font-semibold mb-2 text-gray-700 mt-8">Dépenses</h3>
          {depenses.length === 0 ? (
            <p className="text-gray-500">Aucune dépense trouvée.</p>
          ) : (
            depenses.map((depense) => (
              <div key={depense.id} className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Dépense le :</strong>{' '}
                    {new Date(depense.date_depense).toLocaleString()}
                  </p>
                  <p>
                    <strong>Utilisateur :</strong>{' '}
                    {depense.utilisateur || 'Inconnu'}
                  </p>
                  <p>
                    <strong>Montant :</strong>{' '}
                    <span className="font-medium">{depense.montant} Fc</span>
                  </p>
                  <p>
                    <strong>Description :</strong> {depense.description}
                  </p>
                  <p>
                    <strong>Catégorie :</strong> {depense.categorie}
                  </p>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}