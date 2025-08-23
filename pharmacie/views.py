from rest_framework import viewsets
from .models import Fabricant, ProduitFabricant,TauxChange
from .serializers import FabricantSerializer,ProduitFabricant, FabricantDetailSerializer,FabricantDashboardSerializer,ProduitFabricantSerializer, TauxChangeSerializer
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count
from rest_framework import viewsets, filters
from django.db.models import Count
from .models import Fabricant
from .serializers import FabricantDashboardSerializer, FabricantDetailSerializer
from comptes.pagination import StandardResultsSetPagination

class FabricantViewSet(viewsets.ModelViewSet):
    queryset = Fabricant.objects.all()
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom', 'produits__nom']

    def get_queryset(self):
        if self.action == 'list':
            return Fabricant.objects.annotate(nombre_produits=Count('produits'))
        return super().get_queryset()

    def get_serializer_class(self):
        if self.action == 'list':
            return FabricantDashboardSerializer
        return FabricantDetailSerializer

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import ProduitFabricant
from .serializers import ProduitFabricantSerializer

from rest_framework.pagination import PageNumberPagination

# backend/monapp/views.py

from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from .models import ProduitFabricant
from .serializers import ProduitFabricantSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200

class ProduitFabricantViewSet(viewsets.ModelViewSet):
    queryset = ProduitFabricant.objects.all()
    serializer_class = ProduitFabricantSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom', 'fabricant__nom']  # ✅ Utilise les champs indexés

    def perform_create(self, serializer):
        serializer.save()

class TauxChangeViewSet(viewsets.ModelViewSet):
    queryset = TauxChange.objects.all().order_by('-date')  # Le plus récent en haut
    serializer_class = TauxChangeSerializer
    permission_classes = [IsAuthenticated]

#################Enregistrement des nouvelle medicament##############
from rest_framework import viewsets, permissions
from .models import ProduitPharmacie
from .serializers import ProduitPharmacieSerializer

class ProduitPharmacieViewSet(viewsets.ModelViewSet):
    serializer_class = ProduitPharmacieSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtrer par pharmacie de l'utilisateur connecté
        return ProduitPharmacie.objects.filter(pharmacie=self.request.user.pharmacie)

    def perform_create(self, serializer):
        serializer.save(pharmacie=self.request.user.pharmacie)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ProduitFabricant
from .serializers import ProduitFabricantSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def produits_par_fabricant(request):
    fabricant_id = request.GET.get('fabricant')
    if fabricant_id:
        produits = ProduitFabricant.objects.filter(fabricant_id=fabricant_id)
        serializer = ProduitFabricantSerializer(produits, many=True)
        return Response(serializer.data)
    return Response({"error": "ID fabricant requis"}, status=400)

############## Commande des medicaments chez les fournisseurs ###############################
from rest_framework import viewsets
from .models import CommandeProduit
from .serializers import CommandeProduitSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import CommandeProduitSerializer
  
import logging
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

class CommandeProduitViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = CommandeProduit.objects.all()
    serializer_class = CommandeProduitSerializer

    def perform_create(self, serializer):
        try:
            serializer.save()
        except Exception as e:
            logger.exception("❌ Erreur lors de la création de la commande : %s", str(e))
            raise


from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ProduitFabricant
from .serializers import ProduitsFabricantSerializer

class ProduitsDuFabricantView(APIView):
    def get(self, request, pk):
        produits = ProduitFabricant.objects.filter(fabricant_id=pk)
        serializer = ProduitsFabricantSerializer(produits, many=True)
        return Response(serializer.data)

###################"Recption de Medicamennt du commande"####################""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import ReceptionProduitSerializer, CommandeProduitDetailSerializer
from .models import CommandeProduit

# views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import ReceptionProduitSerializer

class ConfirmerReceptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Données reçues dans la vue :", request.data)
        serializer = ReceptionProduitSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            commande = serializer.validated_data['commande']
            commande.etat = 'confirmee'
            commande.save()

            serializer.save(utilisateur=request.user)
            return Response({"message": "Réception confirmée avec succès."}, status=201)
        return Response(serializer.errors, status=400)


from rest_framework.generics import RetrieveAPIView
from .models import CommandeProduit
from .serializers import CommandeProduitDetailSerializer

class CommandeDetailView(RetrieveAPIView):
    queryset = CommandeProduit.objects.all()
    serializer_class = CommandeProduitDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
   
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend

