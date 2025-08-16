'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import HeaderDirecteur from '@/components/HeaderDirecteur';
import SidebarDirecteur from '@/components/SidebarDirecteur';

// Types
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

interface ClientData {
  id: number;
  nom_complet: string;
  telephone: string;
  created_at: string;
}

interface MedicalExam {
  id: number;
  tension_arterielle: string;
  examen_malaria: boolean;
  remarques: string | null;
  date_exam: string;
}

interface Prescription {
  id: number;
  medicament: string;
  dosage: string;
  duree_traitement: string;
  date_prescription: string;
}

export default function DossierMedicalPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params); // Déballage de la promesse
  const id = unwrappedParams.id;

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [examens, setExamens] = useState<MedicalExam[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
   // États utilisateur et pharmacie
    const [user, setUser] = useState<User | null>(null);
    const [pharmacie, setPharmacie] = useState<Pharmacie | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setAccessToken(token);
  }, []);

  useEffect(() => {
    if (accessToken && id) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clients/${id}/dossier-medical/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setClient(res.data.client);
          setExamens(res.data.examens || []);
          setPrescriptions(res.data.prescriptions || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erreur lors du chargement :', err);
          setError("Impossible de charger le dossier médical");
          setLoading(false);
        });
    }
  }, [accessToken, id]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarDirecteur />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {user && pharmacie && <HeaderDirecteur user={user} pharmacie={pharmacie} />}
        {/* Page Content */}

        {/* Page Content */}
        <main className="p-6">
          {loading ? (
            <div className="text-center py-10 text-blue-500">Chargement du dossier médical...</div>
          ) : error || !client ? (
            <div className="text-center py-10 text-red-500">
              {error || "Client introuvable"}
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6">Dossier médical de {client.nom_complet}</h1>

              {/* Informations générales */}
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Informations du patient</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Nom :</strong> {client.nom_complet}</p>
                  <p><strong>Téléphone :</strong> {client.telephone}</p>
                  <p>
                    <strong>Date d'inscription :</strong>{' '}
                    {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Examens médicaux */}
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Examens médicaux</h2>
                {examens.length > 0 ? (
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Tension artérielle</th>
                        <th className="p-3 text-left">Malaria</th>
                        <th className="p-3 text-left">Remarques</th>
                        <th className="p-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examens.map((exam, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{exam.tension_arterielle}</td>
                          <td className="p-3">{exam.examen_malaria ? 'Oui' : 'Non'}</td>
                          <td className="p-3">{exam.remarques || '-'}</td>
                          <td className="p-3">{new Date(exam.date_exam).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">Aucun examen médical enregistré.</p>
                )}
              </div>

              {/* Prescriptions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Ordonnances</h2>
                {prescriptions.length > 0 ? (
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Médicament</th>
                        <th className="p-3 text-left">Dosage</th>
                        <th className="p-3 text-left">Durée</th>
                        <th className="p-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((presc, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{presc.medicament}</td>
                          <td className="p-3">{presc.dosage}</td>
                          <td className="p-3">{presc.duree_traitement}</td>
                          <td className="p-3">{new Date(presc.date_prescription).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">Aucune prescription trouvée.</p>
                )}
              </div>
            </>
          )}
        </main>
        
      </div>
      
    </div>
   
  );
}