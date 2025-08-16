export interface ProduitPharmacie {
  id: number
  nom: string
  quantite: number
  prix_vente: number
}

export interface VenteProduit {
  produit: ProduitPharmacie
  quantite: number
}

export interface Client {
  id: number
  nom_complet: string
  telephone: string
}
