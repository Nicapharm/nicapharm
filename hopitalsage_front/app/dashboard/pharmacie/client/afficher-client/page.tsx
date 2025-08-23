'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import PharmacieLayout from '@/app/dashboard/directeur/layout';
import DropdownMenu from '../DropdownMenu';

// Types
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  role: string;
  pharmacie: number;
}

interface Pharmacie {
  id: number;
  nom_pharm: string;
  adresse_pharm: string;
  telephone: string | null;
}

interface Client {
  id: number;
  nom_complet: string;
  telephone: string;
  score_fidelite: number;
  dernier_achat: string | null;
  total_depense: number;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [pharmacie, setPharmacie] = useState<Pharmacie | null>(null);
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handle401 = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    alert('Votre session a expiré. Veuillez vous reconnecter.');
    window.location.href = '/login';
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      setAccessToken(token);
    }
  }, [router]);

  useEffect(() => {
    if (accessToken) {
      fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/clients/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setClients(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) handle401();
      else {
        console.error('Erreur lors de la récupération des clients :', err);
        setError('Impossible de charger les clients.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telephone.includes(searchTerm)
  );

  return (
      <PharmacieLayout>
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
              📋 Liste des Clients
            </h1>

            {/* Barre de recherche */}
            <div className="relative max-w-md mb-6">
              <input
                type="text"
                placeholder="🔍 Rechercher par nom ou téléphone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Chargement */}
            {loading ? (
              <p className="text-center text-blue-500">
                Chargement des clients...
              </p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl shadow bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      {[
                        'Nom',
                        'Téléphone',
                        'Score',
                        'Dernier Achat',
                        'Dépense Totale',
                        'Actions',
                      ].map((header, i) => (
                        <th
                          key={i}
                          className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {client.nom_complet}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {client.telephone}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {client.score_fidelite}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {client.dernier_achat
                            ? new Date(client.dernier_achat).toLocaleDateString()
                            : 'Jamais'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Intl.NumberFormat('fr-FR').format(
                            client.total_depense
                          )}{' '}
                          FC
                        </td>
                        {/* relative non obligatoire ici (on garde quand même) */}
                        <td className="px-4 py-3 text-right relative">
                          <DropdownMenu clientId={client.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Aucun résultat trouvé */}
                {filteredClients.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    Aucun client trouvé.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </PharmacieLayout>
  );
}
