// Imports mongoose model
const User = require('../models/user.model');


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
                        var notifications = [];
                        for (var i = 0; i < user.notifications.length; i++) {
                            var notification = {};
                            notification["title"] = user.notifications[i].title;
                            notification["description"] = user.notifications[i].description;
                            notification["unread"] = user.notifications[i].unread;
                            notification["creation_date"] = user.notifications[i].creation_date;
                            notifications.push(notification);
                        }
                        res.status(200).json(notifications);
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
    getAllUserNotifications
};