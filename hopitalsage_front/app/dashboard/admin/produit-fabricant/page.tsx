'use client'

import React, { useEffect, useState } from 'react'
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

export default function CreateProduit() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fabricants, setFabricants] = useState<{ id: number; nom: string }[]>([])
  const [fabricantId, setFabricantId] = useState<string | ''>('')

  const [nom, setNom] = useState('')
  const [prixAchat, setPrixAchat] = useState<number | ''>('')
  const [nombrePlaquettes, setNombrePlaquettes] = useState<number | ''>('')
  const [success, setSuccess] = useState(false)

  const [userData, setUserData] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Charger les infos utilisateur
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUserData(JSON.parse(storedUser))
      }
    } catch (err) {
      console.error("Erreur utilisateur", err)
    } finally {
      setLoadingUser(false)
    }
  }, [])

  // Charger tous les fabricants avec pagination
  useEffect(() => {
    const fetchAllFabricants = async () => {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) return

      let page = 1
      let hasNext = true
      let allFabricants: { id: number; nom: string }[] = []

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

    fetchAllFabricants()
  }, [])

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    setErrorMessage(null)

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-fabricants/`,
        {
          fabricant: fabricantId,
          nom,
          prix_achat: prixAchat,
          devise: 'USD',
          nombre_plaquettes_par_boite: nombrePlaquettes,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      setNom('')
      setPrixAchat('')
      setFabricantId('')
      setNombrePlaquettes('')
      setSuccess(true)
    } catch (error: any) {
      console.error('Erreur création produit', error)

      const data = error?.response?.data

      if (data?.nom?.length) {
        setErrorMessage(data.nom[0])
      } else if (data?.non_field_errors?.length) {
        setErrorMessage(data.non_field_errors[0])
      } else if (typeof data === 'string') {
        setErrorMessage(data)
      } else if (data?.detail) {
        setErrorMessage(data.detail)
      } else if (typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([k, v]: [string, any]) => `${k} : ${Array.isArray(v) ? v[0] : v}`)
          .join('\n')
        setErrorMessage(messages)
      } else {
        setErrorMessage("Erreur inconnue.")
      }
    }
  }

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Chargement utilisateur...</p>
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

      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Ajouter un produit au fabricant</h1>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="fabricant" className="block text-sm font-medium text-gray-700">
              Fabricant
            </label>
            <select
              id="fabricant"
              value={fabricantId}
              onChange={(e) => setFabricantId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Sélectionner un fabricant</option>
              {fabricants.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
              Nom du produit
            </label>
            <input
              id="nom"
              type="text"
              placeholder="Nom du produit"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="prixAchat" className="block text-sm font-medium text-gray-700">
              Prix d'achat (boîte)
            </label>
            <input
              id="prixAchat"
              type="number"
              step="any"
              placeholder="Prix d'achat"
              value={prixAchat}
              onChange={(e) => {
                const val = e.target.value
                setPrixAchat(val === '' ? '' : parseFloat(val))
              }}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="devise" className="block text-sm font-medium text-gray-700">
              Devise
            </label>
            <input
              id="devise"
              type="text"
              value="Dollar Américain (USD)"
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-700 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="nombrePlaquettes" className="block text-sm font-medium text-gray-700">
              Nombre de plaquettes par boîte
            </label>
            <input
              id="nombrePlaquettes"
              type="number"
              placeholder="Ex: 10"
              value={nombrePlaquettes}
              onChange={(e) => {
                const val = e.target.value
                setNombrePlaquettes(val === '' ? '' : parseInt(val))
              }}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Ajouter le produit
          </button>

          {success && (
            <p className="text-green-600 text-center mt-4 font-medium">
              ✅ Produit ajouté avec succès !
            </p>
          )}

          {errorMessage && (
            <p className="text-red-600 text-center mt-4 font-medium whitespace-pre-wrap">
              ❌ {errorMessage}
            </p>
          )}
        </form>
      </main>
    </>
  )
}
