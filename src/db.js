// db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";

dotenv.config();

const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}` +
    `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/` +
    `${process.env.MONGO_DB}?authSource=admin`;

export async function connectToDB() {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connecté avec Mongoose !");

        await Movie.collection.createIndex({ title: "text" });
        console.log("Index texte 'title' créé avec succès !");
    } catch (err) {
        console.error("Erreur MongoDB :", err);
        process.exit(1);
    }
}


export function getDB() {
    if (!db) throw new Error("connectToDB n'a pas encore été appelé !");
    return db;
}
