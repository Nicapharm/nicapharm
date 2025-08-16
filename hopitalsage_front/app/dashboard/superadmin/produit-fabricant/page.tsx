'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'


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
  const [fabricantId, setFabricantId] = useState<number | ''>('')
  const [nom, setNom] = useState('')
  const [prixAchat, setPrixAchat] = useState<number | ''>('')
  const [devise, setDevise] = useState<'CDF' | 'USD'>('CDF')
  const [nombrePlaquettes, setNombrePlaquettes] = useState<number | ''>('') 
  const [success, setSuccess] = useState(false)

  const [userData, setUserData] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUserData(JSON.parse(storedUser))
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur", err)
    } finally {
      setLoadingUser(false)
    }
  }, [])

  useEffect(() => {
    const fetchFabricants = async () => {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) return

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setFabricants(response.data)
      } catch (error) {
        console.error('Erreur chargement fabricants', error)
      }
    }

    fetchFabricants()
  }, [])

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
          fabricant: Number(fabricantId),
          nom,
          prix_achat: prixAchat,
          devise,
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
      setDevise('CDF')
      setFabricantId('')
      setNombrePlaquettes('')
      setSuccess(true)
    } catch (error: any) {
      console.error('Erreur création produit', error)

      if (error.response?.data?.non_field_errors?.length) {
        setErrorMessage(error.response.data.non_field_errors[0])
      } else if (error.response?.data?.detail) {
        setErrorMessage(error.response.data.detail)
      } else {
        setErrorMessage("Erreur lors de l'enregistrement du produit.")
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
              onChange={(e) => setFabricantId(Number(e.target.value))}
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
            <select
              id="devise"
              value={devise}
              onChange={(e) => setDevise(e.target.value as 'CDF' | 'USD')}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="CDF">Franc Congolais (CDF)</option>
              <option value="USD">Dollar Américain (USD)</option>
            </select>
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
            <p className="text-red-600 text-center mt-4 font-medium">
              ❌ {errorMessage}
            </p>
          )}
        </form>
      </main>
    </>
  )
}
