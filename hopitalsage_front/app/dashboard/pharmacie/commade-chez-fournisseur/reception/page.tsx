'use client'
import PharmacieLayout from '@/app/dashboard/directeur/layout';
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface Fabricant {
  id: number
  nom: string
  pays_origine: string
}

interface Ligne {
  id: number
  produit_fabricant: {
    id: number
    nom: string
    prix_achat: number
  }
  quantite_commandee: number
}

interface Commande {
  id: number
  date_commande: string
  etat: string
  fabricant: Fabricant
  lignes: Ligne[]
}

export default function CommandesAConfirmer() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialiser les quantités reçues avec les quantités commandées
  const [quantitesRecues, setQuantitesRecues] = useState<{ [key: number]: number }>(
    Object.fromEntries(
      commandes.flatMap(c =>
        c.lignes.map(ligne => [ligne.id, ligne.quantite_commandee])
      )
    )
  )

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      console.error('Token non disponible')
      setLoading(false)
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/commandes-produitss/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`)
        return res.json()
      })
      .then(data => {
        setCommandes(Array.isArray(data) ? data : data.results || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur lors du chargement des commandes :', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p>Chargement en cours...</p>
  }

  if (error) {
    return <p>Erreur : {error}</p>
  }

  // Gestion de la modification des quantités reçues
const handleQuantiteChange = (ligneId: number, value: string) => {
  const ligne = commandes
    .flatMap(c => c.lignes)
    .find(l => l.id === ligneId);

  const parsedValue = parseInt(value, 10) || 0;

  if (ligne && parsedValue > ligne.quantite_commandee) {
    alert(`⚠️ La quantité reçue ne peut pas dépasser la quantité commandée (${ligne.quantite_commandee}).`);
    return; // Ne pas modifier l'état
  }

  setQuantitesRecues(prevState => ({
    ...prevState,
    [ligneId]: parsedValue
  }));
}


  // Confirmation de la réception
  const confirmerReception = async (commandeId: number, lignes: Ligne[]) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Token d’accès manquant.')
      return
    }

    try {
      const lignesData = lignes.map(ligne => ({
        ligne_commande: ligne.id,
        quantite_recue: quantitesRecues[ligne.id] || ligne.quantite_commandee, // Utiliser la valeur actuelle ou la quantité commandée
      }))

      console.log("Données envoyées à l'API :", { commande: commandeId, lignes: lignesData })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reception/confirm/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commande: commandeId,
          lignes: lignesData,
        }),
      })

     if (response.ok) {
  alert(`Réception confirmée ✅ (Commande n°${commandeId})`)
  // Retirer la commande de l'interface sans relancer tout le fetch
  setCommandes(prev => prev.filter(c => c.id !== commandeId))

      } else {
        const errorData = await response.json()
        console.error(`Erreur lors de la confirmation :`, errorData)
        alert(`Erreur lors de la confirmation : ${JSON.stringify(errorData)}`)
      }
    } catch (err) {
      console.error('Erreur lors de la confirmation :', err)
      alert('Une erreur est survenue lors de la confirmation.')
    }
  }

  return (
    <PharmacieLayout>
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Commandes en attente de confirmation</h1>
      {commandes.length === 0 ? (
        <p>Aucune commande en attente.</p>
      ) : (
        <ul className="space-y-2">
          {commandes.map(c => (
            <li key={c.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-medium">Commande n°{c.id}</p>
                <p className="text-sm text-gray-500">Date : {new Date(c.date_commande).toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  Fabricant : {c.fabricant.nom} ({c.fabricant.pays_origine})
                </p>
                <p className="text-sm text-gray-500">État : {c.etat}</p>
                <p className="text-sm text-gray-500">Lignes :</p>
                <ul className="pl-4">
                  {c.lignes.map(ligne => (
                    <li key={ligne.id}>
                      <div>
                        <p>
                          Produit : {ligne.produit_fabricant.nom}, Quantité commandée : {ligne.quantite_commandee}
                        </p>
                        <label className="block mt-2 text-sm">Quantité reçue :</label>
                       <input
                          type="number"
                          className="border w-full p-1"
                          value={quantitesRecues[ligne.id] ?? ''} // forcer valeur définie
                          onChange={(e) => handleQuantiteChange(ligne.id, e.target.value)}
                        />

                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => confirmerReception(c.id, c.lignes)}
                className="text-blue-600 hover:underline bg-green-600 text-white px-4 py-2 rounded"
              >
                Confirmer réception
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    </PharmacieLayout>
  )
}