// Import the mongoose module
const mongoose = require('mongoose');
require('mongoose-type-email');

// Define the User schema
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    email: { type: mongoose.SchemaTypes.Email, required: true, unique: true },
    first_name: { type: String, required: true, max: [100, 'Too long name'] },
    last_name: { type: String, required: true, max: [100, 'Too long name'] },
    gender: { type: String, required: true, enum: ['M', 'F'] },
    birth_date: { type: Date },
    nationality: { type: Schema.ObjectId, ref: 'Nation' },
    biografy: { type: String, max: 50000 },
    image: { data: Buffer, contentType: String },
    registration_date: { type: Date, required: true, defualt: Date.now },
    ban_date: Date
}, {
    collection: 'Users'
});

// Virtual for user's full name
UserSchema
.virtual('name')
.get(function() {
    return this.first_name + ' ' + this.last_name;
});

// Compile model from schema
const User = mongoose.model('User', UserSchema);

// Export function to create User model class
module.exports = User;