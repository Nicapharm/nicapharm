from django.apps import AppConfig


class PharmacieConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pharmacie'

    def ready(self):
        import pharmacie.signals  # 👈 pour enregistrer les signaux
