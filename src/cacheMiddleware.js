const Redis = require('ioredis');
const redis = new Redis({
    host: 'redis',
    port: 6379
});

redis.on("error", (err) => console.error("Redis Client Error", err));

const CACHE_TTL = 60; // TTL initial en secondes

async function cacheMiddleware(req, res, next) {
    const key = "movies:top"; // clé unique pour ton endpoint

    try {
        const cached = await redis.get(key);

        if (cached) {
            // Sliding TTL : réinitialise le TTL à chaque lecture
            await redis.expire(key, CACHE_TTL);

            //console.log(`[CACHE HIT] ${key}`);
            return res.json(JSON.parse(cached));
        }

        // On continue si cache miss
        //console.log(`[CACHE MISS] ${key}`);
        res.sendResponse = res.json;
        res.json = async (body) => {
            // Mettre en cache la réponse
            await redis.set(key, JSON.stringify(body), "EX", CACHE_TTL);
            res.sendResponse(body);
        };

        next();

    } catch (err) {
        console.error("Redis error:", err);
        next(); // on continue même si Redis plante
    }
}
module.exports = cacheMiddleware;

async function logCacheStats() {
    const info = await redis.info("stats");
    const hits = info.match(/keyspace_hits:(\d+)/)[1];
    const misses = info.match(/keyspace_misses:(\d+)/)[1];
    console.log(`[REDIS STATS] Hits: ${hits}, Misses: ${misses}`);
}

// Par exemple, toutes les 30 secondes
setInterval(logCacheStats, 30000);