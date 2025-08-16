'use client'

import React, { useEffect, useState } from 'react'

interface Fabricant {
  id: number
  nom: string
  pays_origine?: string
}

interface Produit {
  id: number
  nom: string
  prix_achat: number
  devise: string
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const Page = () => {
  const [fabricants, setFabricants] = useState<Fabricant[]>([])
  const [produits, setProduits] = useState<Produit[]>([])
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [prixModifies, setPrixModifies] = useState<Record<number, number>>({})
  const [fabricantSelectionne, setFabricantSelectionne] = useState<string | null>(null)
  const [message, setMessage] = useState<Message | null>(null) // État pour le message

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setAccessToken(token)

    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFabricants(data)
          } else {
            console.error('Format inattendu:', data)
          }
        })
        .catch(err => console.error('Erreur chargement fabricants', err))
    }
  }, [])

  const chargerProduits = (fabricantId: string) => {
    if (accessToken && fabricantId) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits/${fabricantId}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      })
        .then(async res => {
          const text = await res.text()
          if (!res.ok) {
            console.error(`Erreur HTTP ${res.status}: ${text}`)
            return
          }
          try {
            const json = JSON.parse(text)
            if (Array.isArray(json)) {
              setProduits(json)
              setPrixModifies({}) // Reset modifications
            } else {
              console.error('Réponse JSON inattendue:', json)
            }
          } catch (e) {
            console.error('Erreur de parsing JSON:', e)
          }
        })
        .catch(err => console.error('Erreur chargement produits', err))
    }
  }

  const sauvegarderPrix = () => {
    if (!accessToken) return

    Object.entries(prixModifies).forEach(([produitId, nouveauPrix]) => {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produit/${produitId}/modifier/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prix_achat: nouveauPrix }),
      })
        .then(res => {
          if (!res.ok) throw new Error(`Erreur ${res.status}`)
          return res.json()
        })
        .then(data => {
          const produit = produits.find(p => p.id === parseInt(produitId))
          setMessage({
            text: `Le prix d'achat du médicament "${produit?.nom}" a été modifié avec succès.`,
            type: 'success'
          })

          setTimeout(() => setMessage(null), 5000)
        })
        .catch(err => {
          console.error(`Erreur mise à jour produit ${produitId}:`, err)
          setMessage({
            text: `Erreur lors de la mise à jour du prix du produit ${produitId}.`,
            type: 'error'
          })
          setTimeout(() => setMessage(null), 5000)
        })
    })

    // Rafraîchir la liste après mise à jour
    if (fabricantSelectionne) {
      setTimeout(() => chargerProduits(fabricantSelectionne), 1000)
    }
  }

  return (
    <div className="p-6">
      {/* Affichage du message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded border ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Modifier les prix d'achat</h2>

      <select
        onChange={(e) => {
          const id = e.target.value
          setFabricantSelectionne(id)
          chargerProduits(id)
        }}
        className="border px-3 py-2 rounded"
      >
        <option value="">Sélectionner un fabricant</option>
        {fabricants.map((fab) => (
          <option key={fab.id} value={fab.id}>
            {fab.nom}
          </option>
        ))}
      </select>

      <div className="mt-6">
        {produits.map(produit => (
          <div key={produit.id} className="mb-4 border p-4 rounded shadow-sm">
            <div className="font-semibold">{produit.nom}</div>
            <div className="text-gray-600 mb-2">
              Prix d'achat actuel : {produit.prix_achat} {produit.devise}
            </div>
            <input
              type="number"
              defaultValue={produit.prix_achat}
              onChange={(e) => {
                const nouveauPrix = parseFloat(e.target.value)
                setPrixModifies(prev => ({
                  ...prev,
                  [produit.id]: nouveauPrix,
                }))
              }}
              className="border px-2 py-1 rounded w-40"
            />
          </div>
        ))}
      </div>

      {produits.length > 0 && (
        <button
          onClick={sauvegarderPrix}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Sauvegarder les modifications
        </button>
      )}
    </div>
  )
}

export default Page