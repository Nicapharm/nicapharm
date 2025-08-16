from django.db import models
from comptes.models import Pharmacie, User
import uuid


class Fabricant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=255)
    pays_origine = models.CharField(max_length=255)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom

class DepotPharmaceutique(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fabricant = models.ForeignKey('Fabricant', on_delete=models.CASCADE, related_name='depots')
    nom_depot = models.CharField(max_length=255)
    ville = models.CharField(max_length=255)
    commune = models.CharField(max_length=255)
    quartier = models.CharField(max_length=255)
    adresse_complete = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom_depot} - {self.fabricant.nom}"

class TauxChange(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    taux = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Taux du {self.date}: {self.taux}"

class ProduitFabricant(models.Model):
    DEVISES = (
        ('USD', 'Dollar américain'),
        ('CDF', 'Franc congolais'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fabricant = models.ForeignKey('Fabricant', on_delete=models.CASCADE, related_name='produits', db_index=True)
    nom = models.CharField(max_length=255, db_index=True)
    prix_achat = models.DecimalField(max_digits=10, decimal_places=5)
    devise = models.CharField(max_length=3, choices=DEVISES, default='CDF')
    nombre_plaquettes_par_boite = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    def prix_achat_cdf(self):
        if self.devise == 'USD':
            try:
                taux_actuel = TauxChange.objects.latest('date').taux
            except TauxChange.DoesNotExist:
                taux_actuel = 1
            return self.prix_achat * taux_actuel
        return self.prix_achat

    @property
    def prix_achat_par_plaquette(self):
        if self.nombre_plaquettes_par_boite > 0:
            return self.prix_achat_cdf() / self.nombre_plaquettes_par_boite
        return 0

    def __str__(self):
        return f"{self.nom} ({self.fabricant.nom})"

# 4. Enregistrement du produit dans la pharmacie
from decimal import Decimal, InvalidOperation

class ProduitPharmacie(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE, related_name='produits_pharmacie')
    produit_fabricant = models.ForeignKey(ProduitFabricant, on_delete=models.CASCADE)
    code_barre = models.CharField(max_length=100, unique=True)
    nom_medicament = models.CharField(max_length=255)
    indication = models.TextField(blank=True, null=True)
    localisation = models.CharField(max_length=255)

    CONDITIONNEMENT_CHOICES = [
        ('pièce', 'Pièce'),
        ('boîte', 'Boîte'),
        ('carton', 'Carton'),
    ]
    conditionnement = models.CharField(max_length=20, choices=CONDITIONNEMENT_CHOICES)

    date_peremption = models.DateField()
    categorie = models.CharField(max_length=100)
    alerte_quantite = models.PositiveIntegerField()
    quantite = models.PositiveIntegerField()

    prix_achat = models.DecimalField(max_digits=10, decimal_places=2)  # 🟠 devient le prix par plaquette
    marge_beneficiaire = models.DecimalField(max_digits=5, decimal_places=2, help_text="En pourcentage")
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        try:
            nb_plaquettes = self.produit_fabricant.nombre_plaquettes_par_boite
            prix_boite = self.produit_fabricant.prix_achat_cdf()  # ✅ conversion correcte

            if nb_plaquettes and nb_plaquettes > 0:
                prix_par_plaquette = Decimal(prix_boite) / Decimal(nb_plaquettes)
                self.prix_achat = prix_par_plaquette.quantize(Decimal('0.01'))

                if self.marge_beneficiaire is not None:
                    self.prix_vente = (
                        self.prix_achat + (self.prix_achat * self.marge_beneficiaire / 100)
                    ).quantize(Decimal('0.01'))

        except (AttributeError, ZeroDivisionError, InvalidOperation) as e:
            print(f"Erreur lors du calcul automatique : {e}")

        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.nom_medicament} - {self.pharmacie.nom}"

from decimal import Decimal
import string
import random

class LotProduitPharmacie(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit = models.ForeignKey(
        'ProduitPharmacie',
        on_delete=models.CASCADE,
        related_name='lots'
    )
    numero_lot = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,  # pour éviter les doublons
        help_text="Numéro du lot (fourni par le fournisseur ou généré automatiquement)"
    )
    date_peremption = models.DateField()
    date_entree = models.DateField(auto_now_add=True)
    quantite = models.PositiveIntegerField()
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # ✅ Génère automatiquement un numéro de lot si vide
        if not self.numero_lot:
            caracteres = string.ascii_letters + string.digits + "!@#$%&*"
            while True:
                aleatoire = ''.join(random.choices(caracteres, k=10))
                candidate = f"lot-{aleatoire}"
                if not LotProduitPharmacie.objects.filter(numero_lot=candidate).exists():
                    self.numero_lot = candidate
                    break

        # ✅ Copie les prix du produit s'ils ne sont pas définis
        if self.prix_achat is None:
            self.prix_achat = self.produit.prix_achat
        if self.prix_vente is None:
            self.prix_vente = self.produit.prix_vente

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.produit.nom_medicament} | Lot: {self.numero_lot or 'N/A'} | Péremption: {self.date_peremption} | Qté: {self.quantite}"

class CommandeProduit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE  )
    date_commande = models.DateTimeField(auto_now_add=True)
    etat = models.CharField(max_length=50, default="en_attente")
    fabricant = models.ForeignKey(Fabricant, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from .models import TauxChange

class CommandeProduitLigne(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    commande = models.ForeignKey('CommandeProduit', on_delete=models.CASCADE, related_name='lignes')
    produit_fabricant = models.ForeignKey('ProduitFabricant', on_delete=models.CASCADE)
    quantite_commandee = models.PositiveIntegerField()
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2)  # sera en CDF
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        prix = self.produit_fabricant.prix_achat
        devise = self.produit_fabricant.devise.upper()

        if devise == 'USD':
            try:
                taux = TauxChange.objects.latest('date').taux
                prix = Decimal(prix) * Decimal(taux)
            except TauxChange.DoesNotExist:
                raise ValueError("Aucun taux de change défini pour convertir le prix.")

        self.prix_achat = Decimal(prix).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        super().save(*args, **kwargs)

class ReceptionProduit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    commande = models.ForeignKey(CommandeProduit, on_delete=models.CASCADE, related_name='receptions')
    date_reception = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Réception pour {self.commande.id} le {self.date_reception}"
class ReceptionLigne(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reception = models.ForeignKey(ReceptionProduit, on_delete=models.CASCADE, related_name='lignes')
    ligne_commande = models.ForeignKey(CommandeProduitLigne, on_delete=models.CASCADE)
    quantite_recue = models.PositiveIntegerField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ligne_commande.produit_fabricant.nom} reçu : {self.quantite_recue}"

from django.core.validators import RegexValidator
class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacie = models.ForeignKey(
        Pharmacie, 
        on_delete=models.CASCADE,
        related_name='clients'
    )
    nom_complet = models.CharField(max_length=255)
    telephone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^[0-9]{8,15}$',
                message="Format: 8-15 chiffres sans espaces/caractères"
            )
        ]
    )
    score_fidelite = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    dernier_achat = models.DateTimeField(null=True, blank=True)  # Nouveau champ
    updated_at = models.DateTimeField(auto_now=True)
    total_depense = models.DecimalField(  # Nouveau champ
        max_digits=10, 
        decimal_places=2, 
        default=0
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['pharmacie', 'telephone'],
                name='unique_phone_per_pharmacy'
            )
        ]
    
    def update_stats(self):
        """Met à jour les statistiques du client"""
        ventes = self.ventes.all()
        total = sum(v.montant_total for v in ventes)
        derniere_vente = ventes.order_by('-date_vente').first()
        
        self.total_depense = total
        self.dernier_achat = derniere_vente.date_vente if derniere_vente else None
        self.save(update_fields=['total_depense', 'dernier_achat'])

