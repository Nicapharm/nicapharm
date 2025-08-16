'use client'

import React, { useEffect, useState } from 'react'

interface Fabricant {
  id: number
  nom: string
}

interface Produit {
  id: number
  nom: string
  prix_achat: number
  devise: string
  nombre_plaquettes_par_boite: number
}

interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  photo: string | null
  role: string
}

interface Message {
  text: string
  type: 'success' | 'error'
}

interface Modification {
  prix_achat?: number
  nombre_plaquettes_par_boite?: number
  nom?: string
}

const Page = () => {
  const [fabricants, setFabricants] = useState<Fabricant[]>([])
  const [produits, setProduits] = useState<Produit[]>([])
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [modifications, setModifications] = useState<Record<number, Modification>>({})
  const [fabricantSelectionne, setFabricantSelectionne] = useState<string | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [filtreRecherche, setFiltreRecherche] = useState<string>('')

  const [userData, setUserData] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUserData(JSON.parse(storedUser))
    setLoadingUser(false)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setAccessToken(token)

    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          // Si la réponse est paginée, utilise .results
          if (Array.isArray(data)) {
            setFabricants(data)
          } else if (data.results) {
            setFabricants(data.results)
          } else {
            setFabricants([])
          }
        })
        .catch(() => setFabricants([]))
    }
  }, [])

  const chargerProduits = async (fabricantId: string) => {
    if (!accessToken) return

    let allProduits: Produit[] = []
    let page = 1
    let hasNext = true

    while (hasNext) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits/${fabricantId}/?page=${page}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const data = await res.json()

      allProduits = [...allProduits, ...(data.results || [])]
      hasNext = data.next !== null
      page += 1
    }

    setProduits(allProduits)
  }

  const handleInputChange = (
    produitId: number,
    field: keyof Modification,
    value: string | number
  ) => {
    setModifications(prev => ({
      ...prev,
      [produitId]: {
        ...prev[produitId],
        [field]: value,
      },
    }))
  }

  const estModifie = (produit: Produit): boolean => {
    const modif = modifications[produit.id]
    if (!modif) return false
    return (
      (modif.nom !== undefined && modif.nom !== produit.nom) ||
      (modif.prix_achat !== undefined && modif.prix_achat !== produit.prix_achat) ||
      (modif.nombre_plaquettes_par_boite !== undefined &&
        modif.nombre_plaquettes_par_boite !== produit.nombre_plaquettes_par_boite)
    )
  }

  const sauvegarderPrix = () => {
    if (!accessToken) return

    Object.entries(modifications).forEach(([produitId, updates]) => {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produit/${produitId}/modifier/`

      fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
        .then(res => {
          if (!res.ok) throw new Error(`Erreur ${res.status}`)
          return res.json()
        })
        .then(() => {
          const produit = produits.find(p => p.id === parseInt(produitId))
          const messages: string[] = []

          if (updates.nom !== undefined && updates.nom !== produit?.nom) {
            messages.push(`📝 Nom : <b>${produit?.nom}</b> → <b>${updates.nom}</b>`)
          }
          if (updates.prix_achat !== undefined) {
            messages.push(`💵 Prix d'achat : <b>${produit?.prix_achat} ${produit?.devise}</b> → <b>${updates.prix_achat} ${produit?.devise}</b>`)
          }
          if (updates.nombre_plaquettes_par_boite !== undefined) {
            messages.push(`📦 Plaquettes/boîte : <b>${produit?.nombre_plaquettes_par_boite}</b> → <b>${updates.nombre_plaquettes_par_boite}</b>`)
          }

          setMessage({
            text: `✅ Produit <b>"${produit?.nom}"</b> mis à jour :<br />${messages.join('<br />')}`,
            type: 'success',
          })

          setTimeout(() => setMessage(null), 6000)
        })
        .catch(() => {
          setMessage({
            text: `❌ Erreur mise à jour du produit <b>${produitId}</b>.`,
            type: 'error',
          })
          setTimeout(() => setMessage(null), 6000)
        })
    })
  }

  if (loadingUser) return <div className="flex justify-center items-center min-h-screen">Chargement utilisateur...</div>
  if (!userData) return <div className="flex justify-center items-center min-h-screen text-red-600">Erreur utilisateur</div>

  const produitsFiltres = produits.filter((produit) =>
    produit.nom.toLowerCase().includes(filtreRecherche.toLowerCase())
  )

  return (
    <main className="p-6 md:p-10 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        {message && (
          <div
            className={`mb-6 p-4 rounded-md shadow border ${
              message.type === 'success'
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'bg-red-100 border-red-300 text-red-800'
            }`}
            dangerouslySetInnerHTML={{ __html: message.text }}
          />
        )}

        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Sélectionner un fabricant</label>
          <select
            onChange={(e) => {
              const id = e.target.value
              setFabricantSelectionne(id)
              chargerProduits(id)
            }}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
          >
            <option value="">-- Choisir --</option>
            {fabricants.map((fab) => (
              <option key={fab.id} value={fab.id}>{fab.nom}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Rechercher un produit</label>
          <input
            type="text"
            value={filtreRecherche}
            onChange={(e) => setFiltreRecherche(e.target.value)}
            placeholder="Tapez un nom de médicament..."
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
          />
        </div>

        <div className="space-y-6">
          {produitsFiltres.length === 0 ? (
            <p className="text-center text-gray-500 italic">Aucun produit trouvé</p>
          ) : (
            produitsFiltres.map((produit) => {
              const isModifie = estModifie(produit)
              return (
                <div
                  key={produit.id}
                  className={`p-5 rounded-xl shadow transition duration-200 ${
                    isModifie ? 'bg-green-100 border border-green-300' : 'bg-white'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Nom du médicament</label>
                      <input
                        type="text"
                        defaultValue={produit.nom}
                        onChange={(e) =>
                          handleInputChange(produit.id, 'nom', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Prix d'achat ({produit.devise})</label>
                      <input
                        type="number"
                        defaultValue={produit.prix_achat}
                        step="0.01"
                        onChange={(e) =>
                          handleInputChange(produit.id, 'prix_achat', parseFloat(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Plaquettes/boîte</label>
                      <input
                        type="number"
                        min="1"
                        defaultValue={produit.nombre_plaquettes_par_boite}
                        onChange={(e) =>
                          handleInputChange(produit.id, 'nombre_plaquettes_par_boite', parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1"
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {produitsFiltres.length > 0 && (
          <div className="mt-6">
            <button
              onClick={sauvegarderPrix}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow"
            >
              💾 Sauvegarder les modifications
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default Page
