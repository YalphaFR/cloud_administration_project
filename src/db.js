// db.js
import { MongoClient } from "mongodb";

// URL de connexion MongoDB (ici pour Docker ou localhost)
const uri = "mongodb://admin:adminpassword@localhost:27017/mydatabase?authSource=admin";

// Crée le client
const client = new MongoClient(uri);

let db;

export async function connectToDB() {
    try {
        await client.connect();
        console.log("Connecté à MongoDB !");
        db = client.db(); // récupère la base par défaut
        return db;
    } catch (err) {
        console.error("Erreur de connexion à MongoDB :", err);
    }
}

export function getDB() {
    if (!db) throw new Error("ConnectToDB n'a pas encore été appelé !");
    return db;
}
