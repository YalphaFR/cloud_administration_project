import fs from "fs";
import path from "path";
import csv from "csv-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "../src/models/Movie.js";

dotenv.config();

// Connexion MongoDB avec Mongoose
const uri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}` +
    `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/` +
    `${process.env.MONGO_DB}?authSource=admin`;

await mongoose.connect(uri);
console.log("MongoDB connecté !");

const csvFolder = path.join("/data/csv"); // dossier monté dans le volume

// Récupérer tous les fichiers CSV
const files = fs.readdirSync(csvFolder).filter(f => f.endsWith(".csv"));

for (const file of files) {
    const filePath = path.join(csvFolder, file);
    const movies = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
            // Transformation pour correspondre au schéma Mongoose
            movies.push({
                _id: Number(row.show_id),
                type: row.type,
                title: row.title,
                director: row.director,
                cast: row.cast ? row.cast.split(",").map(s => s.trim()) : [],
                country: row.country ? row.country.split(",").map(s => s.trim()) : [],
                date_added: row.date_added ? new Date(row.date_added) : null,
                release_year: row.release_year ? Number(row.release_year) : null,
                rating: row.rating ? Number(row.rating) : null,
                duration: row.duration || null,
                genres: row.genres ? row.genres.split(",").map(s => s.trim()) : [],
                language: row.language,
                description: row.description,
                popularity: row.popularity ? Number(row.popularity) : null,
                vote_count: row.vote_count ? Number(row.vote_count) : null,
                vote_average: row.vote_average ? Number(row.vote_average) : null,
                budget: row.budget ? Number(row.budget) : null,
                revenue: row.revenue ? Number(row.revenue) : null,
            });
        })
        .on("end", async () => {
            try {
                await Movie.insertMany(movies);
                console.log(`Import terminé pour ${file} (${movies.length} films)`);
            } catch (err) {
                console.error("Erreur import MongoDB :", err);
            }
        });
}