'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface Fabricant {
  id: number
  nom: string
}

export default function AjouterDepot() {
  const [fabricants, setFabricants] = useState<Fabricant[]>([])
  const [formData, setFormData] = useState({
    fabricant: '',
    nom_depot: '',
    ville: '',
    commune: '',
    quartier: '',
    adresse_complete: '',
    latitude: '',
    longitude: '',
    telephone: '',
  })

  // Fonction pour obtenir le token depuis localStorage
  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken')
    }
    return null
  }

  useEffect(() => {
    const fetchFabricants = async () => {
      try {
        const token = getAccessToken()
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setFabricants(res.data)
      } catch (err) {
        console.error('Erreur lors du chargement des fabricants:', err)
      }
    }

    fetchFabricants()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = getAccessToken()
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/depots/create/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      alert('Dépôt enregistré avec succès !')
      setFormData({
        fabricant: '',
        nom_depot: '',
        ville: '',
        commune: '',
        quartier: '',
        adresse_complete: '',
        latitude: '',
        longitude: '',
        telephone: '',
      })
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
      alert('Erreur lors de l\'enregistrement')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-xl">
      <h1 className="text-xl font-bold mb-4">Enregistrer un dépôt pharmaceutique</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="fabricant"
          value={formData.fabricant}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">-- Sélectionner un fabricant --</option>
          {fabricants.map((fab) => (
            <option key={fab.id} value={fab.id}>
              {fab.nom}
            </option>
          ))}
        </select>

        <input name="nom_depot" placeholder="Nom du dépôt" onChange={handleChange} value={formData.nom_depot} required className="w-full p-2 border rounded" />
        <input name="ville" placeholder="Ville" onChange={handleChange} value={formData.ville} required className="w-full p-2 border rounded" />
        <input name="commune" placeholder="Commune" onChange={handleChange} value={formData.commune} required className="w-full p-2 border rounded" />
        <input name="quartier" placeholder="Quartier" onChange={handleChange} value={formData.quartier} required className="w-full p-2 border rounded" />
        <input name="adresse_complete" placeholder="Adresse complète" onChange={handleChange} value={formData.adresse_complete} required className="w-full p-2 border rounded" />
        <input name="latitude" placeholder="Latitude (facultatif)" onChange={handleChange} value={formData.latitude} className="w-full p-2 border rounded" />
        <input name="longitude" placeholder="Longitude (facultatif)" onChange={handleChange} value={formData.longitude} className="w-full p-2 border rounded" />
        <input name="telephone" placeholder="Téléphone (facultatif)" onChange={handleChange} value={formData.telephone} className="w-full p-2 border rounded" />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Enregistrer le dépôt
        </button>
      </form>
    </div>
  )
}
