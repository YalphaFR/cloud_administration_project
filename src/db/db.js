const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            minPoolSize: 10,
            maxPoolSize: 100
        });
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1); // stoppe l'app si la DB n'est pas connectée
    }
};

module.exports = { connectDB };