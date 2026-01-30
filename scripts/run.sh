#!/bin/bash

# Charger le .env proprement
set -o allexport
source .env
set +o allexport


docker run -d \
  --name cloud-administration-project-db \
  --env MONGO_INITDB_ROOT_USERNAME=$MONGO_USER \
  --env MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD \
  --env MONGO_INITDB_DATABASE=$MONGO_DB \
  --network cloud-administration-project-network \
  -p $MONGO_PORT:27017 \
  -v $(pwd)/mongo-data:/data/db \
  -v $(pwd)/csv:/data/csv \
  cloud-administration-project-db

  # Attendre quelques secondes que MongoDB soit prêt
echo "Waiting for MongoDB to start..."
sleep 5

# Import automatique de tous les CSV dans /data/csv
for file in $(docker exec mongodb ls /data/csv 2>/dev/null | grep -i "\.csv$"); do
  filename=$(basename $file)
  collection_name="${filename%.*}"
  echo "Importing $filename into collection $collection_name..."
  docker exec -it mongodb mongoimport \
    --db $MONGO_DB \
    --collection $collection_name \
    --type csv \
    --headerline \
    --file /data/csv/$filename \
    --username $MONGO_USER \
    --password $MONGO_PASSWORD \
    --authenticationDatabase admin
done


docker run -d \
  --name cloud-administration-project-app \
  --env PORT=$APP_PORT \
  --env MONGO_HOST=$MONGO_HOST \
  --env MONGO_PORT=$MONGO_PORT \
  --env MONGO_USER=$MONGO_USER \
  --env MONGO_PASSWORD=$MONGO_PASSWORD \
  --env MONGO_DB=$MONGO_DB \
  --network cloud-administration-project-network \
  -p $APP_PORT:$APP_PORT \
  cloud-administration-project-app

echo "Applications are running:"
echo "MongoDB: localhost:$MONGO_PORT"
echo "Node.js app: localhost:$PORT"