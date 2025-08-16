'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import PharmacieLayout from '@/app/dashboard/directeur/layout';

const NouveauProduitPage = () => {
  const router = useRouter();
  const [fabricants, setFabricants] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);

  const [formData, setFormData] = useState({
    produit_fabricant: '',
    code_barre: '',
    nom_medicament: '',
    indication: '',
    localisation: '',
    conditionnement: 'pièce',
    date_peremption: '',
    categorie: '',
    alerte_quantite: 0,
    quantite: 0,
    prix_achat: 0,
    marge_beneficiaire: 0,
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

  // Charger les fabricants
  useEffect(() => {
    if (token) {
      axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fabricants/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setFabricants(res.data));
    }
  }, [token]);

  // Sélection du fabricant → charge les produits associés
  const handleFabricantChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fabricantId = e.target.value;
    setProduits([]);
    setSelectedProduit(null);
    setFormData(prev => ({
      ...prev,
      produit_fabricant: '',
      prix_achat: 0,
    }));

    if (fabricantId && token) {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-fabricant/?fabricant=${fabricantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProduits(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des produits");
      }
    }
  };

  // Sélection d’un produit → remplit les champs automatiquement
  const handleProduitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const produitId = e.target.value;
    const produit = produits.find(p => p.id.toString() === produitId);
    if (produit) {
      setSelectedProduit(produit);
      setFormData({
        ...formData,
        produit_fabricant: produit.id,
        nom_medicament: produit.nom,
        prix_achat: produit.prix_achat,
      });
    }
  };

  // Gestion des changements dans les champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Envoi du formulaire
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!token) {
    alert("❌ Vous n'êtes pas authentifié. Veuillez vous reconnecter.");
    return;
  }

  try {
    const { prix_achat, ...dataToSend } = formData;

    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/produits-pharmacie/`, dataToSend, {
      headers: { Authorization: `Bearer ${token}` }
    });

    router.push('/dashboard/pharmacie/nouvel-medicament-pharmacie/afficher-medicament');

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Erreur d'enregistrement :", error.response?.data); // 🔍 Montre le message exact de Django
    } else {
      console.error("Erreur inconnue :", error);
    }
  }
};


  return (
    <PharmacieLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter un médicament à la pharmacie</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Fabricant */}
          <div className="md:col-span-2">
            <label htmlFor="fabricant" className="block font-medium text-gray-700 mb-2">
              Sélectionner un fabricant
            </label>
            <select
              id="fabricant"
              onChange={handleFabricantChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Choisissez un fabricant --</option>
              {fabricants.map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
          </div>

          {/* Produit du fabricant */}
          <div className="md:col-span-2">
            <label htmlFor="produit" className="block font-medium text-gray-700 mb-2">
              Sélectionner un produit du fabricant
            </label>
            <select
              id="produit"
              onChange={handleProduitChange}
              disabled={produits.length === 0}
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                produits.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">-- Choisissez un produit --</option>
              {produits.map(p => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>

          {/* Code barre */}
          <div>
            <label htmlFor="code_barre" className="block font-medium text-gray-700 mb-2">
              Code Barre
            </label>
            <input
              id="code_barre"
              name="code_barre"
              type="text"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Nom du médicament */}
          <div>
            <label htmlFor="nom_medicament" className="block font-medium text-gray-700 mb-2">
              Nom du médicament
            </label>
            <input
              id="nom_medicament"
              name="nom_medicament"
              type="text"
              value={formData.nom_medicament}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Localisation */}
          <div>
            <label htmlFor="localisation" className="block font-medium text-gray-700 mb-2">
              Localisation (rayon, armoire...)
            </label>
            <input
              id="localisation"
              name="localisation"
              type="text"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Conditionnement */}
          <div>
            <label htmlFor="conditionnement" className="block font-medium text-gray-700 mb-2">
              Conditionnement
            </label>
            <select
              id="conditionnement"
              name="conditionnement"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="pièce">Pièce</option>
              <option value="boîte">Boîte</option>
              <option value="carton">Carton</option>
            </select>
          </div>

          {/* Date de péremption */}
          <div>
            <label htmlFor="date_peremption" className="block font-medium text-gray-700 mb-2">
              Date de péremption
            </label>
            <input
              id="date_peremption"
              name="date_peremption"
              type="date"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label htmlFor="categorie" className="block font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <input
              id="categorie"
              name="categorie"
              type="text"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Quantité minimale d'alerte */}
          <div>
            <label htmlFor="alerte_quantite" className="block font-medium text-gray-700 mb-2">
              Quantité minimale d'alerte
            </label>
            <input
              id="alerte_quantite"
              name="alerte_quantite"
              type="number"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Quantité en stock */}
          <div>
            <label htmlFor="quantite" className="block font-medium text-gray-700 mb-2">
              Quantité en stock
            </label>
            <input
              id="quantite"
              name="quantite"
              type="number"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Prix d'achat */}
          <div>
            <label htmlFor="prix_achat" className="block font-medium text-gray-700 mb-2">
              Prix d'achat (automatique)
            </label>
            <input
              id="prix_achat"
              name="prix_achat"
              type="number"
              value={formData.prix_achat}
              readOnly
              className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3"
            />
          </div>

          {/* Marge bénéficiaire */}
          <div>
            <label htmlFor="marge_beneficiaire" className="block font-medium text-gray-700 mb-2">
              Marge bénéficiaire (%)
            </label>
            <input
              id="marge_beneficiaire"
              name="marge_beneficiaire"
              type="number"
              step="0.01"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Indication thérapeutique */}
          <div className="md:col-span-2">
            <label htmlFor="indication" className="block font-medium text-gray-700 mb-2">
              Indication thérapeutique
            </label>
            <textarea
              id="indication"
              name="indication"
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Bouton submit */}
          <div className="md:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              🔖 Enregistrer le médicament
            </button>
          </div>
        </form>
      </div>
    </PharmacieLayout>
  );
};

export default NouveauProduitPage;