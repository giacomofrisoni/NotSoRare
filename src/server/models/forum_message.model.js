// Import the mongoose module
const mongoose = require('mongoose');

// Define the ForumMessage schema
const Schema = mongoose.Schema;
const ForumMessageSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    content: { type: String, max: [5000, 'Too long message content'], required: true },
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
    author: { type: Schema.ObjectId, ref: 'User', required: true },
    forum_thread: { type: Schema.ObjectId, ref: 'ForumThread', required: true },
    comments: [{ type: Schema.ObjectId, ref: 'ForumMessage' }]
}, {
    collection: 'ForumMessages'
});

// Define a unique compound index
ForumMessageSchema.index({ forum_thread: 1, release_datetime: 1 }, { unique: true });

// Virtual for forum message's URL
ForumMessageSchema
.virtual('url')
.get(function() {
    return '/forumMessages/' + this.id;
});

// Compile model from schema
const ForumMessage = mongoose.model('ForumMessage', ForumMessageSchema);

// Export function to create ForumMessage model class
module.exports = ForumMessage;