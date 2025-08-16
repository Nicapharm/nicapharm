#!/bin/bash

DIRECTION=$1

if [ "$DIRECTION" != "remote_to_local" ] && [ "$DIRECTION" != "local_to_remote" ]; then
  echo "❌ Utilisation : ./run_sync_docker.sh [remote_to_local|local_to_remote]"
  exit 1
fi

SCRIPT_NAME="sync_${DIRECTION}.py"

echo "🚀 Lancement de la synchronisation Docker : $SCRIPT_NAME"

docker compose exec backend python hopitalsage_front/$SCRIPT_NAME

RESULT=$?

if [ $RESULT -eq 0 ]; then
  echo "✅ Synchronisation terminée avec succès."
else
  echo "❌ Échec de la synchronisation."
fi
