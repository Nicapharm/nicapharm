'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import HeaderAdmin from '../HeaderAdmin'

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
  id: string
  nom: string
  pays_origine: string
}

export default function CreateFabricant() {
  const [nom, setNom] = useState('')
  const [pays, setPays] = useState('')
  const [success, setSuccess] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [fabricants, setFabricants] = useState<Fabricant[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUserData(JSON.parse(storedUser))
      }
    } catch (err) {
      console.error("Erreur lecture utilisateur", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAllFabricants = async () => {
    if (!accessToken) return
    let allFabricants: Fabricant[] = []
    let page = 1
    let hasNext = true

    try {
      while (hasNext) {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        const data = response.data
        allFabricants = [...allFabricants, ...(data.results || [])]
        hasNext = data.next !== null
        page += 1
      }

      setFabricants(allFabricants)
    } catch (error) {
      console.error('Erreur chargement fabricants', error)
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchAllFabricants()
    }
  }, [accessToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accessToken) return console.error('Token manquant')

    try {
      if (isEditing && editingId) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/${editingId}/`,
          {
            nom,
            pays_origine: pays,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        setIsEditing(false)
        setEditingId(null)
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/`,
          {
            nom,
            pays_origine: pays,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
      }

      setSuccess(true)
      setNom('')
      setPays('')
      fetchAllFabricants()
    } catch (error) {
      console.error('Erreur soumission', error)
    }
  }

  const handleEdit = (fabricant: Fabricant) => {
    setNom(fabricant.nom)
    setPays(fabricant.pays_origine)
    setIsEditing(true)
    setEditingId(fabricant.id)
  }

  const handleDelete = async (id: string) => {
    if (!accessToken) return

    const confirmation = window.confirm('Voulez-vous vraiment supprimer ce fabricant ?')
    if (!confirmation) return

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      fetchAllFabricants()
    } catch (error) {
      console.error('Erreur suppression fabricant', error)
    }
  }

  if (loading) return <div className="text-center mt-10">Chargement...</div>
  if (!userData) return <div className="text-center mt-10 text-red-500">Utilisateur non trouvé</div>

  return (
    <>
      <HeaderAdmin user={userData} />

      <main className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-xl font-bold mb-4">
            {isEditing ? 'Modifier un fabricant' : 'Créer un fabricant'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nom du fabricant"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="border p-2 w-full"
              required
            />
            <input
              type="text"
              placeholder="Pays d'origine"
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className="border p-2 w-full"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {isEditing ? 'Modifier' : 'Enregistrer'}
            </button>
            {success && <p className="text-green-500 mt-2">Opération réussie !</p>}
          </form>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Liste des fabricants</h2>
            {fabricants.length === 0 ? (
              <p className="text-gray-500">Aucun fabricant trouvé.</p>
            ) : (
              <ul className="divide-y">
                {fabricants.map((fab) => (
                  <li key={fab.id} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{fab.nom}</p>
                      <p className="text-sm text-gray-600">{fab.pays_origine}</p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEdit(fab)}
                        className="text-blue-600 hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(fab.id)}
                        className="text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
