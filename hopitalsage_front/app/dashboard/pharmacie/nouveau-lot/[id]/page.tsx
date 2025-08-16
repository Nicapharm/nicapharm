'use client';

import { useRouter } from 'next/router';

export default function Page() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📝 Modifier le lot {id}</h1>
      {/* Formulaire ou contenu ici */}
    </div>
  );
}