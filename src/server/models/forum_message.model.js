// Imports the mongoose module
const mongoose = require('mongoose');

// Imports the mongoose auto-increment module
const autoIncrement = require('mongoose-auto-increment');

// Defines the ForumMessage schema
const Schema = mongoose.Schema;
const ForumMessageSchema = new Schema({
    code: { type: Number, required: true, unique: true },
    content: { type: String, min: [10, 'Too short message content'], max: [2000, 'Too long message content'], required: true },
    creation_date: { type: Date, default: Date.now, required: true },
    update_date: { type: Date, default: Date.now, required: true },
    utility: { type: Number, min: 0, default: 0, required: true },
    utility_votes: [
        { 
            user: { type: Schema.ObjectId, ref: 'User', required: true },
            vote: { type: Boolean, required: true },
            creation_date: { type: Date, default: Date.now, required: true }
        }
    ],
    _authorId: { type: Schema.ObjectId, ref: 'User', required: true },
    _forumThreadId: { type: Schema.ObjectId, ref: 'ForumThread', required: true },
    _commentsIds: [{ type: Schema.ObjectId, ref: 'ForumMessage' }]
}, {
    collection: 'ForumMessages'
});

// Initializes and setups the auto-increment
autoIncrement.initialize(mongoose.connection);
ForumMessageSchema.plugin(autoIncrement.plugin, { model: 'ForumMessage', field: 'code' });

// Defines a unique compound index
ForumMessageSchema.index({ _forumThreadId: 1, code: 1 }, { unique: true });

// Defines a function to run before saving
ForumMessageSchema.pre('save', function(next) {
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
const ForumMessage = mongoose.model('ForumMessage', ForumMessageSchema);

// Exports function to create ForumMessage model class
module.exports = ForumMessage;