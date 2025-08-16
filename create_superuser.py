import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_pharmacie.settings')  # Remplacez 'votre_projet' par le nom de votre projet
django.setup()

User = get_user_model()

# Informations du superutilisateur
username = 'william'
email = 'willyloseka@gmail.com'
password = 'nicalose'

if not User.objects.filter(username=username).exists():
    print("Creating superuser...")
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser '{username}' created successfully!")
else:
    print(f"Superuser '{username}' already exists.")