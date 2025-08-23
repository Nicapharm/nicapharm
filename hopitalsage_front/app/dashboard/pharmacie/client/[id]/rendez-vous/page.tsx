'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PharmacieLayout from '@/app/dashboard/directeur/layout';

interface RendezVous {
  id: number;
  client: string;
  date: string;
  heure: string;
  statut: 'à venir' | 'passé';
}

export default function RendezVousPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const [date, setDate] = useState<Date | null>(null);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [heure, setHeure] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) setAccessToken(token);
  }, []);

  useEffect(() => {
    if (accessToken) fetchRendezVous();
  }, [accessToken]);

  const fetchRendezVous = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/rendez-vous/client/${clientId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setRendezVous(res.data);
    } catch (error) {
      console.error('❌ Erreur de chargement des rendez-vous', error);
    }
  };

  const enregistrerRendezVous = async () => {
    if (!date || !heure) return;

    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/rendez-vous/`,
        {
          client: clientId,
          date: date.toISOString().split('T')[0],
          heure: heure,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      await fetchRendezVous(); // ✅ Refetch pour cohérence
      setDate(null);
      setHeure('');
    } catch (error) {
      console.error("❌ Erreur d'enregistrement du rendez-vous", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PharmacieLayout>
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow">
        <h1 className="text-xl font-semibold text-emerald-700 mb-4">
          Gérer les Rendez-vous du Client #{clientId}
        </h1>

        {/* Formulaire */}
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">
            Nouveau rendez-vous :
          </label>
          <div className="flex gap-2 items-center flex-wrap">
            <DatePicker
              selected={date ?? null}
              onChange={(date: Date | null) => setDate(date)}
              className="border rounded px-4 py-2 w-full sm:w-auto"
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              placeholderText="Sélectionner une date"
            />
            <input
              type="time"
              value={heure}
              onChange={(e) => setHeure(e.target.value)}
              className="border rounded px-4 py-2 w-full sm:w-auto"
              required
            />
            <button
              onClick={enregistrerRendezVous}
              disabled={loading}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {/* Historique */}
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Historique des rendez-vous
        </h2>
        <ul className="divide-y border rounded">
          {rendezVous.length === 0 && (
            <li className="p-3 text-gray-500 text-center">
              Aucun rendez-vous enregistré.
            </li>
          )}
          {rendezVous.map((rdv) => (
            <li
              key={rdv.id}
              className="p-3 flex justify-between items-center"
            >
              <span>{rdv.date} à {rdv.heure}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  rdv.statut === 'passé'
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {rdv.statut}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </PharmacieLayout>
  );
}
