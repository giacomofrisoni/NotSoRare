// Import the mongoose module
const mongoose = require('mongoose');

// Define the RareDisease schema
const Schema = mongoose.Schema;
const RareDiseaseSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, max: [30, 'Too long disease name'], required: true }
}, {
    collection: 'RareDiseases'
});

// Virtual for rare disease's URL
RareDiseaseSchema
.virtual('url')
.get(function() {
    return '/rareDiseases/' + this.id;
});

// Compile model from schema
const RareDisease = mongoose.model('RareDisease', RareDiseaseSchema);

// Export function to create RareDisease model class
module.exports = RareDisease;