// Imports mongoose model
const Notification = require('../server/models/notification.model');

var clients = {};
var serverSocketIo;
var serverSocket;


function connect(socketIo) {
    // Saves the io
    serverSocketIo = socketIo;

    // Opens socket connection on this server
    socketIo.sockets.on('connection', (socket) => {
        serverSocket = socket;

        // Records for loaded user events
        serverSocket.on('add-user', (codUser) => {
            clients[codUser] = {
                "socket": socket.id
            };
        });
    });
}


function sendForumReplyNotification(i18n, fullNameAuthor, forumThreadTitle, diseaseName, recipientId, codRecipient, errorCallback, successfulCallback) {
    if (serverSocket) {
        const body = {
            title: i18n.__("ForumReplyNotification_Title"),
            description: i18n.__("ForumReplyNotification_Description", fullNameAuthor, forumThreadTitle, diseaseName),
            _recipientId: recipientId
        };
        Notification(body).save((error, data) => {
            if (error) {
                errorCallback(error);
            } else {
                try {
                    serverSocketIo.sockets.connected[clients[codRecipient].socket].emit('forumReplyNotification', data);
                    successfulCallback();
                } catch (error) {
                    errorCallback(error);
                }
            }
        });
    } else {
        errorCallback(new Error("Socket connection not opened"));
    }
}


function sendMessageReportNotification(i18n, messageContent, forumThreadTitle, diseaseName, recipientId, codRecipient, errorCallback, successfulCallback) {
    if (serverSocket) {
        const body = {
            title: i18n.__("MessageReportNotification_Title"),
            description: i18n.__("MessageReportNotification_Description", messageContent, forumThreadTitle, diseaseName),
            _recipientId: recipientId
        };
        Notification(body).save((error, data) => {
            if (error) {
                errorCallback(error);
            } else {
                try {
                    serverSocketIo.sockets.connected[clients[codRecipient].socket].emit('messageReportedNotification', data);
                    successfulCallback();
                } catch (error) {
                    errorCallback(error);
                }
            }
        });
    } else {
        errorCallback(new Error("Socket connection not opened"));
    }
}


function disconnect() {
    serverSocket.on('disconnect', () => {
        for (var codUser in lients) {
            if (clients[codUser].socket === serverSocket.id) {
                delete clients[codUser];
                break;
            }
        }
    });
}


module.exports = {
    connect,
    sendForumReplyNotification,
    sendMessageReportNotification,
    disconnect
}