'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import HeaderDirecteur from '@/components/HeaderDirecteur';
import SidebarDirecteur from '@/components/SidebarDirecteur';

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

interface Pharmacie {
  id: number;
  nom_pharm: string;
  adresse_pharm: string;
  telephone: string | null;
}

export default function ExamenPatientPage() {
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    tension_arterielle: '',
    examen_malaria: false,
    remarques: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [pharmacie, setPharmacie] = useState<Pharmacie | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) setAccessToken(token);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clients/${id}/examen/`,
        formData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setSuccess('Examen créé avec succès !');
      setFormData({
        tension_arterielle: '',
        examen_malaria: false,
        remarques: '',
      });
    } catch (err: any) {
      console.error('Erreur lors de la soumission', err);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarDirecteur />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {user && pharmacie && <HeaderDirecteur user={user} pharmacie={pharmacie} />}
        <h1 className="text-2xl font-bold mb-6">Ajouter un examen médical</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tension artérielle
            </label>
            <input
              type="text"
              name="tension_arterielle"
              value={formData.tension_arterielle}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="ex: 12/8"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="examen_malaria"
              checked={formData.examen_malaria}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600"
            />
            <label className="ml-2 text-gray-700">Test de paludisme positif</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarques</label>
            <textarea
              name="remarques"
              value={formData.remarques}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
              placeholder="Autres observations..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer l’examen'}
          </button>

          {success && <div className="text-green-500 mt-4 text-center">{success}</div>}
        </form>
      </div>
      </div>
    
  );
}