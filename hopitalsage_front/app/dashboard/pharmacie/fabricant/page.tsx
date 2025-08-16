'use client'

import { useState } from 'react'
import axios from 'axios'

export default function CreateFabricant() {
  const [nom, setNom] = useState('')
  const [pays, setPays] = useState('')
  const [success, setSuccess] = useState(false)

  // Gestion de la soumission du formulaire avec accessToken
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const accessToken = localStorage.getItem('accessToken') // Récupération du token

    if (!accessToken) {
      console.error('Aucun token trouvé !')
      return
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/`, // URL complète
        {
          nom: nom,
          pays_origine: pays,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Inclusion du token dans les en-têtes
          },
        }
      )
      setNom('')
      setPays('')
      setSuccess(true)
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.error('Non autorisé : Token invalide ou expiré')
      } else {
        console.error('Erreur de création fabricant', error)
      }
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Créer un fabricant</h1>
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Enregistrer
        </button>
        {success && <p className="text-green-500">Fabricant créé avec succès !</p>}
      </form>
    </div>
  )
}