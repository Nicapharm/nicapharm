from django.test import TestCase
from .models import ReceptionProduit,Pharmacie, ReceptionLigne,ProduitFabricant,ProduitPharmacie, CommandeProduitLigne,  Fabricant, CommandeProduit

class ReceptionTest(TestCase):
    def setUp(self):
        self.pharmacie = Pharmacie.objects.create(nom="Pharmacie Test")
        self.fabricant = Fabricant.objects.create(nom="Fabricant Test")
        self.produit_fabricant = ProduitFabricant.objects.create(
            fabricant=self.fabricant,
            nom="Produit Test",
            prix_achat=100
        )
        self.commande = CommandeProduit.objects.create(pharmacie=self.pharmacie, etat="en_attente")
        self.ligne_commande = CommandeProduitLigne.objects.create(
            commande=self.commande,
            produit_fabricant=self.produit_fabricant,
            quantite_commandee=10
        )

    def test_reception_augmente_quantite_et_change_etat(self):
        # Créez une réception
        reception = ReceptionProduit.objects.create(commande=self.commande, utilisateur=None)
        ReceptionLigne.objects.create(
            reception=reception,
            ligne_commande=self.ligne_commande,
            quantite_recue=5
        )

        # Vérifiez que la quantité a été mise à jour
        produit = ProduitPharmacie.objects.get(
            pharmacie=self.pharmacie,
            produit_fabricant=self.produit_fabricant
        )
        self.assertEqual(produit.quantite, 5)

        # Vérifiez que l'état de la commande a été modifié
        commande = CommandeProduit.objects.get(id=self.commande.id)
        self.assertEqual(commande.etat, "confirmee")