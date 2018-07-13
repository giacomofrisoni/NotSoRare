// Imports the mongoose module
const mongoose = require('mongoose');


// Defines the Forum schema
const Schema = mongoose.Schema;
const ForumSchema = new Schema({
    _diseaseId: { type: Schema.ObjectId, ref: 'RareDisease', required: true },
    _threadsIds: [
        { type: Schema.ObjectId, ref: 'ForumThread' }
    ]
}, {
    collection: 'Forums'
});

// Virtual for forum thread's URL
ForumSchema
.virtual('url')
.get(function() {
    return '/forums/' + this._id;
});

// Compiles model from schema
const Forum = mongoose.model('Forum', ForumSchema);

// Exports function to create Forum model class
module.exports = Forum;