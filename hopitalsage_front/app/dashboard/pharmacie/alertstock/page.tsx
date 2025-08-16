'use client';

import React, { useEffect, useState } from 'react';
import PharmacieLayout from '@/app/dashboard/directeur/layout';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, AlertOctagon } from 'lucide-react';

interface Produit {
  id: number;
  nom_medicament: string;
  quantite: number;
  alerte_quantite: number;
  niveau_alerte: 'danger' | 'warning';
}

export default function AlertesRupturePage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Nouvel état pour les erreurs

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      setError("Aucun token d'authentification trouvé.");
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-alerte/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(async (res) => {
        const text = await res.text();

        if (!res.ok) {
          console.error(`Erreur HTTP ${res.status}:`, text);
          throw new Error(`Erreur serveur: ${res.status}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Réponse non JSON:', text);
          throw new Error('La réponse du serveur n\'est pas au format JSON');
        }

        return JSON.parse(text);
      })
      .then((data) => {
        setProduits(data);
        setError(null); // Réinitialise l'erreur en cas de succès
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des produits :', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des alertes.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PharmacieLayout>
      <div className="p-6">
        <motion.h1
          className="text-3xl font-bold mb-6 text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🚨 Alertes de rupture de stock
        </motion.h1>

        {/* Message d'erreur global */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
            <p>{error}</p>
          </div>
        )}

        {/* Loader */}
        {loading ? (
          <p className="text-gray-500 animate-pulse">Chargement des alertes...</p>
        ) : produits.length === 0 ? (
          <motion.p
            className="text-green-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✅ Aucune alerte de stock pour le moment
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produits.map((produit, index) => (
              <motion.div
                key={produit.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`rounded-2xl shadow-md border-2 hover:shadow-xl transition duration-300 ${
                    produit.niveau_alerte === 'danger'
                      ? 'border-red-500 bg-red-50'
                      : 'border-yellow-400 bg-yellow-50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl mt-1">
                        {produit.niveau_alerte === 'danger' ? (
                          <AlertOctagon className="text-red-600" />
                        ) : (
                          <AlertTriangle className="text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">{produit.nom_medicament}</h2>
                        <p className="text-sm text-gray-600">
                          Quantité restante :{' '}
                          <span className="font-semibold text-black">{produit.quantite}</span> / Seuil :{' '}
                          <span className="font-semibold text-black">{produit.alerte_quantite}</span>
                        </p>
                        <p
                          className={`text-sm font-semibold mt-1 ${
                            produit.niveau_alerte === 'danger'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {produit.niveau_alerte === 'danger' ? 'Rupture imminente ⚠️' : 'Stock faible'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PharmacieLayout>
  );
}