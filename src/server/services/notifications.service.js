// Imports mongoose model
const User = require('../models/user.model');
const Notification = require('../models/notification.model');


function getAllUserNotifications(req, res) {

    const id = parseInt(req.params.id, 10);
    
    /**
     * Only a logged user with the same code of the request can access to notifications.
     */
    if (req.session.user == id) {

        User.findOne({ code: id })
            .populate({
                path: 'notifications',
                options: { sort: { 'creation_date': -1 } }
            })
            .exec((error, user) => {
                if (error) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Notifications_GettingUserNotifications", error)
                    });
                } else {
                    if (!user) {
                        res.status(404).send({
                            errorMessage: req.i18n.__("Err_Notifications_UserNotFound")
                        });
                    } else {
                        /**
                         * Parses the resulting json.
                         */
                        var updates = [];
                        var notifications = [];
                        for (var i = 0; i < user.notifications.length; i++) {
                            var notification = {};
                            notification["title"] = user.notifications[i].title;
                            notification["description"] = user.notifications[i].description;
                            notification["unread"] = user.notifications[i].unread;
                            notification["creation_date"] = user.notifications[i].creation_date;

                            notifications.push(notification);

                            // Sets notification as read
                            const updatePromise = Notification.update({ '_id': user.notifications[i]._id }, { 'unread': false });
                            updates.push(updatePromise);
                        }

                        Promise.all(updates).then(() => {  
                            res.status(200).json(notifications);
                        });
                    }
                }
            });
    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


function getUserUnreadNotificationsCount(req, res) {

    const id = parseInt(req.params.id, 10);
    
    /**
     * Only a logged user with the same code of the request can access to notifications.
     */
    if (req.session.user == id) {

        User.findOne({ code: id })
            .populate({
                path: 'notifications',
                select: 'unread'
            })
            .exec((error, user) => {
                if (error) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Notifications_GettingUnreadUserNotifications", error)
                    });
                } else {
                    if (!user) {
                        res.status(404).send({
                            errorMessage: req.i18n.__("Err_Notifications_UserNotFound")
                        });
                    } else {
                        res.status(200).json(user.notifications.filter(function(n) { return n.unread == 1 }).length);
                    }
                }
            });
    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


module.exports = {
    getAllUserNotifications,
    getUserUnreadNotificationsCount
};