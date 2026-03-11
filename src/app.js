const express = require('express');
const app = express();

const Movie = require('./models/movie.model');

const redis = require('redis');
const client = redis.createClient({
    url: "redis://localhost:6379" // adapter si Docker ou GCP
});

client.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
    await client.connect();
})();

// Middlewares
app.use(express.json());

// Count hits per endpoint (in-memory, simple prototype)
const endpointHits = {};

app.use((req, res, next) => {
    const path = req.path;
    endpointHits[path] = (endpointHits[path] || 0) + 1;
    console.log(`Endpoint "${path}" a été appelé ${endpointHits[path]} fois`);
    next();
});

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
    endpointHits["/movies/top"] = (endpointHits["/movies/top"] || 0) + 1;
    //console.log(`Top movies hit count: ${endpointHits["/movies/top"]}`);
    const cacheKey = "top_movies";

    try {
        // 1. Vérifier si les données sont dans Redis
        const cached = await client.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        // 2. Si pas en cache, récupérer depuis MongoDB
        const movies = await Movie.find()
            .sort({ popularity: -1 })
            .limit(10);

        // 3. Stocker le résultat dans Redis (TTL 60 secondes par ex.)
        await client.setEx(cacheKey, 60, JSON.stringify(movies));
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