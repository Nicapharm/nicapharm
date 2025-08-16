'use client'

import { useState, useEffect } from 'react'
import PharmacieLayout from '@/app/dashboard/directeur/layout'

export default function PageDepense() {
  const [categorie, setCategorie] = useState('')
  const [description, setDescription] = useState('')
  const [montant, setMontant] = useState('')
  const [methodePaiement, setMethodePaiement] = useState('cash')
  const [dateDepense, setDateDepense] = useState('')
  const [pharmacieId, setPharmacieId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.pharmacie) {
            setPharmacieId(data.pharmacie.id)
          }
        })
        .catch((err) => console.error(err))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pharmacieId) {
      setMessage('❌ Impossible de trouver votre pharmacie.')
      return
    }
    setLoading(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/depenses/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categorie,
          description,
          montant,
          methode_paiement: methodePaiement,
          date_depense: dateDepense,
          pharmacie: pharmacieId,
        }),
      })

      if (res.ok) {
        setMessage('✅ Dépense enregistrée avec succès !')
        setCategorie('')
        setDescription('')
        setMontant('')
        setMethodePaiement('cash')
        setDateDepense('')
      } else {
        const data = await res.json()
        setMessage(`❌ Erreur: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error(error)
      setMessage('❌ Une erreur est survenue.')
    }

    setLoading(false)
  }

  return (
    <PharmacieLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">💰 Enregistrer une dépense</h1>

        {message && (
          <div
            className={`p-3 mb-4 rounded ${
              message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        {!pharmacieId ? (
          <p className="text-gray-500">Chargement des informations de la pharmacie...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {/* Catégorie */}
            <div>
              <label className="block font-semibold mb-1">Catégorie</label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                required
                className="border border-gray-300 rounded p-2 w-full"
              >
                <option value="">-- Choisir une catégorie --</option>
                <option value="transport">Transport</option>
                <option value="nourriture">Nourriture</option>
                <option value="achat_materiel">Achat de matériel</option>
                <option value="salaire">Salaire</option>
                <option value="Loyer">Loyer</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails de la dépense..."
                className="border border-gray-300 rounded p-2 w-full"
                rows={3}
              />
            </div>

            {/* Montant */}
            <div>
              <label className="block font-semibold mb-1">Montant</label>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="Ex: 5000"
                required
                className="border border-gray-300 rounded p-2 w-full"
              />
            </div>

            {/* Méthode de paiement */}
            <div>
              <label className="block font-semibold mb-1">Méthode de paiement</label>
              <select
                value={methodePaiement}
                onChange={(e) => setMethodePaiement(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
              >
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </PharmacieLayout>
  )
}
