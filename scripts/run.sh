#!/bin/bash

ENV=${1:-dev}

echo "Lancement du projet en mode $ENV ..."

if [ "$ENV" = "dev" ]; then
  docker-compose down
  docker-compose up -d --build
else
  docker-compose down      # juste stop/restart en prod
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
fi