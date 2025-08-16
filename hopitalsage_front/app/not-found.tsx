// app/not-found.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, []);

  return (
    <div className="text-center mt-32">
      <h1 className="text-3xl font-bold text-red-500">Page introuvable</h1>
      <p className="mt-4 text-gray-600">Vous allez être redirigé vers l’accueil.</p>
    </div>
  );
}
