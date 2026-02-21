const mongoose = require('mongoose');
require('dotenv').config();

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, /*{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }*/);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1); // stoppe l'app si la DB n'est pas connectée
    }
};