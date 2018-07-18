// Imports the mongoose module
const mongoose = require('mongoose');

// Defines the Notification schema
const Schema = mongoose.Schema;
const NotificationSchema = new Schema({
    title: { type: String, required: true, min: 1, max: [250, 'Too long title'] },
    description: { type: String, required: true, min: 1, max: [2000, 'Too long description'] },
    unread: { type: Boolean, default: true, required: true },
    creation_date: { type: Date, default: Date.now(), required: true },
    _recipientId: { type: Schema.ObjectId, ref: 'User', required: true }
}, {
    collection: 'Notifications'
});

// Compiles model from schema
const Notification = mongoose.model('Notification', NotificationSchema);

// Exports function to create Notification model class
module.exports = Notification;