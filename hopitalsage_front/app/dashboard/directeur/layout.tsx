'use client';

import SidebarPharmacie from '@/components/SidebarPharmacie';
import HeaderComptable from '@/components/HeaderComptable';
import { ReactNode, useEffect, useState } from 'react';

interface Pharmacie {
  id: number;
  nom_pharm: string;
  adresse_pharm: string;
  telephone: string | null;
  est_expiree: boolean; 
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

export default function PharmacieLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pharmacie, setPharmacie] = useState<Pharmacie | null>(null);

  useEffect(() => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setPharmacie(data.pharmacie); // ✅ récupère la pharmacie imbriquée
      })
      .catch(err => console.error('Erreur récupération:', err));
  }
}, []);


  if (!user || !pharmacie) {
    return <div className="text-center p-10 text-gray-500">Chargement...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-72 bg-emerald-700 flex-shrink-0 overflow-y-auto">
        <SidebarPharmacie />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <HeaderComptable user={user} pharmacie={pharmacie} />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