from django.db import models
from django.core.validators import MinValueValidator

class VenteProduit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE, related_name='ventes')
    date_vente = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    client = models.ForeignKey(  # Nouveau champ
        Client, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='ventes'
    )
    montant_total = models.DecimalField(  # Nouveau champ pour stocker le total
        max_digits=10, 
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    def __str__(self):
        return f"Vente #{self.id} - {self.date_vente.strftime('%d/%m/%Y')}"
    
    def update_montant_total(self):
        """Met à jour le montant total de la vente"""
        total = sum(ligne.montant for ligne in self.lignes.all())
        self.montant_total = total
        self.save(update_fields=['montant_total'])

class VenteLigne(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vente = models.ForeignKey(VenteProduit, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey(ProduitPharmacie, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.produit.nom_medicament} x {self.quantite}"

######################### ENREGISTREMENT CLIENT ET TOUT CE QUI LUI CONCERNE##################
from django.db import models
from django.contrib.auth.models import User

class ClientPurchase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    produit = models.ForeignKey(ProduitPharmacie, on_delete=models.CASCADE)
    quantite = models.PositiveIntegerField()
    date_achat = models.DateTimeField(auto_now_add=True)
    points_gagnes = models.PositiveIntegerField()
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Calcul automatique des points (exemple : 1 point par euro dépensé)
        self.points_gagnes = self.produit.prix_vente * self.quantite
        self.client.score_fidelite += self.points_gagnes
        self.client.save()
        super().save(*args, **kwargs)

class MedicalExam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    tension_arterielle = models.CharField(max_length=10, blank=True, null=True)
    examen_malaria = models.BooleanField(default=False)
    date_exam = models.DateTimeField(auto_now_add=True)
    remarques = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

class Prescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    medicament = models.ForeignKey(ProduitPharmacie, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=50)
    date_prescription = models.DateTimeField(auto_now_add=True)
    duree_traitement = models.CharField(max_length=50)
    updated_at = models.DateTimeField(auto_now=True)

class Requisition(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    produit_fabricant = models.ForeignKey(ProduitFabricant, on_delete=models.SET_NULL, null=True, blank=True)
    nom_personnalise = models.CharField(max_length=100, blank=True)
    nombre_demandes = models.PositiveIntegerField(default=1)
    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE)
    date_ajout = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom_personnalise or str(self.produit_fabricant)

from django.db import models
from django.utils import timezone
from datetime import time, date


class RendezVous(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUT_CHOICES = [
        ('à venir', 'à venir'),
        ('passé', 'passé'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    pharmacie = models.ForeignKey(Pharmacie, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)  # aujourd'hui par défaut
    heure = models.TimeField(default=time(9, 0))  # 09:00 par défaut
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='à venir')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.client} - {self.date} à {self.heure} ({self.statut})"

######### PUBLICITE DE MEDICAMENT ###################
# models.py
class PublicitePharmacie(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image = models.ImageField(upload_to='publicites/')
    description = models.TextField()
    date_debut = models.DateField()
    date_fin = models.DateField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Publicité ({self.date_debut} → {self.date_fin})"
    
    class Meta:
        ordering = ['-date_debut']


import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
 # à adapter selon ton projet

class Depense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    pharmacie = models.ForeignKey(
        Pharmacie, 
        on_delete=models.CASCADE, 
        related_name='depenses'
    )

    CATEGORIES = [
        ('transport', 'Transport'),
        ('nourriture', 'Nourriture'),
        ('achat_materiel', 'Achat de matériel'),
        ('salaire', 'Salaire'),
        ('loyer', 'Loyer'),
        ('autre', 'Autre'),
    ]
    categorie = models.CharField(max_length=50, choices=CATEGORIES, db_index=True)

    description = models.TextField(blank=True, null=True)

    montant = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    METHODE_PAIEMENT = [
        ('cash', 'Cash'),
    ]
    methode_paiement = models.CharField(
        max_length=50, 
        choices=METHODE_PAIEMENT, 
        default='cash'
    )

    date_depense = models.DateField(auto_now_add=True, db_index=True)

    cree_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_categorie_display()} - {self.montant} ({self.pharmacie.nom_pharm})"

    class Meta:
        ordering = ['-date_depense']
        verbose_name = "Dépense"
        verbose_name_plural = "Dépenses"
