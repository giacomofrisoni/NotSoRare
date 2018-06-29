// Import the mongoose module
const mongoose = require('mongoose');

// Define the Hero schema
const Schema = mongoose.Schema;
const HeroSchema = new Schema({
    code: { type: Number, required: true, unique: true },
    name: String,
    saying: String
}, {
    collection: 'Heroes'
});

// Compile model from schema
const Hero = mongoose.model('Hero', HeroSchema);

// Export function to create Hero model class
module.exports = Hero;