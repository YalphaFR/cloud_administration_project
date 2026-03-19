const mongoose = require('mongoose');

let currentMaxPool = 100;
let isAdjustingPool = false;

function adjustPool(load) {
    let newMax = currentMaxPool;

    if (load > 70) newMax = 150;  // forte charge, on augmente
    else if (load < 30) newMax = 50; // charge modérée, on réduit à un niveau stable

    if (newMax === currentMaxPool) {
        return;
    }

    if (isAdjustingPool) {
        console.log('[POOL] Ajustement déjà en cours, saut');
        return;
    }

    isAdjustingPool = true;
    console.log(`[POOL] Ajustement maxPoolSize: ${currentMaxPool} -> ${newMax}`);
    currentMaxPool = newMax;

    // On évite une déconnexion forcée sous forte charge pour réduire les échecs
    // on laisse l'ancienne connexion vivre et change seulement le paramètre futur lors de reconnect.
    setTimeout(() => {
        isAdjustingPool = false;
    }, 30000);
}

module.exports = adjustPool