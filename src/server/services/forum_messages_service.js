// Imports mongoose models
const User = require('../models/user.model');
const RareDisease = require('../models/rare_disease.model');
const ForumThread = require('../models/forum_thread.model');
const ForumMessage = require('../models/forum_message.model');


function searchForumMessage(codDisease, codForumThread, codForumMessage,
    errorCallback, diseaseNotFoundCallback, forumThreadNotFoundCallback, forumMessageNotFoundCallback, doneCallback) {

    /**
     * Searches the rare disease with the specified code.
     */
    RareDisease.findOne({ code: codDisease }, (error, disease) => {
        if (error) {
            errorCallback(error);
        } else {
            if (!disease) {
                diseaseNotFoundCallback();
            } else {
                /**
                 * Searches the forum thread inside the found disease and with the specified code.
                 */
                ForumThread.findOne({ _forumId: disease._forumId, code: codForumThread }, (error, forumThread) => {
                    if (error) {
                        errorCallback(error);
                    } else {
                        if (!forumThread) {
                            forumThreadNotFoundCallback();
                        } else {
                            /**
                             * Searches the forum message inside the found forum thread and with the specified code.
                             */
                            ForumMessage.findOne({ _forumThreadId: forumThread._id, code: codForumMessage }).populate('_authorId').exec((error, forumMessage) => {
                                if (error) {
                                    errorCallback(error);
                                } else {
                                    if (!forumMessage) {
                                        forumMessageNotFoundCallback();
                                    } else {
                                        doneCallback(forumMessage);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });

}


function postForumMessage(req, res) {

    /**
     * Only a logged user with the same code of the request can add the data.
     */
    if (req.session.user == req.body.codUser) {

        /**
         * Searches the user with the specified code.
         */
        User.findOne({ code: req.body.codUser }, (error, user) => {
            if (error) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_ForumMessages_MessageInsertion", error)
                });
            } else {
                if (!user) {
                    res.status(404).send({
                        errorMessage: req.i18n.__("Err_ForumMessages_UserNotFound")
                    });
                } else {

                    /**
                     * Searches the rare disease with the specified code.
                     */
                    RareDisease.findOne({ code: req.body.codDisease }, (error, disease) => {
                        if (error) {
                            res.status(500).send({
                                errorMessage: req.i18n.__("Err_ForumMessages_MessageInsertion", error)
                            });
                        } else {
                            if (!disease) {
                                res.status(404).send({
                                    errorMessage: req.i18n.__("Err_ForumMessages_DiseaseNotFound")
                                });
                            } else {

                                /**
                                 * Searches the forum thread with the specified code.
                                 */
                                ForumThread.findOne({ _forumId: disease._forumId, code: req.body.codForumThread }, (error, forumThread) => {
                                    if (error) {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_ForumMessages_MessageInsertion", error)
                                        });
                                    } else {
                                        if (!forumThread) {
                                            res.status(404).send({
                                                errorMessage: req.i18n.__("Err_ForumMessages_ThreadNotFound")
                                            });
                                        } else {
                                            // Adds the forum message
                                            var originalMessage = {
                                                content: req.body.content,
                                                _authorId: user._id,
                                                _forumThreadId: forumThread._id,
                                            }
                                            const forumMessage = new ForumMessage(originalMessage);
                                            forumMessage.save(error => {
                                                if (error) {
                                                    res.status(500).send({
                                                        errorMessage: req.i18n.__("Err_ForumMessages_MessageInsertion", error)
                                                    });
                                                } else {
                                                    res.status(201).json(forumMessage);
                                                }
                                            });
                                        }
                                    }
                                });

                            }
                        }
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


function putForumMessage(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idForumThread = parseInt(req.params.idForumThread, 10);
    const idForumMessage = parseInt(req.params.idForumMessage, 10);

    searchForumMessage(
        idDisease,
        idForumThread,
        idForumMessage,
        (error) => {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_ForumMessages_MessageUpdate", error)
            });
        },
        () => {
            res.status(404).send({
                errorMessage: req.i18n.__("Err_ForumMessages_DiseaseNotFound")
            });
        },
        () => {
            res.status(404).send({
                errorMessage: req.i18n.__("Err_ForumMessages_ThreadNotFound")
            });
        },
        () => {
            res.status(404).send({
                errorMessage: req.i18n.__("Err_ForumMessages_MessageNotFound")
            });
        },
        (forumMessage) => {
            /**
             * Only a logged user with the same code of the request can update the data.
             */
            if (req.session.user == forumMessage._authorId.code) {

                // Checks for duplicate user votes
                if (req.body.utility_votes.length === new Set(req.body.utility_votes.map(item => item.user)).size) {
                    forumMessage.content = req.body.content;
                    forumMessage.utility_votes = req.body.utility_votes;
                    forumMessage.save(error => {
                        if (error) {
                            res.status(500).send({
                                errorMessage: req.i18n.__("Err_ForumMessages_MessageUpdate", error)
                            });
                        } else {
                            res.status(200).json(forumMessage);
                        }
                    });
                } else {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_ForumMessages_DuplicateUtilityVote")
                    });
                }

            } else {
                res.status(401).send({
                    errorMessage: req.i18n.__("Err_UnauthorizedUser")
                });
            }
        }
    );

}


function deleteForumMessage(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idForumThread = parseInt(req.params.idForumThread, 10);
    const idForumMessage = parseInt(req.params.idForumMessage, 10);

    searchForumMessage(
        idDisease,
        idForumThread,
        idForumMessage,
        (error) => {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_ForumMessages_MessageDeletion", error)
            });
        },
        () => {
            res.status(404).send({
                errorMessage: req.i18n.__("Err_ForumMessages_DiseaseNotFound")
            });
        },
        () => {
            res.status(404).send({
                errorMessage: req.i18n.__("Err_ForumMessages_ThreadNotFound")
            });
        },
        () => {
            res.status(404).send({
                errorMessage: req.i18n.__("Err_ForumMessages_MessageNotFound")
            });
        },
        (forumMessage) => {
            /**
             * Only a logged user with the same code of the request can delete the data.
             */
            if (req.session.user == forumMessage._authorId.code) {

                ForumMessage.findByIdAndRemove(forumMessage._id)
                    .then(forumMessage => {
                        // Checks that the forum message has been found
                        if (!forumMessage) {
                            res.status(404).send({
                                errorMessage: req.i18n.__("Err_ForumMessages_MessageNotFound", error)
                            });
                        } else {
                            res.status(200).send({
                                infoMessage: req.i18n.__("ForumMessageDeletion_Completed")
                            });
                        }
                    })
                    .catch(error => {
                        if (error) {
                            res.status(500).send({
                                errorMessage: req.i18n.__("Err_ForumMessages_MessageDeletion", error)
                            });
                        }
                    });
                
            } else {
                res.status(401).send({
                    errorMessage: req.i18n.__("Err_UnauthorizedUser")
                });
            }
        }
    );

}


module.exports = {
    postForumMessage,
    putForumMessage,
    deleteForumMessage
};