#!/bin/bash

echo "🚀 Démarrage du backend Docker..."

cd ~/Images/parmacie/gestion_pharmacie

# Lancer Docker backend uniquement
docker compose up -d 

echo "✅ Backend démarré sur http://localhost:8000"
