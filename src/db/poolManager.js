const mongoose = require('mongoose');

let currentMaxPool = 66;

function adjustPool(load) {
    let newMax = currentMaxPool;

    if (load > 50) newMax = 66;  // forte charge, on augmente
    else if (load < 20) newMax = 10; // faible charge, on réduit

    if (newMax !== currentMaxPool) {
        console.log(`[POOL] Ajustement maxPoolSize: ${currentMaxPool} -> ${newMax}`);
        currentMaxPool = newMax;

        // Reconnecte Mongoose avec nouveau pool
        mongoose.disconnect().then(() => {
            mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/netflix", {
                minPoolSize: 5,
                maxPoolSize: currentMaxPool
            });
        });
    }
}

module.exports = adjustPool