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
