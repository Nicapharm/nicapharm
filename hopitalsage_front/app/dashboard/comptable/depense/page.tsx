'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderDirecteur from '@/components/HeaderDirecteur';
import SidebarDirecteur from '@/components/SidebarDirecteur';

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
  ville_pharm: string;
  commune_pharm: string;
}

export default function PageDepense() {
  const [categorie, setCategorie] = useState('');
  const [description, setDescription] = useState('');
  const [montant, setMontant] = useState('');
  const [methodePaiement, setMethodePaiement] = useState('cash');
  const [dateDepense, setDateDepense] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [pharmacie, setPharmacie] = useState<Pharmacie | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handle401 = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    alert('Votre session a expiré. Veuillez vous reconnecter.');
    window.location.href = '/login';
  };

  // Charger l'utilisateur et la pharmacie
  useEffect(() => {
    const fetchUserData = async () => {
      if (!accessToken) return handle401();

      try {
        const userRes = await axios.get(`${API}/api/user/me/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(userRes.data);

        const pharmRes = await axios.get(`${API}/api/pharmacie/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (pharmRes.data.length > 0) {
          setPharmacie(pharmRes.data[0]);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          handle401();
        } else {
          console.error('Erreur lors du chargement des données utilisateur/pharmacie :', error);
        }
      }
    };

    fetchUserData();
  }, [accessToken]);

  // Valeur par défaut de la date (aujourd'hui)
  useEffect(() => {
    if (!dateDepense) {
      const today = new Date().toISOString().split('T')[0];
      setDateDepense(today);
    }
  }, [dateDepense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacie) {
      setMessage('❌ Impossible de trouver votre pharmacie.');
      return;
    }
    if (!categorie || !montant) {
      setMessage('❌ Veuillez remplir les champs obligatoires.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${API}/api/depenses/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categorie,
          description,
          montant: parseFloat(montant),
          methode_paiement: methodePaiement,
          date_depense: dateDepense,
          pharmacie: pharmacie.id,
        }),
      });

      if (res.ok) {
        setMessage('✅ Dépense enregistrée avec succès !');
        setCategorie('');
        setDescription('');
        setMontant('');
        setMethodePaiement('cash');
        // Ne réinitialise pas la date pour garder celle du jour
      } else {
        const data = await res.json();
        setMessage(`❌ Erreur: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Erreur lors de l’enregistrement de la dépense:', error);
      setMessage('❌ Une erreur est survenue lors de l’enregistrement.');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarDirecteur />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {user && pharmacie && <HeaderDirecteur user={user} pharmacie={pharmacie} />}

        {/* Main */}
        <main className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">💰 Enregistrer une dépense</h1>

          {message && (
            <div
              className={`p-3 rounded ${
                message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          {!pharmacie ? (
            <p className="text-gray-500">Chargement des informations de la pharmacie...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-lg bg-white p-6 rounded-lg shadow">
              {/* Catégorie */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Catégorie *</label>
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}
                  required
                  className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choisir une catégorie --</option>
                  <option value="transport">Transport</option>
                  <option value="nourriture">Nourriture</option>
                  <option value="achat_materiel">Achat de matériel</option>
                  <option value="salaire">Salaire</option>
                  <option value="Loyer">Loyer</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détails de la dépense..."
                  className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>

              {/* Montant */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Montant *</label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="Ex: 5000"
                  required
                  min="0"
                  step="1"
                  className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Méthode de paiement</label>
                <select
                  value={methodePaiement}
                  onChange={(e) => setMethodePaiement(e.target.value)}
                  className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>

              {/* Bouton soumission */}
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? 'Enregistrement...' : '💾 Enregistrer'}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}