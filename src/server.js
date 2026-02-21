const express = require('express');
const mongoose = require('mongoose');
const Film = require('./models/Films'); // Import du modèle créé précédemment
require('dotenv').config();

const app = express();
app.use(express.json());

// Connexion à MongoDB (Utilise le nom du service Docker)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connecté à MongoDB dans Docker"))
    .catch(err => console.error("Erreur de connexion:", err));

// ROUTE DE RECHERCHE (Search Query)
// Exemple: /search?title=Inception ou /search?actor=Leonardo
app.get('/search', async (req, res) => {
    try {
        const { title, actor } = req.query;
        let query = {};

        if (title) {
            // Recherche insensible à la casse
            query.title = { $regex: title, $options: 'i' };
        }

        if (actor) {
            // Recherche dans la colonne 'cast' du CSV
            query.cast = { $regex: actor, $options: 'i' };
        }

        const results = await Film.find(query).limit(20); // Limite pour la performance
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la recherche", error });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API lancée sur le port ${PORT}`);
});