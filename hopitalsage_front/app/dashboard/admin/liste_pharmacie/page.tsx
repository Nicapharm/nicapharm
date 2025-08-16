'use client';

import React, { useEffect, useState } from 'react';
import HeaderAdmin from '../HeaderAdmin';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PharmacieData {
  id: number;
  nom_pharm: string;
  ville_pharm: string;
  commune_pharm: string;
  adresse_pharm: string;
  telephone: string;
  montant_mensuel: number;
  date_expiration: string | null;
  jours_restants: number;
  est_expiree: boolean; 
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  photo: string | null;
  role: string;
}

const ITEMS_PER_PAGE = 5;

export default function PharmaciesPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacieData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Charger les données utilisateur depuis le localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
      } catch (error) {
        console.error('Erreur lors du parsing de l’utilisateur', error);
      }
    }
  }, []);

  // Charger les pharmacies via l’API
  useEffect(() => {
    const fetchPharmacies = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        toast.error('Vous devez être connecté.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pharmacies/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error('Échec du chargement des pharmacies');

        const data = await response.json();
        setPharmacies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur lors du chargement des pharmacies :', error);
        toast.error('Impossible de charger les pharmacies.');
        setPharmacies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  // Calcul pagination
  const totalPages = Math.ceil(pharmacies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPharmacies = pharmacies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const paginate = (page: number) => setCurrentPage(page);

  if (loading || !userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#007BFF]"
        ></motion.div>
      </div>
    );
  }

  return (
    <>
      <HeaderAdmin user={userData} />

      <main className="p-4 sm:p-6 space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-[#007BFF] mb-6"
        >
          Liste des Pharmacies
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-4 overflow-x-auto"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Commune</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Montant Mensuel (€)</TableHead>
                <TableHead>Date d'expiration</TableHead>
                <TableHead>Jours restants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPharmacies.length > 0 ? (
                currentPharmacies.map((pharm) => (
                  <TableRow key={pharm.id}>
                    <TableCell>{pharm.nom_pharm}</TableCell>
                    <TableCell>{pharm.ville_pharm}</TableCell>
                    <TableCell>{pharm.commune_pharm}</TableCell>
                    <TableCell>{pharm.adresse_pharm}</TableCell>
                    <TableCell>{pharm.telephone}</TableCell>
                    <TableCell>
                    {isNaN(parseFloat(pharm.montant_mensuel as any)) 
                        ? '0.00' 
                        : parseFloat(pharm.montant_mensuel as any).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {pharm.date_expiration ? new Date(pharm.date_expiration).toLocaleDateString() : 'Non définie'}
                    </TableCell>
                    <TableCell>{pharm.jours_restants}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Aucune pharmacie trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-[#007BFF] text-white'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}