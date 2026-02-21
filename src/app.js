const express = require('express');
const app = express();

// Middlewares
app.use(express.json());

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

module.exports = app;