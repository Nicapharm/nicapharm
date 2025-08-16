'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import PharmacieLayout from '@/app/dashboard/directeur/layout'

export default function CreateProduit() {
  const [fabricants, setFabricants] = useState<any[]>([])
  const [fabricantId, setFabricantId] = useState<number | ''>('') // ← type corrigé
  const [nom, setNom] = useState('')
  const [prixAchat, setPrixAchat] = useState<number | ''>('')
  const [devise, setDevise] = useState('CDF')
  const [nombrePlaquettes, setNombrePlaquettes] = useState<number | ''>('') // 👈 nouveau champ
  const [success, setSuccess] = useState(false)

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

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-fabricants/`,
        {
          fabricant: Number(fabricantId),
          nom: nom,
          prix_achat: prixAchat,
          devise: devise,
          nombre_plaquettes_par_boite: nombrePlaquettes, // 👈 envoi du champ
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
      setNombrePlaquettes('') // 👈 reset
      setSuccess(true)
    } catch (error) {
      console.error('Erreur création produit', error)
    }
  }

  return (
    <PharmacieLayout>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Ajouter un produit au fabricant</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={fabricantId}
            onChange={(e) => setFabricantId(Number(e.target.value))}
            className="border p-2 w-full"
            required
          >
            <option value="">Sélectionner un fabricant</option>
            {fabricants.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nom du produit"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border p-2 w-full"
            required
          />

          <input
            type="number"
            step="any"
            placeholder="Prix d'achat (boîte)"
            value={prixAchat}
            onChange={(e) => {
              const val = e.target.value
              setPrixAchat(val === '' ? '' : parseFloat(val))
            }}
            className="border p-2 w-full"
            required
          />

          <select
            value={devise}
            onChange={(e) => setDevise(e.target.value)}
            className="border p-2 w-full"
            required
          >
            <option value="CDF">Franc Congolais (CDF)</option>
            <option value="USD">Dollar Américain (USD)</option>
          </select>

          <input
            type="number"
            placeholder="Nombre de plaquettes par boîte"
            value={nombrePlaquettes}
            onChange={(e) => {
              const val = e.target.value
              setNombrePlaquettes(val === '' ? '' : parseInt(val))
            }}
            className="border p-2 w-full"
            required
          />

          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Ajouter le produit
          </button>

          {success && <p className="text-green-500">Produit ajouté avec succès !</p>}
        </form>
      </div>
    </PharmacieLayout>
  )
}
