// Imports the mongoose module
const mongoose = require('mongoose');

// Defines the User schema
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    code: { type: Number, required: true, unique: true },
    first_name: { type: String, max: [15, 'Too long name'], required: true },
    last_name: { type: String, max: [15, 'Too long surname'], required: true },
    gender: { type: String, enum: ['M', 'F'], required: true },
    photo: { data: Buffer, contentType: String },
    birth_date: { type: Date, required: true },
    is_anonymous: { type: Boolean, required: true }
}, {
    collection: 'Users',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

// Virtual for user's full name
UserSchema
.virtual('fullname')
.get(function() {
    return (this.first_name && this.last_name) ? this.first_name + ' ' + this.last_name : null;
});

// Virtual for user's age
UserSchema
.virtual('age')
.get(function() {
    return this.birth_date ? Math.floor((Date.now() - this.birth_date.getTime()) / (1000 * 3600 * 24 * 365)) : null;
});

// Virtual for user's photo url
UserSchema
.virtual('photoURL')
.get(function() {
    return (this.photo.contentType && this.photo.data) ? ("data:" + this.photo.contentType + ";base64," + this.photo.data.toString('base64')) : null;
});

/**
 * Specifies a virtual with a 'ref' property in order to enable virtual population,
 * mantaining the document small.
 * Link: http://thecodebarbarian.com/mongoose-virtual-populate.
 */
UserSchema
.virtual('forumThreads', {
    ref: 'ForumThread',
    localField: '_id',
    foreignField: '_authorId'
});

// Compiles model from schema
const User = mongoose.model('User', UserSchema);

// Exports function to create User model class
module.exports = User;