'use client'

import { useEffect, useState } from 'react'
import ListeLots from '@/components/ListeLots'
import PharmacieLayout from '@/app/dashboard/directeur/layout'

interface ProduitPharmacie {
  id: number
  nom_medicament: string
}

export default function PageLotsProduits() {
  const [produits, setProduits] = useState<ProduitPharmacie[]>([])
  const [produitId, setProduitId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false) // Pour contrôler l'affichage du menu
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-pharmacie/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProduits(data)
        } else if (data && Array.isArray(data.results)) {
          setProduits(data.results)
        } else {
          console.warn("Format inattendu :", data)
          setProduits([])
        }
      })
      .catch(err => console.error(err))
  }, [])

  const handleReset = () => {
    setProduitId(null)
    setSearchTerm('')
    setDateDebut('')
    setDateFin('')
  }

  // Filtrer les produits selon le terme de recherche
  const filteredProduits = produits.filter(produit =>
    produit.nom_medicament.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PharmacieLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📦 Liste des lots de médicaments</h1>

        <div className="mb-4 relative">
          <label htmlFor="searchProduit" className="block font-semibold mb-2">
            Recherchez un produit
          </label>
          <input
            id="searchProduit"
            type="text"
            placeholder="Tapez le nom du médicament..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Fermer avec délai
            className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {/* Suggestions */}
          {isOpen && searchTerm && filteredProduits.length > 0 && (
            <ul className="absolute border border-gray-300 rounded mt-1 bg-white max-h-48 overflow-y-auto z-20 shadow-md w-full">
              {filteredProduits.map((produit) => (
                <li
                  key={produit.id}
                  onClick={() => {
                    setProduitId(produit.id)
                    setSearchTerm(produit.nom_medicament)
                    setIsOpen(false)
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-all"
                >
                  {produit.nom_medicament}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-col">
            <label htmlFor="dateDebut" className="font-medium mb-1">Date début</label>
            <input
              type="date"
              id="dateDebut"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="dateFin" className="font-medium mb-1">Date fin</label>
            <input
              type="date"
              id="dateFin"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white px-4 py-2 rounded h-[40px] mt-5 hover:bg-gray-600 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {produitId && (
          <ListeLots
            produitId={produitId}
            dateDebut={dateDebut}
            dateFin={dateFin}
          />
        )}
      </div>
    </PharmacieLayout>
  )
}