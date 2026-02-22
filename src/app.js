const express = require('express');
const app = express();

const Movie = require('./models/movie.model');

// Middlewares
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "API Netflix Clone opérationnelle 🎬" });
});


/**
 * GET /movies
 * Pagination + filtres
 * Ex: /movies?genre=Action&year=2010&page=1&limit=10
 */
app.get("/movies", async (req, res) => {
    try {
        const { genre, year, page = 1, limit = 10 } = req.query;

        let filter = {};

        if (genre) {
            filter.genres = genre;
        }

        if (year) {
            filter.release_year = Number(year);
        }

        const movies = await Movie.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json(movies);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * GET /movies/search?q=inception
 * Recherche texte (nécessite index text sur title)
 */
app.get("/movies/search", async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: "Query manquante" });
        }

        const movies = await Movie.find({
            $text: { $search: q }
        });

        res.json(movies);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * GET /movies/top
 * Top 10 par popularité
 */
app.get("/movies/top", async (req, res) => {
    try {
        const movies = await Movie.find()
            .sort({ popularity: -1 })
            .limit(10);

        res.json(movies);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * GET /movies/:id
 */
app.get("/movies/:id", async (req, res) => {
    try {
        const movie = await Movie.findById(Number(req.params.id));

        if (!movie) {
            return res.status(404).json({ error: "Film non trouvé" });
        }

        res.json(movie);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;