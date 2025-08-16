'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'


export default function TauxChangePage() {
  const [taux, setTaux] = useState<number | null>(null)
  const [newTaux, setNewTaux] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Charger le taux actuel
  useEffect(() => {
    const fetchTaux = async () => {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) return

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/taux-change/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (res.data.length > 0) {
          setTaux(res.data[0].taux)
        }
      } catch (err) {
        console.error('Erreur de chargement du taux', err)
      }
    }

    fetchTaux()
  }, [])

  // Soumission d'un nouveau taux
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/taux-change/`,
        { taux: parseFloat(newTaux) },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      setTaux(parseFloat(newTaux))
      setNewTaux('')
      setSuccess(true)
    } catch (err) {
      console.error('Erreur de mise à jour du taux', err)
      setError("Impossible d'enregistrer le taux.")
    }
  }

  return (
   
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Gestion du taux de change</h1>

        <div className="mb-4">
          <p className="text-gray-700">
            <strong>Taux actuel</strong> : {taux ? `${taux} CDF/USD` : 'Chargement...'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            step="any"
            placeholder="Nouveau taux (ex: 2700)"
            value={newTaux}
            onChange={(e) => setNewTaux(e.target.value)}
            className="border p-2 w-full"
            required
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Mettre à jour le taux
          </button>
        </form>

        {success && <p className="text-green-600 mt-2">Taux mis à jour avec succès !</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
   
  )
}
