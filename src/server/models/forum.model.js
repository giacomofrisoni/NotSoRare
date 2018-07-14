// Imports the mongoose module
const mongoose = require('mongoose');

// Defines the Forum schema
const Schema = mongoose.Schema;
const ForumSchema = new Schema({
    _diseaseId: { type: Schema.ObjectId, ref: 'RareDisease', required: true }
}, {
    collection: 'Forums'
});

/**
 * Specifies a virtual with a 'ref' property in order to enable virtual population,
 * mantaining the document small.
 * Link: http://thecodebarbarian.com/mongoose-virtual-populate.
 */
ForumSchema
.virtual('forumThreads', {
    ref: 'ForumThread',
    localField: '_id',
    foreignField: '_forumId'
});

// Compiles model from schema
const Forum = mongoose.model('Forum', ForumSchema);

// Exports function to create Forum model class
module.exports = Forum;