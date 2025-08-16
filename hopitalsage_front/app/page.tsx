// app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Si l'utilisateur est connecté, rediriger vers le tableau de bord
      router.push('/dashboard');
    } else {
      // Sinon, rediriger vers la page de connexion
      router.push('/login');
    }
  }, [router]);

  // Rien n'est rendu ici car l'utilisateur sera immédiatement redirigé
  return null;
}