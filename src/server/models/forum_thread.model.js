// Imports the mongoose module
const mongoose = require('mongoose');

// Imports the mongoose auto-increment module
const autoIncrement = require('mongoose-auto-increment');

// Defines the ForumThread schema
const Schema = mongoose.Schema;
const ForumThreadSchema = new Schema({
    code: { type: Number, required: true, unique: true },
    title: { type: String, min: [10, 'Too short title'], max: [200, 'Too long title'], required: true },
    description: { type: String, min: [10, 'Too short description'], max: [2000, 'Too long description'], required: true },
    creation_date: { type: Date, default: Date.now, required: true },
    updated_date: { type: Date, default: Date.now, required: true },
    _authorId: { type: Schema.ObjectId, ref: 'User', required: true },
    _forumId: { type: Schema.ObjectId, ref: 'Forum', required: true }
}, {
    collection: 'ForumThreads'
});

// Initializes and setups the auto-increment
autoIncrement.initialize(mongoose.connection);
ForumThreadSchema.plugin(autoIncrement.plugin, { model: 'ForumThread', field: 'code' });

// Defines a unique compound index
ForumThreadSchema.index({ _forumId: 1, code: 1 }, { unique: true });

// Defines a function to run before saving
ForumThreadSchema.pre('save', function(next) {
    // Gets the current date
    var currentDate = new Date();
    // Changes the updated date field to current date
    this.updated_date = currentDate;
    // Sets the creation date if not already present
    if (!this.creation_date)
        this.creation_date = currentDate;
    next();
});

// Compiles model from schema
const ForumThread = mongoose.model('ForumThread', ForumThreadSchema);

// Exports function to create ForumThread model class
module.exports = ForumThread;