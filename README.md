Cloud Administration Project

Projet Node.js / MongoDB pour la gestion de films et séries.
Inclut configuration Docker Compose pour **développement** et **production**.
**Déployé sur GCP GKE avec optimisations de performance avancées**.

---

## 🚀 Structure du projet

```
cloud_administration_project/
├─ docker-compose.yml          # services de base
├─ docker-compose.override.yml # configuration dev (volumes, nodemon)
├─ docker-compose.prod.yml     # configuration prod (pas de volumes, environment sécurisé)
├─ cloudbuild.yaml             # pipeline Cloud Run
├─ cloudbuild.gke.yaml         # pipeline GKE (utilisé)
├─ cloudbuild.load-test.yaml   # pipeline image de test
├─ Dockerfile                  # image Node.js pour API
├─ package.json
├─ package-lock.json
├─ src/
│  ├─ index.js
│  ├─ server.js
│  ├─ app.js                   # API avec cache Redis et optimisations
│  ├─ cacheMiddleware.js       # Cache Redis avec TTL 120s
│  ├─ db/
│  │  ├─ db.js                 # Connexion MongoDB
│  │  └─ poolManager.js        # Gestion adaptative du pool de connexions
│  └─ models/
│     └─ movie.model.js        # Modèle Mongoose avec indexes
├─ data/
│  └─ dataset_films_series.csv # Dataset de 16,000 films/séries
├─ k8s/                        # Manifests Kubernetes
│  ├─ api-deployment.yaml      # Déploiement API (3 replicas)
│  ├─ mongo-statefulset.yaml   # MongoDB avec PVC
│  ├─ redis-deployment.yaml    # Cache Redis
│  └─ load-test-job.yaml       # Job de test de charge
├─ tests/
│  └─ load/
│     ├─ Dockerfile            # Image Python pour tests
│     ├─ requirements.txt
│     └─ stress_test.py        # Test 100K req, 1000 concurrent
├─ scripts/
│  ├─ run.sh                   # script pour lancer dev ou prod
│  ├─ import.sh                # import CSV (Docker Compose)
│  └─ run-load-test.sh         # helper test de charge
├─ mongo-data/                 # Volume persistant MongoDB (local)
└─ .env                        # variables locales (non commit)
```

---

## ⚡ Optimisations de Performance Implémentées

### Cache & Base de Données
- **Redis Cache** : TTL 120s sur `/movies/top` avec sliding expiration
- **Indexes MongoDB** : `popularity: -1`, texte sur `title+cast+description`
- **Pool de Connexions** : Gestion adaptative (50-150 connexions selon charge)
- **Requêtes Optimisées** : `.lean()` + `.select()` pour réduire la charge CPU

### Infrastructure
- **3 réplicas API** avec ressources optimisées (50m CPU request)
- **LoadBalancer GCP** avec IP externe stable
- **PVC MongoDB** 5Gi avec stockage persistant
- **Autoscaling** prêt (HPA configurable)

### Résultats de Performance
```
📊 Test de charge : 100,000 requêtes, 1,000 concurrent
✅ Latence moyenne : 906ms (vs 1,672ms avant)
✅ P95 : 1,568ms (vs 2,985ms avant)  
✅ P99 : 2,482ms (vs 5,781ms avant)
✅ Taux de succès : 100% (vs 99.991% avant)
```

**URL de Production** : `http://34.163.159.133/movies/top`

---

## 🛠 Prérequis

- Docker >= 20.10  
- Docker Compose >= 1.29  
- Node.js >= 18 (pour dev local si nécessaire)  

---

## ⚡ Installation & Setup

1. Cloner le projet :

```bash
git clone <url-du-projet>
cd cloud_administration_project
````

2. Créer un fichier `.env` à la racine avec les variables nécessaires :

```env
PORT=3000
MONGO_URI=mongodb://mongodb:27017/netflix_db
```

3. Importer le CSV dans MongoDB après le démarrage du conteneur :

```bash
script/import.sh
```

> ⚠️ Assurez-vous que `dataset_films_series.csv` est monté dans le conteneur via les volumes.

---

## 🏗 Lancer le projet

### Développement (hot reload)

```bash
scripts/run.sh
```

* Utilise `docker-compose.yml` + `docker-compose.override.yml`
* Montre le code local dans le conteneur (`volumes`)
* Nodemon redémarre automatiquement sur chaque changement

### Production

```bash
./scripts/run.sh prod
```

* Utilise `docker-compose.yml` + `docker-compose.prod.yml`
* Pas de volumes montés → image stable
* Commande `npm start` pour lancer le serveur
* Variables d’environnement à passer via `environment:` ou secrets

---

## ☁️ Déploiement sur GKE (Kubernetes) - ÉTAT ACTUEL

Le projet est **actuellement déployé** sur GCP GKE avec les optimisations de performance.

### État du Déploiement
- **Cluster** : `netflix-cluster` (2 nodes e2-medium)
- **Région** : `europe-west9-a`
- **API URL** : `http://34.163.159.133/movies/top`
- **Pods** : 3× API + MongoDB + Redis (tous Running)
- **Données** : 16,000 films importés

### 1) Pré-requis GCP (Déjà configuré)

1. Projet GCP : `cloud-computing-490021`
2. APIs activées : GKE, Artifact Registry, Cloud Build
3. SDK GCP installé et authentifié

### 2) Déploiement Automatique (Pipeline Cloud Build)

