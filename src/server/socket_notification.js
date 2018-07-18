// Imports mongoose model
const Notification = require('../models/notification.model');

var clients = {};

var socket;

function connect(socketIo) {
    // Opens socket connection on this server
    socketIo.on('connection', (socket) => {
        this.socket = socket;

        socket.on('add-user', (codUser) => {
            clients[codUser] = {
                "socket": socket.id
            };
        });
    });
}

function sendForumReplyNotification(fullNameAuthor, forumThread, diseaseName, codRecipient, errorCallback, successfulCallback) {
    if (socket) {
        const body = {
            title: "Qualcuno ti ha risposto",
            description: "L'utente X ha risposto alla tua discussione Y sul forum della malattia Z"
        };
        Notification(body).save((error, data) => {
            if (error) {
                errorCallback(error);
            } else {
                clients[codRecipient].socket.emit('forumReplyNotification', data);
                successfulCallback();
            }
        });
    } else {
        errorCallback(new Error("Socket connection not opened"));
    }
}

module.exports = {
    connect,
    sendForumReplyNotification
}