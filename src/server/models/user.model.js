// Import the mongoose module
const mongoose = require('mongoose');

// Define the User schema
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    code: { type: Number, required: true, unique: true },
    first_name: { type: String, max: [15, 'Too long name'] },
    last_name: { type: String, max: [15, 'Too long surname'] },
    gender: { type: String, enum: ['M', 'F'] },
    image: { data: Buffer, contentType: String },
    birth_date: { type: Date },
    is_anonymous: { type: Boolean, required: true }
}, {
    collection: 'Users'
});

// Virtual for user's full name
UserSchema
.virtual('fullname')
.get(function() {
    return this.first_name + ' ' + this.last_name;
});

// Virtual for user's age
UserSchema
.virtual('age')
.get(function() {
    return Math.floor((Date.now() - this.birth_date.getTime()) / (1000 * 3600 * 24 * 365));
});

// Virtual for user's URL
UserSchema
.virtual('url')
.get(function() {
    return '/users/' + this.id;
});

// Compile model from schema
const User = mongoose.model('User', UserSchema);

// Export function to create User model class
module.exports = User;