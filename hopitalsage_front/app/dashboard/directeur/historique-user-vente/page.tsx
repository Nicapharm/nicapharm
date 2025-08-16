'use client';

import { useEffect, useState } from 'react';

interface VenteLigne {
  produit: string;
  quantite: number;
  prix_unitaire: string;
  total: string;
}

interface Vente {
  id: number;
  date_vente: string;
  utilisateur: string | null;
  client: string | null;
  montant_total: string;
  lignes: VenteLigne[];
}

interface VenteRegroupee {
  [utilisateur: string]: {
    [mois: string]: {
      ventes: Vente[];
      total: number;
    };
  };
}

const moisNoms = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function HistoriqueVentes() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const fetchVentes = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/historique-ventes/`;
    const params = new URLSearchParams();

    if (dateDebut) params.append('date_debut', dateDebut);
    if (dateFin) params.append('date_fin', dateFin);

    if (params.toString()) url += `?${params.toString()}`;

    setLoading(true);
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement');
        return res.json();
      })
      .then((data) => {
        setVentes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Erreur de chargement');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVentes();
  }, []);

  const ventesParUtilisateurEtMois: VenteRegroupee = {};

  ventes.forEach((vente) => {
    const utilisateur = vente.utilisateur || 'Inconnu';
    const date = new Date(vente.date_vente);
    const mois = `${moisNoms[date.getMonth()]} ${date.getFullYear()}`;

    if (!ventesParUtilisateurEtMois[utilisateur]) {
      ventesParUtilisateurEtMois[utilisateur] = {};
    }
    if (!ventesParUtilisateurEtMois[utilisateur][mois]) {
      ventesParUtilisateurEtMois[utilisateur][mois] = { ventes: [], total: 0 };
    }

    ventesParUtilisateurEtMois[utilisateur][mois].ventes.push(vente);
    ventesParUtilisateurEtMois[utilisateur][mois].total += parseFloat(vente.montant_total);
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Historique des Ventes par Mois et Utilisateur</h2>

      <div className="flex items-center gap-4 mb-4">
        <div>
          <label className="text-sm text-gray-600">Date début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Date fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <button
          onClick={fetchVentes}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Rechercher
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && Object.keys(ventesParUtilisateurEtMois).length === 0 && (
        <p>Aucune vente trouvée.</p>
      )}

      {Object.entries(ventesParUtilisateurEtMois).map(([utilisateur, moisData]) => (
        <div key={utilisateur} className="mb-10">
          <h3 className="text-xl font-semibold text-green-700 mb-2">{utilisateur}</h3>

          {Object.entries(moisData).map(([mois, data]) => (
            <div key={mois} className="bg-white rounded shadow p-4 mb-6">
              <h4 className="font-semibold text-blue-600 mb-2">{mois}</h4>

              {data.ventes.map((vente) => (
                <div key={vente.id} className="border rounded mb-4 p-3">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Date:</strong> {new Date(vente.date_vente).toLocaleString()}
                  </p>
                  {vente.client && (
                    <p className="text-sm text-gray-600 mb-1"><strong>Client:</strong> {vente.client}</p>
                  )}
                  <p className="text-sm mb-2"><strong>Montant:</strong> {vente.montant_total} Fc</p>
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-1 text-left">Produit</th>
                        <th className="p-1 text-left">Quantité</th>
                        <th className="p-1 text-left">Prix U.</th>
                        <th className="p-1 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vente.lignes.map((ligne, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-1">{ligne.produit}</td>
                          <td className="p-1">{ligne.quantite}</td>
                          <td className="p-1">{ligne.prix_unitaire} Fc</td>
                          <td className="p-1">{ligne.total} Fc</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              <p className="font-bold text-right text-green-800 mt-2">
                Total {mois} : {data.total.toLocaleString()} Fc
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
