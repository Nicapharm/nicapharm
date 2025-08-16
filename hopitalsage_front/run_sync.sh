#!/bin/bash

# Activer l'environnement virtuel situé dans /Images/parmacie/env
source /home/moa/Images/parmacie/env/bin/activate

# Aller dans le dossier contenant les scripts Python
cd /home/moa/Images/parmacie/gestion_pharmacie/hopitalsage_front

# Choisir quel script exécuter
if [ "$1" = "remote_to_local" ]; then
  python sync_remote_to_local.py
elif [ "$1" = "local_to_remote" ]; then
  python sync_local_to_remote.py
else
  echo "❌ Argument invalide. Utilisez 'remote_to_local' ou 'local_to_remote'"
  exit 1
fi
