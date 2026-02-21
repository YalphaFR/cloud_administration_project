const mongoose = require('mongoose');

// Définition du schéma basé sur les colonnes de ton CSV 
const FilmSchema = new mongoose.Schema({
    show_id: { type: Number, required: true, unique: true },
    type: { type: String, enum: ['Movie', 'TV Show'] },
    title: { type: String, required: true, index: true }, // Indexé pour la recherche 
    director: String,
    cast: { type: String, index: true }, // Indexé pour la recherche par acteur [cite: 10]
    country: String,
    date_added: String,
    release_year: Number,
    rating: String,
    duration: String,
    genres: String,
    lang: String,
    description: String,
    popularity: Number,
    vote_count: Number,
    vote_average: Number,
    budget: Number,
    revenue: Number
});

// Création d'un index de texte pour permettre des recherches globales (titre + cast + description)
FilmSchema.index({ title: 'text', cast: 'text', description: 'text' });

module.exports = mongoose.model('Film', FilmSchema);