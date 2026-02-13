import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    _id: Number,
    type: String,
    title: { type: String, required: true },
    director: String,
    cast: [String],
    country: [String],
    date_added: Date,
    release_year: Number,
    rating: Number,
    duration: String,
    genres: [String],
    language: String,
    description: String,
    popularity: Number,
    vote_count: Number,
    vote_average: Number,
    budget: Number,
    revenue: Number
});

export default mongoose.model("Movie", movieSchema);