Le pipeline `cloudbuild.gke.yaml` :
- Construit l'image via `src/Dockerfile`
- Pousse vers `europe-west9-docker.pkg.dev/cloud-computing-490021/netflix-repo/api-image`
- Applique les manifests Kubernetes optimisés

**Commande de déploiement** :
```bash
gcloud builds submit --config cloudbuild.gke.yaml .
```

### 3) Vérification du Déploiement

```bash
# État des pods
kubectl get pods

# Services et LoadBalancer
kubectl get services

# Logs de l'API
kubectl logs -f deployment/api-node

# Test de l'API
curl http://34.163.159.133/movies/top
```

---

## ⚡ Tests de charge (Load Testing) - RÉSULTATS ACTUELS

Le projet inclut un job Kubernetes qui exécute un script de charge (`tests/load/stress_test.py`) depuis une image Docker dédiée.

### Résultats de Performance Actuels
```
============================================================
TEST RESULT
============================================================
URL: http://api-node/movies/top
TOTAL REQUESTS: 100000
CONCURRENCY: 1000
SUCCESS: 100000
FAIL: 0
TOTAL TIME: 92.852s
AVG LATENCY: 905.94 ms
MIN LATENCY: 245.67 ms
MAX LATENCY: 4049.78 ms
P50: 803.81 ms
P95: 1567.52 ms
P99: 2481.57 ms

Status codes:
200: 100000

Errors: None
```

### 1) Construire et publier l'image de test

```bash
gcloud builds submit --config cloudbuild.load-test.yaml .
```

### 2) Lancer le job de charge

```bash
kubectl apply -f k8s/load-test-job.yaml
```

### 3) Suivre les logs

```bash
kubectl logs job/netflix-load-test -f
```

### 4) Arrêter / nettoyer

```bash
kubectl delete job netflix-load-test
```

> 💡 Il existe un helper script pour lancer + suivre automatiquement : `scripts/run-load-test.sh`

### 5) Ajuster le comportement du test

1. Modifier `tests/load/stress_test.py` (par ex. `TOTAL_REQUESTS`, `CONCURRENCY`, l’URL, etc.).

2. Rebuilder et repasser l’image dans Artifact Registry :

```bash
gcloud builds submit --config cloudbuild.load-test.yaml .
```

3. Redéployer le job pour qu’il utilise la nouvelle image :

```bash
kubectl delete job netflix-load-test --ignore-not-found
kubectl apply -f k8s/load-test-job.yaml
```

> 💡 Avec `imagePullPolicy: Always` (déjà configuré), il suffit parfois de redéployer le job sans supprimer l’ancien. Mais la suppression garantit que le nouveau pod va bien récupérer la nouvelle image.

---
## 📊 Monitoring & Administration

### État du Cluster
```bash
# Pods et ressources
kubectl get pods -o wide
kubectl top pods
kubectl top nodes

# Services et endpoints
kubectl get services
kubectl get endpoints

# Logs des composants
kubectl logs -f deployment/api-node
kubectl logs -f mongodb-0
kubectl logs -f deployment/redis
```

### Métriques de Performance
```bash
# Test rapide de l'API
curl -w "@curl-format.txt" -o /dev/null -s http://34.163.159.133/movies/top

# Statistiques des endpoints
curl http://34.163.159.133/admin/stats/endpoints
```

### Gestion des Ressources
```bash
# Autoscaling (optionnel)
kubectl autoscale deployment api-node --cpu-percent=70 --min=3 --max=10

# Mise à jour des images
kubectl set image deployment/api-node api-node=europe-west9-docker.pkg.dev/cloud-computing-490021/netflix-repo/api-image:latest
kubectl rollout status deployment/api-node
```

---
## 🔧 Commandes Docker utiles

* Arrêter tous les conteneurs :

```bash
docker-compose down
```

* Supprimer volumes persistants (MongoDB) :

```bash
docker-compose down -v
```

* Rebuild l’image :

```bash
docker-compose build
```

* Voir les logs en temps réel :

```bash
docker-compose logs -f
```

---

## 📚 Conventions Mongoose / MongoDB

* Modèle Node.js : `Movie` (singulier, majuscule)
* Collection MongoDB : `movies` (minuscule, pluriel)
* Champs : camelCase si possible (`releaseYear`, `voteAverage`)
* Le CSV doit correspondre aux champs du schema Mongoose
* **Indexes** : `popularity: -1` pour tris rapides, texte pour recherche

---

## 💡 Notes

* `.dockerignore` empêche Docker de copier `.env` et autres fichiers sensibles dans l’image.
* En dev, le volume monte le code local → `.env` est visible et injecté par dotenv.
* En prod, on ne monte pas de volume → `.env` doit être passé via `environment` ou secrets.* **Production actuelle** : Déployée sur GKE avec cache Redis et optimisations DB.
* **Performance** : P99 < 2.5s pour 1000 requêtes concurrentes.
* **Scalabilité** : Prêt pour HPA et augmentation des replicas.
---

## 📌 Références

* [Docker Compose Documentation](https://docs.docker.com/compose/)
* [Mongoose Documentation](https://mongoosejs.com/)
* [MongoDB mongoimport](https://www.mongodb.com/docs/database-tools/mongoimport/)
* [Kubernetes Documentation](https://kubernetes.io/docs/)
* [Google Cloud GKE](https://cloud.google.com/kubernetes-engine/docs)
* [Redis Caching](https://redis.io/documentation)
