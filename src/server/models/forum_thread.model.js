// Import the mongoose module
const mongoose = require('mongoose');

// Define the ForumThread schema
const Schema = mongoose.Schema;
const ForumThreadSchema = new Schema({
    code: { type: Number, required: true, unique: true },
    title: { type: String, max: [50, 'Too long title'], required: true },
    description: { type: String, max: [1000, 'Too long description'], required: true },
    creation_date: { type: Date, default: Date.now, required: true },
    updated_date: { type: Date, default: Date.now, required: true },
    author: { type: Schema.ObjectId, ref: 'User', required: true },
    disease: { type: Schema.ObjectId, ref: 'RareDisease', required: true }
}, {
    collection: 'ForumThreads'
});

// Define a unique compound index
ForumThreadSchema.index({ disease: 1, title: 1 }, { unique: true });

// Virtual for forum thread's URL
ForumThreadSchema
.virtual('url')
.get(function() {
    return '/forumThreads/' + this.id;
});

// Define a function to run before saving
ForumThreadSchema.pre('save', function(next) {
    // Get the current date
    var currentDate = new Date();
    // Change the updated date field to current date
    this.updated_date = currentDate;
    next();
});

// Compile model from schema
const ForumThread = mongoose.model('ForumThread', ForumThreadSchema);

// Export function to create ForumThread model class
module.exports = ForumThread;