class CommandeProduitListView(generics.ListAPIView):
    queryset = CommandeProduit.objects.filter(etat='en_attente').prefetch_related('lignes__produit_fabricant__fabricant').select_related('fabricant')
    serializer_class = CommandeProduitDetailSerializer
    permission_classes = [IsAuthenticated]
  
############################vente produit###########################
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import VenteProduit, ProduitPharmacie
from rest_framework import viewsets, generics, serializers
from rest_framework.permissions import IsAuthenticated
from .models import VenteProduit, Client
from .serializers import VenteProduitSerializer
from comptes.models import Pharmacie
from .serializers import (
    VenteProduitSerializer,
    ProduitsPharmacieSerializer,
    PharmacieSerializer
)
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status

class VenteProduitViewSet(viewsets.ModelViewSet):
    serializer_class = VenteProduitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VenteProduit.objects.filter(
            pharmacie=self.request.user.pharmacie
        )

    def perform_create(self, serializer):
        client_id = self.request.data.get('client')
        client = None

        if client_id:
            try:
                client = Client.objects.get(
                    id=client_id,
                    pharmacie=self.request.user.pharmacie
                )
            except Client.DoesNotExist:
                raise serializers.ValidationError("Client introuvable ou n'appartient pas à cette pharmacie.")

        serializer.save(
            utilisateur=self.request.user,
            client=client
        )

class VenteCreateAPIView(generics.CreateAPIView):
    queryset = VenteProduit.objects.all()
    serializer_class = VenteProduitSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        client_id = self.request.data.get('client')
        client = None

        if client_id:
            try:
                client = Client.objects.get(
                    id=client_id,
                    pharmacie=self.request.user.pharmacie
                )
            except Client.DoesNotExist:
                raise serializers.ValidationError("Client introuvable ou n'appartient pas à cette pharmacie.")

        serializer.save(
            utilisateur=self.request.user,
            client=client
        )

################# Historique de la vente #######################
# views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from .models import VenteProduit
from .serializers import HistoriqueVenteSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from .serializers import HistoriqueVenteSerializer, HistoriqueDepenseSerializer

# views.py
class HistoriqueVentesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pharmacie = request.user.pharmacie
        date_debut = request.GET.get('date_debut')
        date_fin = request.GET.get('date_fin')

        # DEBUG : pour voir le type de champ
        # print("Champ date_vente:", VenteProduit._meta.get_field('date_vente'))

        # --- VENTES ---
        ventes = VenteProduit.objects.filter(pharmacie=pharmacie)

        if date_debut:
            try:
                parsed_date = parse_date(date_debut)
                # ✅ Supposons que date_vente est DateTimeField → utilise __date
                ventes = ventes.filter(date_vente__date__gte=parsed_date)
            except:
                pass

        if date_fin:
            try:
                parsed_date = parse_date(date_fin)
                ventes = ventes.filter(date_vente__date__lte=parsed_date)
            except:
                pass

        ventes = ventes.order_by('-date_vente')

        # --- DÉPENSES ---
        depenses = Depense.objects.filter(pharmacie=pharmacie)

        if date_debut:
            parsed_date = parse_date(date_debut)
            # ✅ date_depense est DateField → pas de __date
            depenses = depenses.filter(date_depense__gte=parsed_date)

        if date_fin:
            parsed_date = parse_date(date_fin)
            depenses = depenses.filter(date_depense__lte=parsed_date)

        depenses = depenses.order_by('-date_depense')

        # Sérialisation
        ventes_serialized = HistoriqueVenteSerializer(ventes, many=True).data
        depenses_serialized = HistoriqueDepenseSerializer(depenses, many=True).data

        return Response({
            "ventes": ventes_serialized,
            "depenses": depenses_serialized,
        })

##################" Statistique Vente #################"
class ProduitPharmacieListAPIView(generics.ListAPIView):
    serializer_class = ProduitsPharmacieSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        pharmacie_id = self.request.query_params.get('pharmacie')
        return ProduitPharmacie.objects.filter(pharmacie_id=pharmacie_id)

class PharmacieUserListAPIView(generics.ListAPIView):
    serializer_class = PharmacieSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Pharmacie.objects.filter(user=self.request.user)
