'use client'

import { useEffect, useState } from 'react'
import HeaderAdmin from './HeaderAdmin'
import axios from 'axios'
import Link from 'next/link'

interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  photo: string | null
  role: string
}

interface Fabricant {
  id: number
  nom: string
  nombre_produits: number
}

export default function DashboardAdminPage() {
  const [userData, setUserData] = useState<User | null>(null)
  const [fabricants, setFabricants] = useState<Fabricant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken')

        const [userRes, fabricantsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        setUserData(userRes.data)
        setFabricants(fabricantsRes.data.results) // ✅ important
      } catch (err) {
        console.error('Erreur de chargement des données :', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Impossible de charger l'utilisateur</p>
      </div>
    )
  }

  return (
    <>
      <HeaderAdmin user={userData} />

      <main className="p-6 md:p-10 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">
            Bienvenue, {userData.first_name} {userData.last_name}
          </h1>
          <p className="text-center text-gray-600 mb-10">
            Vous êtes connecté en tant qu’administrateur.
          </p>

          <div className="bg-white p-6 rounded-lg shadow mb-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Nombre total de fabricants :{' '}
              <span className="text-blue-600">{fabricants.length}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fabricants.map((fab) => (
              <div
                key={fab.id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border-t-4 border-blue-500"
              >
                <h3 className="text-lg font-bold text-blue-700 mb-2">
                  {fab.nom}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Produits enregistrés :{' '}
                  <span className="font-semibold text-gray-800">
                    {fab.nombre_produits}
                  </span>
                </p>
                <Link
                  href={`#`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Voir détails →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
