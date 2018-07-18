// Imports mongoose models
const User = require('../models/user.model');
const RareDisease = require('../models/rare_disease.model');
const ForumThread = require('../models/forum_thread.model');
const ForumMessage = require('../models/forum_message.model');

// Module for translation handling
const translationEnv = require('../env/translation_environment');

// Imports notification module
const socketNotification = require('../../server/socket_notification');



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
                                        doneCallback(disease, forumThread, forumMessage);
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
     * Only a logged user can add the data.
     */
    if (req.session.user) {

        /**
         * Searches the user with the specified code.
         */
        User.findOne({ code: req.session.user }, (error, user) => {
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
                                ForumThread.findOne({ _forumId: disease._forumId, code: req.body.codForumThread })
                                    .populate('_authorId', 'code')
                                    .exec((error, forumThread) => {
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
                                                    _forumThreadId: forumThread._id
                                                }
                                                if (req.body.parent) {
                                                    originalMessage._parentMessageId = req.body.parent;
                                                }
                                                const forumMessage = new ForumMessage(originalMessage);
                                                forumMessage.save(error => {
                                                    if (error) {
                                                        res.status(500).send({
                                                            errorMessage: req.i18n.__("Err_ForumMessages_MessageInsertion", error)
                                                        });
                                                    } else {
                                                        /**
                                                         * Handles the translation of the disease name.
                                                         * If the current language is not available, it use the default one.
                                                         */
                                                        var diseaseName;
                                                        var translationLanguages = disease.names.map(item => item.language);
                                                        var reqLanguageIndex = translationLanguages.indexOf(req.i18n.getLocale());
                                                        var defaultLanguageIndex = translationLanguages.indexOf(translationEnv.defaultLanguage);
                                                        if (reqLanguageIndex >= 0) {
                                                            diseaseName = disease.names[reqLanguageIndex].name;
                                                        } else {
                                                            if (defaultLanguageIndex >= 0) {
                                                                diseaseName = disease.names[defaultLanguageIndex].name;
                                                            } else {
                                                                res.status(500).send({
                                                                    errorMessage: req.i18n.__("Err_ForumMessages_MessageInsertion", "Not found translation for default language")
                                                                });
                                                            }
                                                        }

                                                        /**
                                                         * If the author of the message is different from the author of the forum thread,
                                                         * sends a runtime notification.
                                                         */
                                                        if (user.code != forumThread._authorId.code) {
                                                            socketNotification.sendForumReplyNotification(
                                                                req.i18n,
                                                                user.fullname,
                                                                forumThread.title,
                                                                diseaseName,
                                                                forumThread._authorId,
                                                                forumThread._authorId.code,
                                                                (error) => {
                                                                    console.log("Real-time notification sent failed.");
                                                                    res.status(201).json(forumMessage);
                                                                },
                                                                () => {
                                                                    res.status(201).json(forumMessage);
                                                                }
                                                            );
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
        (disease, forumThread, forumMessage) => {
            /**
             * Only a logged user with the same code of the request can update the data.
             */
            if (req.session.user == forumMessage._authorId.code) {

                forumMessage.content = req.body.content;
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
                res.status(401).send({
                    errorMessage: req.i18n.__("Err_UnauthorizedUser")
                });
            }
        }
    );

}


function removeMessageUtility(loggedUser, isModerator, codDisease, codForumThread, codForumMessage,
    errorCallback, unauthorizedCallback, diseaseNotFoundCallback, forumThreadNotFoundCallback, forumMessageNotFoundCallback, doneCallback) {

    searchForumMessage(
        codDisease,
        codForumThread,
        codForumMessage,
        (error) => { errorCallback(error); },
        () => { diseaseNotFoundCallback(); },
        () => { forumThreadNotFoundCallback(); },
        () => { forumMessageNotFoundCallback(); },
        (disease, forumThread, forumMessage) => {
            /**
             * Only a logged user can delete the data.
             */
            if (loggedUser == forumMessage._authorId.code || isModerator) {

                // Deletes the specified message
                ForumMessage.findByIdAndRemove(forumMessage._id)
                    .then(forumMessage => {
                        // Checks that the forum message has been found
                        if (!forumMessage) {
                            forumMessageNotFoundCallback();
                        } else {
                            // Deletes child messages
                            ForumMessage.remove({ _parentMessageId: forumMessage._id }, (error) => {
                                if (error) {
                                    errorCallback(error);
                                } else {
                                    doneCallback(disease, forumThread, forumMessage);
                                }
                            });
                        }
                    })
                    .catch(error => {
                        if (error) {
                            errorCallback(error);
                        }
                    });
                
            } else {
                unauthorizedCallback();
            }
        }
    );

}


function deleteForumMessage(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idForumThread = parseInt(req.params.idForumThread, 10);
    const idForumMessage = parseInt(req.params.idForumMessage, 10);

    removeMessageUtility(
        req.session.user,
        req.session.isModerator,
        idDisease,
        idForumThread,
        idForumMessage,
        (error) => {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_ForumMessages_MessageDeletion", error)
            });
        },
        () => {
            res.status(401).send({
                errorMessage: req.i18n.__("Err_UnauthorizedUser")
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
        (disease, forumThread, forumMessage) => {
            res.status(200).send({
                infoMessage: req.i18n.__("ForumMessageDeletion_Completed")
            });
        }
    );

}


function postUtilityVote(req, res) {

    searchForumMessage(
        req.body.codDisease,
        req.body.codForumThread,
        req.body.codForumMessage,
        (error) => {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_ForumMessages_UtilityVoteInsertion", error)
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
        (disease, forumThread, forumMessage) => {
            /**
             * Only a logged user can add an utility vote to a message.
             */
            if (req.session.user) {

                /**
                 * Searches the user with the specified code.
                 */
                User.findOne({ code: req.session.user }, (error, user) => {
                    if (error) {
                        res.status(500).send({
                            errorMessage: req.i18n.__("Err_ForumMessages_UtilityVoteInsertion", error)
                        });
                    } else {
                        if (!user) {
                            res.status(404).send({
                                errorMessage: req.i18n.__("Err_ForumMessages_UserNotFound")
                            });
                        } else {
                            // Checks for duplicate user votes
                            if (forumMessage.utility_votes.map(item => item.user.toString()).indexOf(user.id) < 0) {

                                // Adds the new user utility vote
                                forumMessage.utility_votes.push({
                                    user: user._id,
                                    vote: req.body.vote
                                });
                                forumMessage.save(error => {
                                    if (error) {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_ForumMessages_UtilityVoteInsertion", error)
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
                        }
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


function putUtilityVote(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idForumThread = parseInt(req.params.idForumThread, 10);
    const idForumMessage = parseInt(req.params.idForumMessage, 10);

    searchForumMessage(
        idDisease,
        idForumThread,
        idForumMessage,
        (error) => {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_ForumMessages_UtilityVoteUpdate", error)
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
        (disease, forumThread, forumMessage) => {
            /**
             * Only a logged user can update an utility vote for a message.
             */
            if (req.session.user) {

                /**
                 * Searches the user with the specified code.
                 */
                User.findOne({ code: req.session.user }, (error, user) => {
                    if (error) {
                        res.status(500).send({
                            errorMessage: req.i18n.__("Err_ForumMessages_UtilityVoteUpdate", error)
                        });
                    } else {
                        if (!user) {
                            res.status(404).send({
                                errorMessage: req.i18n.__("Err_ForumMessages_UserNotFound")
                            });
                        } else {

                            // Checks the existance of an utility vote for the logged user
                            const voteIndex = forumMessage.utility_votes.map(item => item.user.toString()).indexOf(user.id);
                            if (voteIndex >= 0) {

                                // Updates the user utility vote
                                forumMessage.utility_votes[voteIndex].vote = req.body.vote;
                                forumMessage.save(error => {
                                    if (error) {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_ForumMessages_UtilityVoteUpdate", error)
                                        });
                                    } else {
                                        res.status(200).json(forumMessage);
                                    }
                                });

                            } else {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_ForumMessages_NoUserUtilityVote")
                                });
                            }
                        }
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


function removeUtilityVote(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idForumThread = parseInt(req.params.idForumThread, 10);
    const idForumMessage = parseInt(req.params.idForumMessage, 10);

    searchForumMessage(
        idDisease,
        idForumThread,
        idForumMessage,
        (error) => {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_ForumMessages_UtilityVoteDeletion", error)
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
        (disease, forumThread, forumMessage) => {
            /**
             * Only a logged user can delete an utility vote for a message.
             */
            if (req.session.user) {

                /**
                 * Searches the user with the specified code.
                 */
                User.findOne({ code: req.session.user }, (error, user) => {
                    if (error) {
                        res.status(500).send({
                            errorMessage: req.i18n.__("Err_ForumMessages_UtilityVoteDeletion", error)
                        });
                    } else {
                        if (!user) {
                            res.status(404).send({
                                errorMessage: req.i18n.__("Err_ForumMessages_UserNotFound")
                            });
                        } else {

                            // Checks the existance of an utility vote for the logged user
                            const voteIndex = forumMessage.utility_votes.map(item => item.user).indexOf(user._id);
                            if (voteIndex >= 0) {

                                // Removes the user utility vote
                                forumMessage.utility_votes.splice(voteIndex, 1);
                                forumMessage.save(error => {
                                    if (error) {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_ForumMessages_UtilityVoteDeletion", error)
                                        });
                                    } else {
                                        res.status(200).json(forumMessage);
                                    }
                                });

                            } else {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_ForumMessages_NoUserUtilityVote")
                                });
                            }
                        }
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


function reportForumMessage(req, res) {

    const idDisease = parseInt(req.body.codDisease, 10);
    const idForumThread = parseInt(req.body.codForumThread, 10);
    const idForumMessage = parseInt(req.body.codForumMessage, 10);

    removeMessageUtility(
        req.session.user,
        req.session.isModerator,
        idDisease,
        idForumThread,
        idForumMessage,
        (error) => {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_ForumMessages_MessageReporting", error)
            });
        },
        () => {
            res.status(401).send({
                errorMessage: req.i18n.__("Err_UnauthorizedUser")
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
        (disease, forumThread, forumMessage) => {

            /**
             * Handles the translation of the disease name.
             * If the current language is not available, it use the default one.
             */
            var diseaseName;
            var translationLanguages = disease.names.map(item => item.language);
            var reqLanguageIndex = translationLanguages.indexOf(req.i18n.getLocale());
            var defaultLanguageIndex = translationLanguages.indexOf(translationEnv.defaultLanguage);
            if (reqLanguageIndex >= 0) {
                diseaseName = disease.names[reqLanguageIndex].name;
            } else {
                if (defaultLanguageIndex >= 0) {
                    diseaseName = disease.names[defaultLanguageIndex].name;
                } else {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_ForumMessages_MessageReporting", "Not found translation for default language")
                    });
                }
            }

            User.findById(forumMessage._authorId).exec((error, user) => {
                if (error) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_ForumMessages_MessageReporting", error)
                    });
                } else {
                    // Sends runtime message to the author
                    socketNotification.sendMessageReportNotification(
                        req.i18n,
                        forumMessage.content,
                        forumThread.title,
                        diseaseName,
                        user._id,
                        user.code,
                        (error) => {
                            console.log("Real-time notification sent failed.");
                            res.status(200).send({
                                infoMessage: req.i18n.__("ForumMessageReporting_Completed")
                            });
                        },
                        () => {
                            res.status(200).send({
                                infoMessage: req.i18n.__("ForumMessageReporting_Completed")
                            });
                        }
                    );
                }
            });
            
        }
    );
    
}


module.exports = {
    postForumMessage,
    putForumMessage,
    deleteForumMessage,
    postUtilityVote,
    putUtilityVote,
    removeUtilityVote,
    reportForumMessage
};