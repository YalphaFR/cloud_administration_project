const mongoose = require("mongoose");

async function getDbStats() {
    const conn = mongoose.connection;

    const pool = conn.client.topology.s.pool; // pool interne du driver

    return {
        state: conn.readyState, // 1 = connected
        maxPoolSize: conn.client.options.maxPoolSize,
        minPoolSize: conn.client.options.minPoolSize,
        connections: {
            totalCreated: pool.totalConnectionCount,
            active: pool.connections.size,
            idle: pool.idleConnections.size,
            pending: pool.pendingConnectionCount
        }
    };
}

module.exports = getDbStats;