#########################" CLIENT ET TOUT C QUI LUI CONCERNE"################################
from rest_framework import viewsets, permissions
from .models import Client, MedicalExam
from .serializers import ClientSerializer, MedicalExamSerializer,ClientAfficherSerializer
from rest_framework import viewsets
from .models import Client
from .serializers import ClientSerializer
from rest_framework.permissions import IsAuthenticated

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            pharmacie=self.request.user.pharmacie,
            score_fidelite=0
        )
    
    def get_queryset(self):
        # Filtrer par pharmacie de l'utilisateur
        return super().get_queryset().filter(
            pharmacie=self.request.user.pharmacie
        )
    
from django.shortcuts import get_object_or_404
class MedicalExamViewSet(viewsets.ModelViewSet):
    queryset = MedicalExam.objects.all()
    serializer_class = MedicalExamSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Récupère le client avec gestion automatique des erreurs 404
        client_id = self.request.data.get('client')
        client = get_object_or_404(Client, id=client_id)  # Utilisation correcte
        
        serializer.save(
            client=client,
            created_by=self.request.user
        )

################ Cient Afficher et gerer même le medicamen, prescription et autres############

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework.permissions import IsAuthenticated
from .models import Client, MedicalExam
from .serializers import MedicalExamSerializer
from rest_framework import status


class CreateMedicalExamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            client = Client.objects.get(pk=pk, pharmacie=request.user.pharmacie)
        except Client.DoesNotExist:
            return Response({"error": "Client non trouvé ou non autorisé"}, status=status.HTTP_400_BAD_REQUEST)

        # Conversion explicite des données reçues
        data = request.data.copy()
        
        # Assure-toi que 'examen_malaria' est bien un booléen
        if 'examen_malaria' in data:
            if isinstance(data['examen_malaria'], str):
                # Convertir les chaînes comme "true"/"True"/"1" en booléen
                data['examen_malaria'] = data['examen_malaria'].lower() in ['true', '1']
            else:
                # Si c'est envoyé via JSON, ce sera souvent 0/1 ou true/false
                data['examen_malaria'] = bool(data['examen_malaria'])

        serializer = MedicalExamSerializer(data=data)

        if serializer.is_valid():
            exam = serializer.save(client=client)
            return Response(MedicalExamSerializer(exam).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework.permissions import IsAuthenticated
from .models import Client, ProduitPharmacie, Prescription
from .serializers import PrescriptionSerializer

class CreatePrescriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            client = Client.objects.get(pk=pk, pharmacie=request.user.pharmacie)
        except Client.DoesNotExist:
            return Response({"error": "Client non trouvé"}, status=400)

        data = request.data.copy()
        data['client'] = client.id  # Pour validation du serializer si nécessaire

        serializer = PrescriptionSerializer(data=data)
        if serializer.is_valid():
            prescription = serializer.save(client=client)
            return Response(serializer.data, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Client, MedicalExam, Prescription
from .serializers import MedicalExamSerializer, PrescriptionsSerializer

class DossierMedicalClientView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            client = Client.objects.get(pk=pk, pharmacie=request.user.pharmacie)
            exams = MedicalExam.objects.filter(client=client)
            prescriptions = Prescription.objects.filter(client=client)

            return Response({
                "client": {
                    "id": client.id,
                    "nom_complet": client.nom_complet,
                    "telephone": client.telephone,
                    "created_at": client.created_at
                },
                "examens": MedicalExamSerializer(exams, many=True).data,
                "prescriptions": PrescriptionsSerializer(prescriptions, many=True).data
            }, status=200)
        except Client.DoesNotExist:
            return Response({"error": "Client non trouvé"}, status=404)

######################Contenu alerte stock rupture ########################
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ProduitPharmacie
from .serializers import ProduitAlertPharmacieSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import ProduitPharmacie
from django.db.models import F

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def produits_en_alerte(request):
    # On récupère la pharmacie de l'utilisateur connecté
    user = request.user
    if not hasattr(user, 'pharmacie'):
        return Response({"detail": "Utilisateur sans pharmacie liée."}, status=403)

    # On filtre les produits de SA pharmacie uniquement
    produits = ProduitPharmacie.objects.filter(
        pharmacie=user.pharmacie,
        quantite__lte=F('alerte_quantite')
    )

    result = []
    for p in produits:
        niveau = 'danger' if p.quantite <= p.alerte_quantite / 2 else 'warning'
        result.append({
            'id': p.id,
            'nom_medicament': p.nom_medicament,
            'quantite': p.quantite,
            'alerte_quantite': p.alerte_quantite,
            'niveau_alerte': niveau
        })

    return Response(result)

# pharmacie/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ProduitPharmacie,Requisition
from .serializers import ProduitAlerteSerializer,RequisitionSerializer

###################### Affiche sur ecran acceuil directeur###################

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from datetime import date
from django.db.models import Sum, F
from .models import VenteProduit, VenteLigne

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def statistiques_du_jour(request):
    user = request.user
    pharmacie = user.pharmacie  # ou lié via profil

    today = date.today()

    ventes_du_jour = VenteProduit.objects.filter(
        pharmacie=pharmacie,
        date_vente__date=today
    )

    total_ventes = ventes_du_jour.aggregate(total=Sum('montant_total'))['total'] or 0

    lignes_du_jour = VenteLigne.objects.filter(
        vente__in=ventes_du_jour
    )

    chiffre_affaire = lignes_du_jour.aggregate(total=Sum('total'))['total'] or 0

    # Bénéfice = (Prix_vente - Prix_achat) * quantite
    lignes = lignes_du_jour.annotate(
        benefice_unitaire=(F('prix_unitaire') - F('produit__prix_achat')) * F('quantite')
    )
    benefice = lignes.aggregate(total=Sum('benefice_unitaire'))['total'] or 0

    # Produit le plus vendu
    produit_plus_vendu = (
        lignes_du_jour.values('produit__nom_medicament')
        .annotate(qte=Sum('quantite'))
        .order_by('-qte')
        .first()
    )

    return Response({
        "chiffre_affaire": chiffre_affaire,
        "benefice": benefice,
        "total_ventes": total_ventes,
        "produit_plus_vendu": produit_plus_vendu['produit__nom_medicament'] if produit_plus_vendu else "Aucun"
    })


################## Rapport Générale ######################################"
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from datetime import date, timedelta
from django.db.models import Sum, F
from .models import VenteProduit, VenteLigne

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rapport_general(request):
    user = request.user
    pharmacie = user.pharmacie  # Assurez-vous que l'utilisateur est lié à une pharmacie

    periode = request.GET.get('periode', 'jour')
    today = date.today()

    if periode == 'jour':
        date_debut = today
    elif periode == 'semaine':
        date_debut = today - timedelta(days=today.weekday())
    elif periode == 'mois':
        date_debut = today.replace(day=1)
    else:
        return Response({'error': 'Période invalide'}, status=400)

    ventes = VenteProduit.objects.filter(
        pharmacie=pharmacie,
        date_vente__date__gte=date_debut,
        date_vente__date__lte=today
    )

    total_ventes = ventes.aggregate(total=Sum('montant_total'))['total'] or 0

    lignes = VenteLigne.objects.filter(vente__in=ventes)

    chiffre_affaire = lignes.aggregate(total=Sum('total'))['total'] or 0

    lignes = lignes.annotate(
        benefice_unitaire=(F('prix_unitaire') - F('produit__prix_achat')) * F('quantite')
    )
    benefice = lignes.aggregate(total=Sum('benefice_unitaire'))['total'] or 0

    produit_plus_vendu = (
        lignes.values('produit__nom_medicament')
        .annotate(qte=Sum('quantite'))
        .order_by('-qte')
        .first()
    )

    return Response({
        "periode": periode,
        "date_debut": date_debut,
        "date_fin": today,
        "chiffre_affaire": chiffre_affaire,
        "benefice": benefice,
        "total_ventes": total_ventes,
        "produit_plus_vendu": produit_plus_vendu['produit__nom_medicament'] if produit_plus_vendu else "Aucun"
    })

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Requisition
from .serializers import RequisitionSerializer, ClientRendezvousSerializer
from rest_framework import viewsets
from .models import Requisition
from .serializers import RequisitionSerializer
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Requisition, Pharmacie
from .serializers import RequisitionSerializer

class RequisitionViewSet(viewsets.ModelViewSet):
    serializer_class = RequisitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "pharmacie") and user.pharmacie:
            return Requisition.objects.filter(pharmacie=user.pharmacie)
        return Requisition.objects.none()

    def create(self, request, *args, **kwargs):
        user = request.user

        if not hasattr(user, "pharmacie") or not user.pharmacie:
            return Response(
                {"detail": "Utilisateur non lié à une pharmacie."},
                status=status.HTTP_400_BAD_REQUEST
            )

        pharmacie = user.pharmacie.id
        produit_fabricant = request.data.get('produit_fabricant')
        nom_personnalise = request.data.get('nom_personnalise')

        try:
            if produit_fabricant:
                obj, created = Requisition.objects.get_or_create(
                    pharmacie_id=pharmacie,
                    produit_fabricant_id=produit_fabricant,
                    defaults={"nombre_demandes": 1}
                )
                if not created:
                    obj.nombre_demandes += 1
                    obj.save()

                serializer = self.get_serializer(obj)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            elif nom_personnalise:
                obj, created = Requisition.objects.get_or_create(
                    pharmacie_id=pharmacie,
                    nom_personnalise=nom_personnalise,
                    defaults={"nombre_demandes": 1}
                )
                if not created:
                    obj.nombre_demandes += 1
                    obj.save()

                serializer = self.get_serializer(obj)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(
                {"detail": "Aucun produit ou nom personnalisé fourni."},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"detail": f"Erreur interne : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Requisition

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def incrementer_demande(request, pk):
    try:
        requisition = Requisition.objects.get(pk=pk)
        requisition.nombre_demandes += 1
        requisition.save()
        return Response({'message': 'Nombre de demandes incrémenté.'})
    except Requisition.DoesNotExist:
        return Response({'error': 'Requisition introuvable.'}, status=status.HTTP_404_NOT_FOUND)


####################### Historique Commande Reception produit chez le fournisseur ###########""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CommandeProduit
from .serializers import MouvementCommandeSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historique_mouvements(request):
    pharmacie = request.user.pharmacie
    commandes = CommandeProduit.objects.filter(pharmacie=pharmacie).order_by('-date_commande')
    serializer = MouvementCommandeSerializer(commandes, many=True)
    return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from comptes.serializers import UserSerializer

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Requisition

@api_view(['DELETE'])
def reset_requisitions(request):
    pharmacie_id = request.GET.get('pharmacie')
    if not pharmacie_id:
        return Response({"detail": "Pharmacie non spécifiée."}, status=status.HTTP_400_BAD_REQUEST)
    
    Requisition.objects.filter(pharmacie_id=pharmacie_id).delete()
    return Response({"detail": "Réquisitions supprimées."}, status=status.HTTP_204_NO_CONTENT)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Requisition

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_all_requisitions(request):
    pharmacie_id = request.query_params.get('pharmacie')
    if not pharmacie_id:
        return Response({"detail": "ID de la pharmacie requis."}, status=status.HTTP_400_BAD_REQUEST)

    requisitions = Requisition.objects.filter(pharmacie_id=pharmacie_id)
    count = requisitions.count()
    requisitions.delete()
    return Response({"detail": f"{count} réquisition(s) supprimée(s)."}, status=status.HTTP_200_OK)

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from .models import VenteProduit

@permission_classes([IsAuthenticated])
@api_view(['GET'])
def historique_ventes(request):
    utilisateur_id = request.GET.get('utilisateur')

    if not utilisateur_id:
        return Response({"error": "Utilisateur ID manquant."}, status=400)

    ventes = VenteProduit.objects.filter(utilisateur_id=utilisateur_id)

    par_jour = ventes.annotate(jour=TruncDay('date_vente')).values('jour').annotate(
        total=Sum('montant_total'), nb=Count('id')
    ).order_by('-jour')

    par_semaine = ventes.annotate(semaine=TruncWeek('date_vente')).values('semaine').annotate(
        total=Sum('montant_total'), nb=Count('id')
    ).order_by('-semaine')

    par_mois = ventes.annotate(mois=TruncMonth('date_vente')).values('mois').annotate(
        total=Sum('montant_total'), nb=Count('id')
    ).order_by('-mois')

    details = [
        {
            "id": v.id,
            "date": v.date_vente,
            "montant_total": v.montant_total,
            "client": v.client.nom_client if v.client else "N/A",
            "lignes": [
                {
                    "produit": l.produit.nom_medicament,
                    "quantite": l.quantite,
                    "total": l.total
                }
                for l in v.lignes.all()
            ]
        }
        for v in ventes.select_related('client').prefetch_related('lignes__produit')
    ]

    return Response({
        "par_jour": list(par_jour),
        "par_semaine": list(par_semaine),
        "par_mois": list(par_mois),
        "details": details
    })

##################### Exporter les données Via une clef usb##########################
import json
import os
from .models import Fabricant, ProduitFabricant, ClientPurchase,ProduitPharmacie, ReceptionLigne,ReceptionProduit,CommandeProduitLigne,CommandeProduit, VenteProduit, Client
from django.http import JsonResponse, FileResponse
from django.core.serializers import serialize
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from tempfile import NamedTemporaryFile
import os
import subprocess
from datetime import datetime
from django.http import FileResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sauvegarde_sql(request):
    # Récupération des infos depuis settings.py
    db_settings = settings.DATABASES['default']
    db_name = db_settings['NAME']
    db_user = db_settings['USER']
    db_host = db_settings.get('HOST', 'localhost')
    db_port = db_settings.get('PORT', '5432')

    # Nom temporaire du fichier
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"backup_{timestamp}.sql"
    filepath = os.path.join('/tmp', filename)

    try:
        # Générer la commande pg_dump
        command = [
            'pg_dump',
            '-h', db_host,
            '-p', db_port,
            '-U', db_user,
            '-f', filepath,
            db_name
        ]

        # Lancer pg_dump avec mot de passe par variable d'environnement
        env = os.environ.copy()
        env["PGPASSWORD"] = db_settings['PASSWORD']

        subprocess.run(command, env=env, check=True)

        # Retourner le fichier en téléchargement
        response = FileResponse(open(filepath, 'rb'), as_attachment=True)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    except Exception as e:
        return JsonResponse({'erreur': str(e)}, status=500)

import os
import shutil
import platform
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import StreamingHttpResponse
import time

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def copier_vers_usb(request):
    dump_dir = "/tmp"
    backup_files = [f for f in os.listdir(dump_dir) if f.startswith("backup_") and f.endswith(".sql")]

    if not backup_files:
        return JsonResponse({'error': 'Aucun fichier de sauvegarde trouvé'}, status=404)

    backup_files.sort(reverse=True)
    latest_backup = backup_files[0]
    sql_path = os.path.join(dump_dir, latest_backup)

    usb_found = None

    system = platform.system()

    if system == "Linux":
        usb_base_paths = ["/media", "/mnt"]
        for base_path in usb_base_paths:
            if not os.path.exists(base_path):
                continue
            for user_folder in os.listdir(base_path):
                full_path = os.path.join(base_path, user_folder)
                if os.path.isdir(full_path):
                    for device in os.listdir(full_path):
                        usb_path = os.path.join(full_path, device)
                        if os.path.ismount(usb_path):
                            usb_found = usb_path
                            break
                    if usb_found:
                        break
            if usb_found:
                break

    elif system == "Windows":
        # Cherche les lecteurs amovibles (USB) dans les lettres D: à Z:
        from ctypes import windll

        DRIVE_REMOVABLE = 2
        bitmask = windll.kernel32.GetLogicalDrives()
        for letter in range(2, 26):  # D-Z
            if bitmask & (1 << letter):
                drive_letter = f"{chr(65 + letter)}:\\"
                if os.path.exists(drive_letter):
                    drive_type = windll.kernel32.GetDriveTypeW(drive_letter)
                    if drive_type == DRIVE_REMOVABLE:
                        usb_found = drive_letter
                        break

    if not usb_found:
        return JsonResponse({'error': 'Clé USB non trouvée. Assurez-vous qu’elle est branchée et montée.'}, status=404)

    try:
        shutil.copy(sql_path, os.path.join(usb_found, latest_backup))
        return JsonResponse({'message': f'Fichier copié avec succès vers {usb_found}'})
    except Exception as e:
        return JsonResponse({'error': f'Échec de la copie : {str(e)}'}, status=500)

####################### Modifier les prix par fabicant########################
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ProduitFabricant
from .serializers import ProduitListeModifierFabricantSerializer
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def produits_par_fabricants(request, fabricant_id):
    produits = ProduitFabricant.objects.filter(fabricant_id=fabricant_id)
    
    paginator = StandardResultsSetPagination()
    result_page = paginator.paginate_queryset(produits, request)

    serializer = ProduitListeModifierFabricantSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ProduitFabricant

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def modifier_prix_produit(request, produit_id):
    try:
        produit = ProduitFabricant.objects.get(id=produit_id)
    except ProduitFabricant.DoesNotExist:
        return Response({'success': False, 'error': 'Produit non trouvé'}, status=404)

    data = request.data

    # Nom
    nouveau_nom = data.get('nom')
    if nouveau_nom is not None:
        if not nouveau_nom.strip():
            return Response({'success': False, 'error': 'Le nom ne peut pas être vide'}, status=400)
        produit.nom = nouveau_nom.strip()

    # Prix
    nouveau_prix = data.get('prix_achat')
    if nouveau_prix is not None:
        try:
            produit.prix_achat = float(nouveau_prix)
        except ValueError:
            return Response({'success': False, 'error': 'prix_achat invalide'}, status=400)

    # Plaquettes
    plaquettes = data.get('nombre_plaquettes_par_boite')
    if plaquettes is not None:
        try:
            produit.nombre_plaquettes_par_boite = int(plaquettes)
        except ValueError:
            return Response({'success': False, 'error': 'nombre_plaquettes_par_boite doit être un entier'}, status=400)

    produit.save()

    return Response({
        'success': True,
        'message': 'Produit mis à jour',
        'data': {
            'nom': produit.nom,
            'prix_achat': produit.prix_achat,
            'nombre_plaquettes_par_boite': produit.nombre_plaquettes_par_boite,
        }
    })

# views.py
from rest_framework import viewsets
from .models import RendezVous
from .serializers import RendezVousSerializer

class RendezVousViewSet(viewsets.ModelViewSet):
    queryset = RendezVous.objects.all()
    serializer_class = RendezVousSerializer
    permission_classes = [IsAuthenticated]

class RendezVousListCreateView(generics.ListCreateAPIView):
    queryset = RendezVous.objects.all()
    serializer_class = RendezVousSerializer

class RendezVousByClientView(generics.ListAPIView):
    serializer_class = RendezVousSerializer
    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return RendezVous.objects.filter(client__id=client_id)
    
###############################
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Client, RendezVous
from .serializers import ClientSerializer
from datetime import date

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def clients_avec_rendezvous(request):
    pharmacie = request.user.pharmacie  # suppose que le user est lié à une pharmacie
    clients = Client.objects.filter(pharmacie=pharmacie)

    results = []
    for client in clients:
        prochain_rdv = RendezVous.objects.filter(client=client, statut='à venir', date__gte=date.today()).order_by('date').first()
        if prochain_rdv:
            results.append({
                'id': client.id,
                'nom_complet': client.nom_complet,
                'telephone': client.telephone,
                'rendez_vous': prochain_rdv.date,
            })

    return Response(results)

###################### gestion de lot de medicament########################
from rest_framework import viewsets
from .models import LotProduitPharmacie
from .serializers import LotProduitPharmacieSerializer
from datetime import datetime
from datetime import datetime
from rest_framework import viewsets
from .models import LotProduitPharmacie
from .serializers import LotProduitPharmacieSerializer
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .models import LotProduitPharmacie
from .serializers import LotProduitPharmacieSerializer
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from datetime import datetime
from .models import LotProduitPharmacie
from .serializers import LotProduitPharmacieSerializer

from datetime import datetime

class LotProduitPharmacieViewSet(viewsets.ModelViewSet):
    queryset = LotProduitPharmacie.objects.all()
    serializer_class = LotProduitPharmacieSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = LotProduitPharmacie.objects.all()

        # ✅ Récupération de la pharmacie (priorité à user.pharmacie, sinon query param)
        pharmacie = getattr(user, 'pharmacie', None)
        if pharmacie is None:
            pharmacie_id = self.request.query_params.get('pharmacie')
            if pharmacie_id:
                queryset = queryset.filter(produit__pharmacie_id=pharmacie_id)
            else:
                return LotProduitPharmacie.objects.none()
        else:
            queryset = queryset.filter(produit__pharmacie=pharmacie)

        # 🔍 Filtres supplémentaires
        produit_id = self.request.query_params.get('produit')
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        date_max = self.request.query_params.get('date_max')

        if produit_id:
            queryset = queryset.filter(produit_id=produit_id)

        if date_debut:
            try:
                date_debut_obj = datetime.strptime(date_debut, '%Y-%m-%d').date()
                queryset = queryset.filter(date_entree__gte=date_debut_obj)
            except ValueError:
                pass

        if date_fin:
            try:
                date_fin_obj = datetime.strptime(date_fin, '%Y-%m-%d').date()
                queryset = queryset.filter(date_entree__lte=date_fin_obj)
            except ValueError:
                pass

        if date_max:
            try:
                date_max_obj = datetime.strptime(date_max, '%Y-%m-%d').date()
                queryset = queryset.filter(date_peremption__lte=date_max_obj)
            except ValueError:
                pass

        return queryset


############"

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import LotProduitPharmacie, ProduitPharmacie  # ✅ ajoute ceci
from .serializers import LotsProduitPharmacieSerializer
import logging

logger = logging.getLogger(__name__)

from rest_framework import viewsets, permissions, status
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import LotProduitPharmacie
from .serializers import LotProduitPharmacieSerializer
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class LotsProduitPharmacieViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LotsProduitPharmacieSerializer
    queryset = LotProduitPharmacie.objects.all()

    def get_queryset(self):
        user = self.request.user
        pharmacie_id = self.request.query_params.get('pharmacie')

        if hasattr(user, 'pharmacie') and user.pharmacie:
            pharmacie = user.pharmacie.id
        elif pharmacie_id:
            pharmacie = pharmacie_id
        else:
            return LotProduitPharmacie.objects.none()

        return LotProduitPharmacie.objects.filter(produit__pharmacie=pharmacie)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # ✅ Produit lié au lot
        produit_instance = ProduitPharmacie.objects.filter(id=instance.produit.id).first()

        if produit_instance:
            # 🟢 Réduire le stock du produit global
            produit_instance.quantite = max(0, produit_instance.quantite - instance.quantite)
            produit_instance.save()

        # 🔴 Supprimer le lot
        instance.delete()

        return Response(
            {"message": "Lot supprimé et stock du produit mis à jour"},
            status=status.HTTP_204_NO_CONTENT
        )


    @action(detail=False, methods=['get'])
    def expires(self, request):
        today = timezone.now().date()
        period = request.query_params.get('period', 'week')

        if period == 'expired':
            queryset = self.get_queryset().filter(date_peremption__lt=today)
        elif period == 'week':
            end_date = today + timedelta(days=7)
            queryset = self.get_queryset().filter(date_peremption__range=[today, end_date])
        elif period == 'month':
            end_date = today + timedelta(days=30)
            queryset = self.get_queryset().filter(date_peremption__range=[today, end_date])
        elif period == 'two_months':
            end_date = today + timedelta(days=60)
            queryset = self.get_queryset().filter(date_peremption__range=[today, end_date])
        else:
            queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

############# PUBLICITE MEDICAMENT #####################
# views.py
from datetime import date
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PublicitePharmacie
from .serializers import PubliciteSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import IsAuthenticated  # facultatif mais conseillé

# Pour afficher la publicité active (GET uniquement)
class PubliciteActuelleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        aujourd_hui = date.today()
        pub = PublicitePharmacie.objects.filter(
            date_debut__lte=aujourd_hui,
            date_fin__gte=aujourd_hui
        ).order_by('-date_debut').first()

        if not pub:
            return Response({
                "image": "",
                "description": "",
                "date_debut": "",
                "date_fin": ""
            })

        serializer = PubliciteSerializer(pub, context={"request": request})
        return Response(serializer.data)


class PubliciteUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PubliciteSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Publicité enregistrée avec succès"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import DepotPharmaceutiqueSerializer
from .models import DepotPharmaceutique

class CreateDepotPharmaceutiqueView(APIView):
    def post(self, request):
        serializer = DepotPharmaceutiqueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if refresh_token is None:
            return Response({"error": "Le token refresh est requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Déconnexion réussie."}, status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            return Response({"error": f"Token invalide ou déjà blacklisté : {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


############Le Montant total de tout les produits###########
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal
from .models import ProduitPharmacie

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_total(request):
    pharmacie = request.user.pharmacie  # suppose que l'utilisateur a un champ pharmacie
    produits = ProduitPharmacie.objects.filter(pharmacie=pharmacie)

    montant_total = Decimal('0.00')
    for produit in produits:
        if produit.prix_vente:
            montant_total += produit.quantite * produit.prix_vente

    return Response({'montant_stock': round(montant_total, 2)})


from rest_framework import viewsets, permissions
from .models import Depense
from .serializers import DepenseSerializer

class DepenseViewSet(viewsets.ModelViewSet):
    serializer_class = DepenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtrer uniquement les dépenses de la pharmacie de l'utilisateur connecté
        return Depense.objects.filter(pharmacie=self.request.user.pharmacie)

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user)
