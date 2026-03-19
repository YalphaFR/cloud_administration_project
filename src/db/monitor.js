const mongoose = require("mongoose");

async function getDbStats() {
    const conn = mongoose.connection;

    // Récupération des stats officielles MongoDB
    const stats = await conn.db.admin().serverStatus();

    return {
        state: conn.readyState, // 1 = connected
        maxPoolSize: conn.client.options.maxPoolSize,
        minPoolSize: conn.client.options.minPoolSize,
        connections: {
            current: stats.connections.current,
            available: stats.connections.available,
            totalCreated: stats.connections.totalCreated
        }
    };
}

module.exports = getDbStats;
