'use client'

import { useEffect, useState } from 'react'
import PharmacieLayout from '@/app/dashboard/directeur/layout'
import Image from 'next/image'

interface Lot {
  id: string
  numero_lot: string
  nom_medicament: string
  date_peremption: string
  quantite: number
  pharmacie_id: string
}

function addDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export default function PageLotsExpire() {
  const [lots, setLots] = useState<Lot[]>([])
  const [periode, setPeriode] = useState<'expired' | 'week' | 'month' | 'two_months'>('week')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔍 Debug Logs (tu peux les supprimer plus tard)
  const [debugData, setDebugData] = useState<{
    token?: string
    pharmacieId?: string
    rawData?: any
    filteredData?: Lot[]
  }>({})

  useEffect(() => {
    const fetchLots = async () => {
      try {
        // Étape 1 : Récupérer le token
        const token = localStorage.getItem('accessToken')
        if (!token) throw new Error("Token introuvable.")

        // Sauvegarder dans debug
        setDebugData(prev => ({ ...prev, token }))

        // Étape 2 : Récupérer utilisateur
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!userRes.ok) throw new Error("Échec lors de la récupération de l'utilisateur.")
        const user = await userRes.json()

        const pharmacieId = user.pharmacie
        setDebugData(prev => ({ ...prev, pharmacieId }))
        console.log('Pharmacie ID:', pharmacieId)

        // Étape 3 : Récupérer les lots selon la période
        const periodMap = {
          expired: 'expired',
          week: 'week',
          month: 'month',
          two_months: 'two_months'
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lotss/expires/?period=${periodMap[periode]}`
        console.log('URL appelée:', url)

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          const errText = await res.text()
          console.error('Erreur API:', errText)
          throw new Error(`Échec lors de la récupération des lots. Code: ${res.status}`)
        }

        const data = await res.json()
        setDebugData(prev => ({ ...prev, rawData: data }))
        console.log('Données brutes reçues:', data)

        // Étape 4 : Filtrer par pharmacie
        const filtered = data.filter((lot: Lot) => lot.pharmacie_id === pharmacieId.id)
        setDebugData(prev => ({ ...prev, filteredData: filtered }))
        console.log('Lots filtrés:', filtered)

        setLots(filtered)
        setError(null)
      } catch (err: any) {
        console.error('Erreur détaillée:', err)
        setError(err.message || "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }

    fetchLots()
  }, [periode])

  const getUrgencyColor = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 0) return 'border-red-600 bg-red-50'
    if (diff <= 7) return 'border-red-500'
    if (diff <= 30) return 'border-orange-400'
    return 'border-yellow-300'
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR')

  return (
    <PharmacieLayout>
      <div className="p-6">
        <h1 className="text-3xl font-extrabold text-red-700 mb-6 flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 12c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" />
          </svg>
          Produits proches de péremption
        </h1>

        {/* Boutons de filtrage */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setPeriode('expired')}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow"
          >
            Périmés
          </button>
          <button
            onClick={() => setPeriode('week')}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded shadow"
          >
            Dans 7 jours
          </button>
          <button
            onClick={() => setPeriode('month')}
            className="bg-orange-400 hover:bg-orange-500 text-black font-semibold px-4 py-2 rounded shadow"
          >
            Dans 30 jours
          </button>
          <button
            onClick={() => setPeriode('two_months')}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded shadow"
          >
            Dans 60 jours
          </button>
        </div>

        {/* Debug info (optionnel) */}
        <details className="mb-6 text-xs text-gray-500">
          <summary>Voir les données de débogage</summary>
          <pre>{JSON.stringify(debugData, null, 2)}</pre>
        </details>

        {/* Erreur */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Chargement */}
        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : lots.length === 0 ? (
          <div className="text-gray-600 text-center mt-16">
            <Image
              src="/warning.png"
              alt="Aucun produit"
              width={120}
              height={120}
              className="mx-auto mb-4 opacity-60"
            />
            <p className="text-lg">Aucun médicament trouvé.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lots.map((lot) => (
              <div
                key={lot.id}
                className={`border-4 ${getUrgencyColor(lot.date_peremption)} rounded-xl p-4 shadow-lg bg-white hover:scale-[1.01] transition duration-200`}
              >
                <h2 className="text-lg font-bold text-gray-800 mb-2">{lot.nom_medicament}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Lot :</span> {lot.numero_lot}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Quantité :</span> {lot.quantite}
                </p>
                <p className="text-sm font-semibold text-red-700">
                  <span className="mr-1">🕒 Péremption :</span>
                  {formatDate(lot.date_peremption)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PharmacieLayout>
  )
}