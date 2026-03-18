Cloud Administration Project

Projet Node.js / MongoDB pour la gestion de films et séries.  
Inclut configuration Docker Compose pour **développement** et **production**.

---

## 🚀 Structure du projet

```

cloud_administration_project/
├─ docker-compose.yml          # services de base
├─ docker-compose.override.yml # configuration dev (volumes, nodemon)
├─ docker-compose.prod.yml     # configuration prod (pas de volumes, environment sécurisé)
├─ Dockerfile                  # image Node.js pour API
├─ package.json
├─ package-lock.json
├─ src/
│  ├─ index.js
│  ├─ server.js
│  ├─ app.js
│  └─ db/db.js
├─ data/
│  └─ dataset_films_series.csv
├─ scripts/
│  └─ run.sh                  # script pour lancer dev ou prod
└─ .env                        # variables locales (non commit)

````

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

## ☁️ Déploiement sur GKE (Kubernetes)

Ce projet contient des manifests Kubernetes simples dans `k8s/` + un pipeline Cloud Build `cloudbuild.gke.yaml`.

### 1) Pré-requis GCP

1. Créez un projet GCP et activez les APIs :
   - `container.googleapis.com` (GKE)
   - `artifactregistry.googleapis.com` (Artifact Registry)
   - `cloudbuild.googleapis.com` (Cloud Build)

2. Installez le SDK GCP localement et connectez-vous :

```bash
# Installer le SDK GCP (si pas déjà fait)
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update && sudo apt-get install google-cloud-cli

# Installer kubectl
sudo snap install kubectl --classic

# Installer le plugin GKE pour gcloud
sudo apt-get update && sudo apt-get install google-cloud-cli-gke-gcloud-auth-plugin

# Se connecter à GCP
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>
```

3. Créez un cluster GKE (exemple avec 2 nodes e2-medium) :

```bash
gcloud container clusters create netflix-cluster \
  --zone europe-west9-a \
  --num-nodes 2 \
  --machine-type e2-medium
```

4. Créez un dépôt Artifact Registry pour les images Docker :

```bash
gcloud artifacts repositories create netflix-repo \
  --repository-format=docker \
  --location=europe-west9 \
  --description="Dépôt pour les images de l'application Netflix"
```

5. Récupérez les credentials du cluster pour kubectl :

```bash
gcloud container clusters get-credentials netflix-cluster --zone europe-west9-a
```

6. Vérifiez que kubectl fonctionne :

```bash
kubectl get nodes
```


### 2) Déployer via Cloud Build

Le pipeline `cloudbuild.gke.yaml` :
- construit l’image via `src/Dockerfile`
- la pousse dans Artifact Registry
- applique les manifests Kubernetes dans `k8s/`

Lancer le build :

```bash
gcloud builds submit --config cloudbuild.gke.yaml .
```

> ✅ Après le déploiement, récupérez l’URL publique de l’API :
> - `kubectl get svc api-node` (champ `EXTERNAL-IP`)

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

---

## 💡 Notes

* `.dockerignore` empêche Docker de copier `.env` et autres fichiers sensibles dans l’image.
* En dev, le volume monte le code local → `.env` est visible et injecté par dotenv.
* En prod, on ne monte pas de volume → `.env` doit être passé via `environment` ou secrets.

---

## 📌 Références

* [Docker Compose Documentation](https://docs.docker.com/compose/)
* [Mongoose Documentation](https://mongoosejs.com/)
* [MongoDB mongoimport](https://www.mongodb.com/docs/database-tools/mongoimport/)
