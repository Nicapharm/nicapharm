'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateDirector() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    pharmacie_id: '', // Sélectionner depuis une liste
    username: '',
    password: '',
    first_name: '',
    last_name: '',
  });

  // État pour les pharmacies
  const [pharmacies, setPharmacies] = useState<{ id: string; nom_pharm: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les pharmacies depuis l'API
 useEffect(() => {
  const fetchPharmacies = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pharmacies/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPharmacies(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des pharmacies:', err);
      setError('Impossible de charger les pharmacies');
    } finally {
      setLoading(false);
    }
  };
  fetchPharmacies();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convertir pharmacie_id en nombre
      const pharmacieId = formData.pharmacie_id;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/create-director/${pharmacieId}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
          }),
        }
      );

      if (response.ok) {
        router.push('/dashboard/superadmin');
      } else {
        throw new Error('Échec de la création du directeur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Créer un Directeur</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Sélection de la pharmacie */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Pharmacie :
          </label>
          <select
            name="pharmacie_id"
            value={formData.pharmacie_id}
            onChange={(e) =>
              setFormData({ ...formData, pharmacie_id: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Sélectionner une pharmacie</option>
            {!loading && pharmacies.map(pharmacie => (
              <option 
                key={pharmacie.id}
                value={pharmacie.id.toString()}
              >
                {pharmacie.nom_pharm}
              </option>
            ))}
            {loading && <option>Veuillez patienter...</option>}
          </select>
        </div>

        {/* Nom d'utilisateur */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Nom d'utilisateur :
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="Nom d'utilisateur"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Mot de passe */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Mot de passe :
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Mot de passe"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Prénom */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Prénom :
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
            placeholder="Prénom"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Nom de famille */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Nom de famille :
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
            placeholder="Nom de famille"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Créer le Directeur
        </button>
      </form>
    </div>
  );
}