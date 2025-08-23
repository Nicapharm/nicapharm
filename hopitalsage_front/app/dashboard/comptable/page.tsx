'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderDirecteur from '@/components/HeaderDirecteur';
import SidebarDirecteur from '@/components/SidebarDirecteur';

interface Pharmacie {
  id: number;
  nom_pharm: string;
  adresse_pharm: string;
  telephone: string | null;
}

interface ProduitFabricant {
  id: number;
  nom: string;
  fabricant: number;
  fabricant_nom: string;
}

interface Requisition {
  id: number;
  produit_fabricant: number | null;
  nom_personnalise: string;
  nombre_demandes: number;
  nom_produit?: string;
  fabricant_nom?: string;
}

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

export default function RequisitionPage() {
  const [produits, setProduits] = useState<ProduitFabricant[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customNom, setCustomNom] = useState('');
  const [messageErreur, setMessageErreur] = useState('');
  const [pharmacieId, setPharmacieId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [pharmacie, setPharmacie] = useState<Pharmacie | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const [syncLoading, setSyncLoading] = useState(false);
  const [syncLog, setSyncLog] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [afficherAlerte, setAfficherAlerte] = useState(false);

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handle401 = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    alert('Votre session a expiré. Veuillez vous reconnecter.');
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchUserAndPharmacie = async () => {
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
          setPharmacieId(pharmRes.data[0].id);
        }
      } catch (error: any) {
        if (error.response?.status === 401) handle401();
        else console.error('Erreur de chargement des données :', error);
      }
    };
    fetchUserAndPharmacie();
  }, [accessToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAfficherAlerte(true);
    }, 300000); // 5 minutes
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (syncLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.floor(Math.random() * 5) + 2;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [syncLoading]);

  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setProduits([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setIsLoadingSearch(true);
      axios
        .get(`${API}/api/produits-fabricants/?search=${searchTerm}&page_size=20`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then(res => setProduits(res.data.results || []))
        .catch(err => {
          if (err.response?.status === 401) handle401();
          else console.error("Erreur de recherche :", err);
        })
        .finally(() => setIsLoadingSearch(false));
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const chargerRequisitions = async () => {
    try {
      const res = await axios.get(`${API}/api/requisitions/?pharmacie=${pharmacieId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRequisitions(res.data);
    } catch (error: any) {
      if (error.response?.status === 401) handle401();
      else console.error('Erreur chargement des réquisitions :', error);
    }
  };

  useEffect(() => {
    if (accessToken && pharmacieId) {
      chargerRequisitions();
    }
  }, [accessToken, pharmacieId]);

  const ajouterRequisition = async (produit: any) => {
    const nom = produit.nom;
    if (!produit.id && !nom.trim()) {
      setMessageErreur("Veuillez entrer un nom ou choisir un produit.");
      return;
    }

    const payload = {
      pharmacie: pharmacieId,
      ...(produit.id ? { produit_fabricant: produit.id } : { nom_personnalise: nom }),
    };

    try {
      await axios.post(`${API}/api/requisitions/`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await chargerRequisitions();
      setCustomNom('');
      setMessageErreur('');
    } catch (error: any) {
      if (error.response?.status === 401) handle401();
      else setMessageErreur(error.response?.data?.detail || "Erreur inconnue.");
    }
  };

  const supprimerRequisition = async (id: number) => {
    if (!accessToken) return handle401();
    if (confirm("Supprimer cette réquisition ?")) {
      try {
        await axios.delete(`${API}/api/requisitions/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setRequisitions(prev => prev.filter(r => r.id !== id));
      } catch (error: any) {
        if (error.response?.status === 401) handle401();
        else {
          console.error("Erreur suppression individuelle :", error);
          alert("Échec de la suppression.");
        }
      }
    }
  };

  const incrementerDemande = async (id: number) => {
    try {
      await axios.post(`${API}/api/requisitions/${id}/incrementer/`, null, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      await chargerRequisitions();
    } catch (error: any) {
      if (error.response?.status === 401) handle401();
      else console.error("Erreur lors de l'incrément :", error);
    }
  };

  const nettoyerRequisitions = () => {
    if (confirm("Êtes-vous sûr de vouloir nettoyer l’écran ?")) {
      setRequisitions([]);
    }
  };

  const sync = async (direction: 'remote_to_local' | 'local_to_remote') => {
    const confirmationMessage =
      direction === 'remote_to_local'
        ? 'Confirmez-vous la synchronisation de Render vers Local ?'
        : 'Confirmez-vous la synchronisation de Local vers Render ?';

    const confirmed = window.confirm(confirmationMessage);
    if (!confirmed) return;

    setSyncLoading(true);
    setSyncLog(null);
    setProgress(0);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, debug: true }),
      });

      const data = await res.json();
      setProgress(100);

      if (data.success) {
        setSyncLog(`✅ ${data.message || 'Synchronisation terminée avec succès.'}`);
        if (direction === 'remote_to_local') {
          await chargerRequisitions();
        }
      } else {
        setSyncLog(`❌ ${data.error || 'Erreur inconnue.'}`);
      }
    } catch (err) {
      setProgress(100);
      setSyncLog('❌ Erreur lors de la synchronisation.');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SidebarDirecteur />
      <div className="flex-1 flex flex-col">
        {user && pharmacie && <HeaderDirecteur user={user} pharmacie={pharmacie} />}
        <main className="min-h-screen bg-gray-100 p-8 space-y-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Réquisition de Médicaments</h1>

          {afficherAlerte && (
            <h2 className="text-sm text-gray-600 italic text-right mb-4">
              🔔 N’oubliez pas : connectez-vous à l'internet et sauvegardez vos données chaque soir pour sécuriser vos ventes. ⏳ Durée : 20–40 min.
            </h2>
          )}

          {/* Synchronisation */}
          <div className="space-y-2">
            <div className="flex gap-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={() => sync('remote_to_local')}
                disabled={syncLoading}
              >
                 🔄 Sauvegarde les donnée ➝ Ton Ordinateur
              </button>
              
            </div>

            {(syncLoading || syncLog) && (
              <div className="space-y-2 mt-2">
                <div className="relative w-full h-6 rounded-full overflow-hidden bg-gray-200">
                  <div
                    className="absolute left-0 top-0 h-full transition-all duration-300 ease-out"
                    style={{
                      width: `${progress}%`,
                      background:
                        progress === 100 && syncLog?.startsWith('✅')
                          ? 'linear-gradient(to right, #00c851, #007e33)'
                          : progress === 100 && syncLog?.startsWith('❌')
                          ? 'linear-gradient(to right, #ff4444, #cc0000)'
                          : 'linear-gradient(to right, #00c6ff, #0072ff)',
                    }}
                  ></div>
                  <div className="absolute w-full h-full flex items-center justify-center font-medium text-gray-800">
                    {progress}%
                  </div>
                </div>
                <div className="text-center text-sm text-gray-700 italic">
                  {syncLoading ? 'Veuillez patienter...' : syncLog}
                </div>
                {progress === 100 && syncLog && (
                  <div className="flex justify-center">
                    <button
                      className="mt-2 px-4 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
                      onClick={() => {
                        setSyncLog(null);
                        setProgress(0);
                      }}
                    >
                      Fermer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message erreur */}
          {messageErreur && (
            <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">
              ⚠️ {messageErreur}
            </div>
          )}

          {/* Nettoyage */}
          <div className="mb-6">
            <button
              onClick={nettoyerRequisitions}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              🧹 Nettoyer l’écran
            </button>
          </div>

          {/* Formulaire et Liste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <input
                className="w-full p-3 border rounded mb-4"
                type="text"
                placeholder="🔍 Rechercher un médicament..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isLoadingSearch && <p className="text-sm text-gray-500">Chargement...</p>}
              {produits.length > 0 && (
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {produits.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => ajouterRequisition(p)}
                      className="p-3 bg-blue-100 hover:bg-blue-200 rounded text-left shadow"
                    >
                      <p className="font-semibold">{p.nom}</p>
                      <p className="text-sm text-gray-600">Fabricant : {p.fabricant_nom || "Non spécifié"}</p>
                    </button>
                  ))}
                </div>
              )}
              <input
                className="w-full p-3 border rounded mb-2"
                type="text"
                placeholder="📎 Saisir manuellement un médicament"
                value={customNom}
                onChange={(e) => setCustomNom(e.target.value)}
              />
              <button
                onClick={() => ajouterRequisition({ nom: customNom })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                ➕ Ajouter la réquisition
              </button>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">📋 Liste des réquisitions</h2>
              {requisitions.length === 0 ? (
                <p className="text-gray-600">Aucune réquisition enregistrée.</p>
              ) : (
                requisitions
                  .sort((a, b) => b.nombre_demandes - a.nombre_demandes)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between bg-white shadow p-4 rounded border mb-3 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold text-lg">
                          {r.nom_produit || r.nom_personnalise}
                          {r.fabricant_nom ? ` (${r.fabricant_nom})` : ''}
                        </p>
                        <p className="text-gray-500">Demandes : {r.nombre_demandes}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => incrementerDemande(r.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Encore"
                        >
                          🔁
                        </button>
                        <button
                          onClick={() => supprimerRequisition(r.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
