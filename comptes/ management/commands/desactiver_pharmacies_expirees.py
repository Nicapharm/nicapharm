from django.core.management.base import BaseCommand
from django.utils import timezone
from comptes.models import Pharmacie

class Command(BaseCommand):
    help = "Désactive automatiquement les pharmacies dont la date d'expiration est dépassée"

    def handle(self, *args, **kwargs):
        aujourd_hui = timezone.now().date()
        expirees = Pharmacie.objects.filter(is_active=True, date_expiration__lt=aujourd_hui)
        total = expirees.count()

        for pharmacie in expirees:
            pharmacie.is_active = False
            pharmacie.save()
            self.stdout.write(self.style.WARNING(f"{pharmacie.nom_pharm} désactivée"))

        self.stdout.write(self.style.SUCCESS(f"{total} pharmacie(s) désactivée(s)."))
