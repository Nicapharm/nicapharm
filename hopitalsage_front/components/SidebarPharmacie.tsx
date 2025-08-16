'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Publicite {
  image: string;
  description: string;
  date_debut: string;
  date_fin: string;
}

interface PharmacieData {
  nom_pharm: string;
  logo_pharm: string | null;
}

const SidebarPharmacie = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const [publicite, setPublicite] = useState<Publicite | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pharmacie, setPharmacie] = useState<PharmacieData | null>(null);

  const handleGoHome = () => {
    router.push('/dashboard/directeur');
    if (onClose) onClose();
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn("Token manquant");
      return;
    }

    // Charger publicité
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/publicite-active/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        console.log("Données publicité :", data);
        if (data?.image && data?.description) {
          setPublicite(data);
        }
      })
      .catch(err => console.error("Erreur pub:", err));

    // Charger infos pharmacie
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        console.log("Infos utilisateur reçues:", data);
        console.log("Logo pharmacie:", data.pharmacie?.logo_pharm);
       

        setPharmacie(data.pharmacie || null);
      })
      .catch(error => {
        console.error("Erreur chargement pharmacie:", error);
      });
  }, []);

  return (
    <aside className="h-full w-72 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 dark:from-green-800 dark:via-green-700 dark:to-green-600 shadow-2xl flex flex-col font-sans overflow-hidden rounded-tr-3xl rounded-br-3xl">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-emerald-400/70 scrollbar-track-transparent">

        {/* Logo + Nom Pharmacie */}
        <div className="flex flex-col items-center">
          <img
          src={
            pharmacie?.logo_pharm
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${pharmacie.logo_pharm}`
              : '/nicapharm.png'
          }
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/nicapharm.png';
          }}
          alt="Logo de la pharmacie"
          className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-emerald-700 mb-3"
        />


          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-white text-xl font-bold tracking-wide text-center"
          >
            {pharmacie?.nom_pharm || 'Pharmacie inconnue'}
          </motion.h1>
        </div>

        {/* Bouton Accueil */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoHome}
          className="w-full bg-emerald-100/30 dark:bg-emerald-900 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-emerald-200/40 dark:hover:bg-emerald-800 transition"
        >
          🏠 Accueil
        </motion.button>

        {/* Publicité */}
        {publicite && (
          <div
            className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow text-white cursor-pointer"
            onClick={() => setShowModal(true)}
          >
           <img
              src={publicite.image}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/nicapharm.png';
              }}
              alt="Publicité Pharmacie"
              className="w-full h-48 object-cover rounded-xl mb-2 transition hover:scale-105"
            />

            <h2 className="font-bold text-base">Promotion</h2>
            <p className="text-sm truncate">{publicite.description}</p>
            <p className="text-xs mt-1 italic text-white/70">
              📅 {publicite.date_debut} → {publicite.date_fin}
            </p>
          </div>
        )}

        {/* Paiement Abonnement */}
        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl text-white text-sm shadow">
          <h3 className="font-bold mb-1">💰 Compte paiement</h3>
          <p>Numéro : <strong>0856693433</strong></p>
          <p>Compte : <strong>ARCHIPE KAYEYE</strong></p>
        </div>
      </div>

      {/* Pied de page */}
      <div className="px-4 py-3 text-center text-white text-xs border-t border-white/20">
        <p className="font-semibold">© Nicatech 2024</p>
        <p>Développé par Ir. XUBUNTU</p>
      </div>

      {/* Modal Publicité */}
      {showModal && publicite && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-2xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 font-bold text-2xl"
            >
              ✖
            </button>

            <img
              src={publicite.image}
              onError={(e) => {
                e.currentTarget.src = '/nicapharm.png';
              }}
              alt="Zoom publicité"
              className="w-full max-h-[400px] object-contain rounded-lg mb-4"
            />

            <h2 className="text-2xl font-bold mb-2 text-emerald-700 dark:text-emerald-400">En Promotion</h2>

            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {publicite.description}
            </p>

            <p className="text-xs mt-3 italic text-gray-500 dark:text-gray-400">
              📅 {publicite.date_debut} → {publicite.date_fin}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SidebarPharmacie;
