#!/bin/bash

# ⚡ Charger le .env
set -o allexport
source .env
set +o allexport

# ----------------------------
# 2️⃣ Lancer MongoDB
# ----------------------------
docker run -d \
  --name cloud-administration-project-db \
  --network cloud-administration-project-network \
  -e MONGO_INITDB_ROOT_USERNAME=$MONGO_USER \
  -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD \
  -e MONGO_INITDB_DATABASE=$MONGO_DB \
  -p $MONGO_PORT:27017 \
  -v $(pwd)/mongo-data:/data/db \
  -v $(pwd)/csv:/data/csv \
  cloud-administration-project-db

echo "Waiting for MongoDB to start..."
sleep 10  # attendre que MongoDB soit prêt

# ----------------------------
# 3️⃣ Importer CSV
# ----------------------------
for file in $(docker exec cloud-administration-project-db ls /data/csv 2>/dev/null | grep -i "\.csv$"); do
  filename=$(basename $file)
  collection_name="${filename%.*}"
  echo "Importing $filename into collection $collection_name..."
  
 #docker exec -i cloud-administration-project-db mongoimport \
#   --db $MONGO_DB \
#   --collection $collection_name \
#   --type csv \
#   --headerline \
#   --file /data/csv/$filename \
#   --username $MONGO_USER \
#   --password $MONGO_PASSWORD \
#   --authenticationDatabase admin
done




# ----------------------------
# 5️⃣ Lancer le conteneur Node.js
# ----------------------------
docker run -d \
  --name cloud-administration-project-app \
  --network cloud-administration-project-network \
  -v $(pwd)/csv:/data/csv \
  -e PORT=$APP_PORT \
  -e MONGO_HOST=cloud-administration-project-db \
  -e MONGO_PORT=$MONGO_PORT \
  -e MONGO_USER=$MONGO_USER \
  -e MONGO_PASSWORD=$MONGO_PASSWORD \
  -e MONGO_DB=$MONGO_DB \
  -p $APP_PORT:$APP_PORT \
  cloud-administration-project-app

# ----------------------------
# 6️⃣ Infos fin
# ----------------------------
echo "Applications are running:"
echo "MongoDB: localhost:$MONGO_PORT"
echo "Node.js app: localhost:$APP_PORT"
