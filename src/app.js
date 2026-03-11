const express = require('express');
const app = express();

const Movie = require('./models/movie.model');

const cacheMiddleware = require('./cacheMiddleware');
const adjustPool = require('./db/poolManager');

// Middlewares
app.use(express.json());

// Count hits per endpoint (in-memory, simple prototype)
const endpointHits = {};
let activeRequests = 0;

app.use((req, res, next) => {
    activeRequests++;
    res.on("finish", () => {
        activeRequests--;
    });

    const path = req.path;
    endpointHits[path] = (endpointHits[path] || 0) + 1;
    //console.log(`Endpoint "${path}" a été appelé ${endpointHits[path]} fois`);
    next();
});

setInterval(() => {
    const loadPercent = (activeRequests / 50) * 100; // 50 = seuil arbitraire
    adjustPool(loadPercent);
}, 20000); // Vérifie la charge toutes les 500ms 

// Routes

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
app.get("/movies/top", cacheMiddleware, async (req, res) => {
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

app.get("/admin/stats/endpoints", (req, res) => {
    // Retourne un tableau trié par nombre d'appels
    const sorted = Object.entries(endpointHits)
        .sort((a, b) => b[1] - a[1])
        .map(([endpoint, count]) => ({ endpoint, count }));
    res.json(sorted);
});

module.exports = app;