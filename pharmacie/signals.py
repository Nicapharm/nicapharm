# medicamentsn/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ProduitFabricant, ProduitPharmacie
from decimal import Decimal, InvalidOperation

@receiver(post_save, sender=ProduitFabricant)
def update_produits_pharmacie(sender, instance, **kwargs):
    try:
        nb_plaquettes = instance.nombre_plaquettes_par_boite
        prix_boite_cdf = instance.prix_achat_cdf()

        if nb_plaquettes and nb_plaquettes > 0:
            prix_par_plaquette = Decimal(prix_boite_cdf) / Decimal(nb_plaquettes)

            produits_pharmacies = ProduitPharmacie.objects.filter(produit_fabricant=instance)

            for produit in produits_pharmacies:
                produit.prix_achat = prix_par_plaquette.quantize(Decimal('0.01'))

                if produit.marge_beneficiaire is not None:
                    produit.prix_vente = (
                        produit.prix_achat + (produit.prix_achat * produit.marge_beneficiaire / 100)
                    ).quantize(Decimal('0.01'))

                produit.save()

    except (InvalidOperation, ZeroDivisionError) as e:
        print(f"Erreur lors de la mise à jour des produits pharmacie : {e}")


# signals.py (crée ce fichier dans ton app si pas encore)
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import TauxChange, ProduitPharmacie, CommandeProduitLigne, LotProduitPharmacie
from decimal import Decimal, ROUND_HALF_UP

@receiver(post_save, sender=TauxChange)
def update_prices_after_taux_change(sender, instance, **kwargs):
    print("🔁 Mise à jour des prix suite à une modification du taux...")

    taux = instance.taux

    # Mettre à jour les Produits Pharmacie
    for produit in ProduitPharmacie.objects.select_related('produit_fabricant').all():
        if produit.produit_fabricant.devise == 'USD':
            nb_plaquettes = produit.produit_fabricant.nombre_plaquettes_par_boite or 1
            prix_usd = produit.produit_fabricant.prix_achat
            prix_cdf = Decimal(prix_usd) * taux
            prix_plaquette = prix_cdf / Decimal(nb_plaquettes)
            produit.prix_achat = prix_plaquette.quantize(Decimal('0.01'))

            if produit.marge_beneficiaire is not None:
                produit.prix_vente = (
                    produit.prix_achat + (produit.prix_achat * produit.marge_beneficiaire / 100)
                ).quantize(Decimal('0.01'))

            produit.save()

    # Mettre à jour les lignes de commande
    for ligne in CommandeProduitLigne.objects.select_related('produit_fabricant').all():
        if ligne.produit_fabricant.devise == 'USD':
            prix_usd = ligne.produit_fabricant.prix_achat
            ligne.prix_achat = (Decimal(prix_usd) * taux).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            ligne.save()

    # Mettre à jour les lots (facultatif si prix viennent de ProduitPharmacie)
    for lot in LotProduitPharmacie.objects.select_related('produit').all():
        lot.prix_achat = lot.produit.prix_achat
        lot.prix_vente = lot.produit.prix_vente
        lot.save()

    print("✅ Mise à jour des prix terminée.")
