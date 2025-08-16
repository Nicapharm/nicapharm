'use client';

import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Star, PackageCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface Rapport {
  periode: string;
  date_debut: string;
  date_fin: string;
  chiffre_affaire: string | number;
  benefice: string | number;
  total_ventes: string | number;
  total_depenses?: string | number;
  solde?: string | number;
  produit_plus_vendu: string;
}

export default function RapportGeneral() {
  const [periode, setPeriode] = useState('jour');
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [loading, setLoading] = useState(false);
  const [montantStock, setMontantStock] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('❌ Vous devez être connecté');
      return;
    }

    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/rapport-general/?periode=${periode}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          // essaie de lire l'erreur JSON pour détecter pharmacie manquante
          try {
            const dataErr = await res.json();
            if (dataErr?.pharmacie) {
              setError("⚠️ Aucun rapport : vous n'avez pas de pharmacie liée à votre compte.");
            } else if (typeof dataErr === "string") {
              setError(`Erreur: ${dataErr}`);
            } else {
              setError(`Erreur inconnue (status ${res.status})`);
            }
          } catch {
            setError(`Erreur réseau (status ${res.status})`);
          }
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setRapport(data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Erreur lors du chargement du rapport:', err);
        setError('⚠️ Impossible de charger le rapport.');
      })
      .finally(() => setLoading(false));
  }, [periode]);

  // Charger le montant du stock une seule fois
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stock-total/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setMontantStock(data.montant_stock);
      })
      .catch((err) => {
        console.error('Erreur lors du chargement du montant du stock:', err);
      });
  }, []);

  const periodLabel = {
    jour: 'Journalier',
    semaine: 'Hebdomadaire',
    mois: 'Mensuel',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold text-gray-800">📊 Rapport {periodLabel[periode]}</h2>
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="mt-4 sm:mt-0 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="jour">Journalier</option>
          <option value="semaine">Hebdomadaire</option>
          <option value="mois">Mensuel</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="text-red-600 font-semibold">{error}</div>
      ) : (
        rapport && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <Card icon={<DollarSign className="text-green-600" />} label="Chiffre d'affaires" value={`${rapport.chiffre_affaire} Fc`} />
            <Card icon={<TrendingUp className="text-blue-600" />} label="Bénéfice" value={`${rapport.benefice} Fc`} />
            <Card icon={<ShoppingCart className="text-purple-600" />} label="Total des ventes" value={`${rapport.total_ventes} Fc`} />
            {rapport.total_depenses !== undefined && (
              <Card icon={<ShoppingCart className="text-red-600" />} label="Total des dépenses" value={`${rapport.total_depenses} Fc`} />
            )}
            {rapport.solde !== undefined && (
              <Card icon={<TrendingUp className="text-gray-600" />} label="Solde" value={`${rapport.solde} Fc`} />
            )}
            <Card icon={<Star className="text-yellow-500" />} label="Produit le plus vendu" value={rapport.produit_plus_vendu} />
            <Card icon={<CalendarIcon />} label="Période" value={`Du ${rapport.date_debut} au ${rapport.date_fin}`} />
            {montantStock && <Card icon={<PackageCheck className="text-orange-600" />} label="Valeur du stock" value={`${montantStock} Fc`} />}
          </motion.div>
        )
      )}
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex items-start space-x-4 hover:shadow-lg transition-all duration-300">
      <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 19h14a2 2 0 002-2V7H3v10a2 2 0 002 2z" />
    </svg>
  );
}
