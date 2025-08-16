'use client';

import { useState } from 'react';

export default function PubliciteForm() {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image || !description || !dateDebut || !dateFin) {
      setMessage('Veuillez remplir tous les champs.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setMessage("Vous devez être connecté pour effectuer cette action.");
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);
    formData.append('date_debut', dateDebut);
    formData.append('date_fin', dateFin);

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/publicite-upload/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Ne pas mettre Content-Type ici quand on utilise FormData
        },
        body: formData,
      });

      if (res.ok) {
        setMessage('✅ Publicité créée avec succès !');
        setImage(null);
        setDescription('');
        setDateDebut('');
        setDateFin('');
      } else {
        const errorData = await res.json();
        console.error('Erreur backend :', errorData);
        setMessage('Erreur : ' + (errorData.detail || 'Impossible de créer la publicité'));
      }
    } catch (error) {
      console.error('Erreur serveur :', error);
      setMessage('❌ Erreur serveur, réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-zinc-800 rounded-md shadow-md">
      <h1 className="text-xl font-bold mb-4 text-emerald-600 dark:text-white">
        Créer une nouvelle publicité
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="image" className="block font-semibold mb-1 text-gray-800 dark:text-gray-200">Image</label>
          <input
            type="file"
            accept="image/*"
            id="image"
            onChange={e => e.target.files && setImage(e.target.files[0])}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-semibold mb-1 text-gray-800 dark:text-gray-200">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="dateDebut" className="block font-semibold mb-1 text-gray-800 dark:text-gray-200">Date Début</label>
          <input
            type="date"
            id="dateDebut"
            value={dateDebut}
            onChange={e => setDateDebut(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="dateFin" className="block font-semibold mb-1 text-gray-800 dark:text-gray-200">Date Fin</label>
          <input
            type="date"
            id="dateFin"
            value={dateFin}
            onChange={e => setDateFin(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded transition"
        >
          {loading ? 'Envoi en cours...' : 'Enregistrer la publicité'}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm font-medium text-red-600 dark:text-red-400">{message}</p>
      )}
    </div>
  );
}
