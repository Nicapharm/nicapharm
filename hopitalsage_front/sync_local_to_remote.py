import os
import sys
from django.utils import timezone
from django.db import connections
from django.db.utils import IntegrityError

# Config Django
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DJANGO_BASE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
sys.path.append(DJANGO_BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gestion_pharmacie.settings")
import django
django.setup()

from comptes.models import Pharmacie, User
from pharmacie.models import (
    ProduitPharmacie, LotProduitPharmacie,
    CommandeProduit, CommandeProduitLigne, ReceptionProduit, ReceptionLigne,
    Client, VenteProduit, VenteLigne,
    ClientPurchase, MedicalExam, Prescription, Requisition,
    RendezVous
)

REMOTE = connections['remote']

MODELS_GLOBAL = [
    Pharmacie,
    User,
    
    
   
]

MODELS_PAR_PHARMACIE = [
    ProduitPharmacie,
    CommandeProduit,
    CommandeProduitLigne,
    ReceptionProduit,
    ReceptionLigne,
    LotProduitPharmacie,
    VenteProduit, 
    VenteLigne,
    Requisition,    
]


def get_current_pharmacie():
    return Pharmacie.objects.using('default').first()

def sync_model_to_remote(model, filter_kwargs=None):
    qs = model.objects.using('default')

    # Vérifier si on peut filtrer parv "pharmacie"
    if filter_kwargs and 'pharmacie' in filter_kwargs:
        if 'pharmacie' in [field.name for field in model._meta.get_fields()]:
            qs = qs.filter(**filter_kwargs)
        else:
            print(f"⚠️ Le modèle {model.__name__} n'a pas de champ 'pharmacie'. Filtrage ignoré.")

    print(f"\n🔄 {model.__name__} local ➜ Render...")

    for local_obj in qs.iterator():
        try:
            remote_obj = model.objects.using('remote').get(pk=local_obj.pk)
        except model.DoesNotExist:
            remote_obj = None

        if not remote_obj:
            print(f"➕ {model.__name__} (id={local_obj.pk}) ➜ Render")
            try:
                local_obj.save(using='remote')
            except IntegrityError as e:
                print(f"⚠️ IntegrityError: {e}")
        else:
            if hasattr(local_obj, 'updated_at') and hasattr(remote_obj, 'updated_at'):
                if local_obj.updated_at > remote_obj.updated_at:
                    print(f"📝 Update {model.__name__} (id={local_obj.pk}) ➜ Render")
                    local_obj.save(using='remote')

def run():
    print("\n🚀 Sync LOCAL ➜ Render")

    pharmacie = get_current_pharmacie()
    if not pharmacie:
        print("❌ Aucune pharmacie locale trouvée.")
        return

    for model in MODELS_GLOBAL:
        sync_model_to_remote(model)

    for model in MODELS_PAR_PHARMACIE:
        sync_model_to_remote(model, {'pharmacie': pharmacie})

    print("\n✅ Synchronisation locale ➜ Render terminée.")

if __name__ == "__main__":
    run()
