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

                // Deletes the specified message
                ForumMessage.findByIdAndRemove(forumMessage._id)
                    .then(forumMessage => {
                        // Checks that the forum message has been found
                        if (!forumMessage) {
                            res.status(404).send({
                                errorMessage: req.i18n.__("Err_ForumMessages_MessageNotFound")
                            });
                        } else {
                            // Deletes child messages
                            ForumMessage.remove({ _parentMessageId: forumMessage._id }, (error) => {
                                if (error) {
                                    res.status(500).send({
                                        errorMessage: req.i18n.__("Err_ForumMessages_MessageDeletion", error)
                                    });
                                } else {
                                    res.status(200).send({
                                        infoMessage: req.i18n.__("ForumMessageDeletion_Completed")
                                    });
                                }
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
        (forumMessage) => {
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
        (forumMessage) => {
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
        (forumMessage) => {
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


module.exports = {
    postForumMessage,
    putForumMessage,
    deleteForumMessage,
    postUtilityVote,
    putUtilityVote,
    removeUtilityVote
};