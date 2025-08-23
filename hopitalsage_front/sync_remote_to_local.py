import os
import sys
import json
from uuid import UUID
from datetime import datetime
from django.db import models
from django.core.exceptions import FieldDoesNotExist
from django.utils.timezone import now

# ============================
# CONFIGURATION DJANGO
# ============================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DJANGO_BASE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
sys.path.append(DJANGO_BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gestion_pharmacie.settings")

import django
django.setup()

from comptes.models import Pharmacie, User
from pharmacie.models import (
    TauxChange,
    Fabricant,
    ProduitFabricant,
    ProduitPharmacie,
    LotProduitPharmacie,
    CommandeProduit,
    CommandeProduitLigne,
    ReceptionProduit,
    ReceptionLigne,
    Client,
    VenteProduit,
    VenteLigne,
    ClientPurchase,
    MedicalExam,
    Prescription,
    RendezVous,
    Requisition,
    PublicitePharmacie,
    Depense
)

# ============================
# CONFIGURATION SYNCHRO
# ============================
MODELS_GLOBAL = [
    TauxChange,
    Fabricant,
    ProduitFabricant,
    Pharmacie,
    User,
    PublicitePharmacie,
]

MODELS_PAR_PHARMACIE = [
    ProduitPharmacie,
    LotProduitPharmacie,
    CommandeProduit,
    CommandeProduitLigne,
    ReceptionProduit,
    ReceptionLigne,
    Client,
    VenteProduit,
    VenteLigne,
    ClientPurchase,
    MedicalExam,
    Prescription,
    RendezVous,
    Requisition,
    Depense,
]

PHARMACIE_LOOKUP_BY_MODEL = {
    'ProduitPharmacie': 'pharmacie',
    'LotProduitPharmacie': 'produit__pharmacie',
    'CommandeProduit': 'pharmacie',
    'CommandeProduitLigne': 'commande__pharmacie',
    'ReceptionProduit': 'commande__pharmacie',
    'ReceptionLigne': 'reception__commande__pharmacie',
    'Client': 'pharmacie',
    'VenteProduit': 'pharmacie',
    'VenteLigne': 'vente__pharmacie',
    'ClientPurchase': 'client__pharmacie',
    'MedicalExam': 'client__pharmacie',
    'Prescription': 'client__pharmacie',
    'RendezVous': 'pharmacie',
    'Requisition': 'pharmacie',
    'Depense': 'pharmacie',
}

SYNC_TRACK_FILE = os.path.join(CURRENT_DIR, "last_sync.json")
CONFIG_FILE = os.path.join(CURRENT_DIR, "pharmacie_config.json")

# ============================
# UTILITAIRES
# ============================
def load_sync_times():
    if os.path.exists(SYNC_TRACK_FILE):
        with open(SYNC_TRACK_FILE, "r") as f:
            return json.load(f)
    return {}

def save_sync_times(times):
    with open(SYNC_TRACK_FILE, "w") as f:
        json.dump(times, f, indent=2, default=str)

SYNC_TIMES = load_sync_times()

def get_last_sync_time(model):
    return datetime.fromisoformat(SYNC_TIMES.get(model.__name__, "1970-01-01T00:00:00"))

def update_last_sync_time(model):
    SYNC_TIMES[model.__name__] = now().isoformat()

def get_current_pharmacie():
    if not os.path.exists(CONFIG_FILE):
        raise Exception(f"❌ {CONFIG_FILE} introuvable. Crée pharmacie_config.json avec l'ID.")

    with open(CONFIG_FILE, "r") as f:
        cfg = json.load(f)

    raw_id = cfg.get("pharmacie_id")
    if not raw_id:
        raise Exception("❌ pharmacie_id manquant dans pharmacie_config.json")

    pk_name = Pharmacie._meta.pk.name

    try:
        value = UUID(raw_id) if isinstance(raw_id, str) and "-" in raw_id else raw_id
        return Pharmacie.objects.using('default').get(**{pk_name: value})
    except Pharmacie.DoesNotExist:
        raise Exception(f"❌ Aucune pharmacie trouvée avec {pk_name}={raw_id} dans la base locale.")

def get_pharmacie_lookup(model):
    return PHARMACIE_LOOKUP_BY_MODEL.get(model.__name__)

# ============================
# GESTION DES FK
# ============================
def ensure_pharmacie_exists_remote(pharmacie, target_db):
    pk_name = Pharmacie._meta.pk.name
    defaults = {f.name: getattr(pharmacie, f.name) for f in Pharmacie._meta.fields if f.name != pk_name}
    obj, created = Pharmacie.objects.using(target_db).get_or_create(
        **{pk_name: getattr(pharmacie, pk_name)},
        defaults=defaults
    )
    if created:
        print(f"   ➕ Pharmacie créée sur {target_db}: {pharmacie.nom_pharm}")
    return obj

def ensure_user_exists_remote(user_id, target_db):
    try:
        user = User.objects.using(target_db).get(id=user_id)
        return user
    except User.DoesNotExist:
        user_source = User.objects.using('default').get(id=user_id)
        defaults = {f.name: getattr(user_source, f.name) for f in User._meta.fields if f.name != 'id'}
        user_remote = User.objects.using(target_db).create(id=user_id, **defaults)
        print(f"   ➕ Utilisateur créé sur {target_db}: {user_remote.username}")
        return user_remote

# ============================
# SYNCHRO
# ============================
def sync_data(source_db, target_db, model, pharmacie=None, verbose=False):
    print(f"🔄 Sync: {model.__name__} [{source_db} → {target_db}]")

    fk_fields = [f.name for f in model._meta.fields if isinstance(f, models.ForeignKey)]
    qs = model.objects.using(source_db).select_related(*fk_fields)

    if pharmacie:
        lookup = get_pharmacie_lookup(model)
        if lookup:
            try:
                qs = qs.filter(**{lookup: pharmacie})
            except FieldDoesNotExist:
                pass

    last_sync = get_last_sync_time(model)
    if hasattr(model, 'updated_at'):
        qs = qs.filter(updated_at__gt=last_sync)

    source_ids = list(qs.values_list('pk', flat=True))
    if not source_ids:
        print("   🟡 Rien à synchroniser")
        return

    existing_ids = set(model.objects.using(target_db).filter(pk__in=source_ids).values_list('pk', flat=True))

    unique_fields = [f.name for f in model._meta.fields if f.unique and f.name != 'id']
    existing_uniques = set()
    if unique_fields:
        existing_uniques = set(
            tuple(getattr(o, f) for f in unique_fields)
            for o in model.objects.using(target_db).all()
        )

    to_create = []
    to_update = []

    for obj in qs:
        data = {f.name: getattr(obj, f.name) for f in model._meta.fields if f.name != 'id'}
        unique_key = tuple(data[f] for f in unique_fields) if unique_fields else None

        # Assurer FK User
        for f in fk_fields:
            fk_field = obj._meta.get_field(f)
            if fk_field.remote_field.model == User:
                fk_user = getattr(obj, f)
                if fk_user:
                    ensure_user_exists_remote(fk_user.id, target_db)

        if obj.pk not in existing_ids and (not unique_key or unique_key not in existing_uniques):
            to_create.append(model(id=obj.pk, **data))
            if unique_key:
                existing_uniques.add(unique_key)
        else:
            to_update.append(model(id=obj.pk, **data))

    if to_create:
        model.objects.using(target_db).bulk_create(to_create, batch_size=500)
        if verbose:
            print(f"   ➕ Créés: {len(to_create)}")

    if to_update:
        fields = [f.name for f in model._meta.fields if f.name != 'id']
        model.objects.using(target_db).bulk_update(to_update, fields=fields, batch_size=500)
        if verbose:
            print(f"   🔁 Mis à jour: {len(to_update)}")

    update_last_sync_time(model)

# ============================
# EXECUTION
# ============================
def run(verbose=False):
    pharmacie = get_current_pharmacie()
    print(f"✅ Pharmacie locale : {pharmacie.nom_pharm} (ID: {pharmacie.id})")

    # Étape 1 : envoyer les données locales vers le serveur
    print("\n=== 🔼 LOCAL → REMOTE ===")
    for model in MODELS_GLOBAL:
        sync_data("default", "remote", model, verbose=verbose)

    ensure_pharmacie_exists_remote(pharmacie, "remote")

    for model in MODELS_PAR_PHARMACIE:
        sync_data("default", "remote", model, pharmacie=pharmacie, verbose=verbose)

    # Étape 2 : récupérer les données distantes vers le local
    print("\n=== 🔽 REMOTE → LOCAL ===")
    for model in MODELS_GLOBAL:
        sync_data("remote", "default", model, verbose=verbose)

    for model in MODELS_PAR_PHARMACIE:
        sync_data("remote", "default", model, pharmacie=pharmacie, verbose=verbose)

    save_sync_times(SYNC_TIMES)
    print("\n✅ Synchro terminée.")

if __name__ == "__main__":
    run(verbose=True)
