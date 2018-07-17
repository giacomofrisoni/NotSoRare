// Modules for managing queries and transactions on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const ISOLATION_LEVEL = require('tedious').ISOLATION_LEVEL;

// Request for connection to the relational database
const sql = require('../sql');

// Imports mongoose models
const User = require('../models/user.model');
const RareDisease = require('../models/rare_disease.model');
const Forum = require('../models/forum.model');
const ForumThread = require('../models/forum_thread.model');

// Module for translation handling
const translationEnv = require('../env/translation_environment');


function postForumThread(req, res) {

    /**
     * Only a logged user with the same code of the request can add the data.
     */
    if (req.session.user == req.body.codUser) {

        /**
         * Handles a transaction in order to rollback from sql update if the mongo insertion fails
         * or another error occurres.
         */
        sql.connection.transaction((error, done) => {
            if (error) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_ForumThreads_BeginTransaction", error)
                });
            } else {
                /**
                 * Prepares the SQL statement with parameters for SQL-injection avoidance,
                 * in order to increment the number of forum threads for the specified rare disease.
                 */
                updateCounterRequest = new Request(
                    "UPDATE RareDisease " +
                    "SET ForumThreadsNumber = (SELECT ForumThreadsNumber FROM RareDisease WHERE CodDisease = @CodDisease) + 1" +
                    "WHERE CodDisease = @CodDisease", (queryError, rowCount) => {
                        if (queryError) {
                            done(null, () => {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", queryError)
                                });
                            });
                        } else {
                            // The operation concerns a single row
                            if (rowCount == 0) {
                                done(null, () => {
                                    res.status(500).send({
                                        errorMessage: req.i18n.__("Err_ForumThreads_DiseaseNotFound")
                                    });
                                });
                            } else {

                                /**
                                 * Searches the user with the specified code.
                                 */
                                User.findOne({ code: req.body.codUser }, (error, user) => {
                                    if (error) {
                                        // Rollback the sql update
                                        done(error, () => {
                                            res.status(500).send({
                                                errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", error)
                                            });
                                        });
                                    } else {
                                        if (!user) {
                                            // Rollback the sql update
                                            done(new Error(), () => {
                                                res.status(404).send({
                                                    errorMessage: req.i18n.__("Err_ForumThreads_UserNotFound")
                                                });
                                            });
                                        } else {

                                            /**
                                             * Searches the rare disease with the specified code.
                                             */
                                            RareDisease.findOne({ code: req.body.codDisease }, (error, disease) => {
                                                if (error) {
                                                    // Rollback the sql update
                                                    done(error, () => {
                                                        res.status(500).send({
                                                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", error)
                                                        });
                                                    });
                                                } else {
                                                    if (!disease) {
                                                        // Rollback the sql update
                                                        done(new Error(), () => {
                                                            res.status(404).send({
                                                                errorMessage: req.i18n.__("Err_ForumThreads_DiseaseNotFound")
                                                            });
                                                        });
                                                    } else {

                                                        /**
                                                         * Checks for duplicate title inside rare disease forum.
                                                         */
                                                        ForumThread.count({ _forumId: disease._forumId, title: req.body.title }, (error, count) => {
                                                            if (error) {
                                                                // Rollback the sql update
                                                                done(error, () => {
                                                                    res.status(500).send({
                                                                        errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", error)
                                                                    });
                                                                });
                                                            } else {
                                                                if (count > 0) {
                                                                    // Rollback the sql update
                                                                    done(new Error(), () => {
                                                                        res.status(500).send({
                                                                            errorMessage: req.i18n.__("Err_ForumThreads_DuplicateTitle")
                                                                        });
                                                                    });
                                                                } else {

                                                                    // Adds the forum thread
                                                                    var originalForumThread = {
                                                                        title: req.body.title,
                                                                        description: req.body.description,
                                                                        _authorId: user._id,
                                                                        _forumId: disease._forumId,
                                                                    }
                                                                    const forumThread = new ForumThread(originalForumThread);
                                                                    forumThread.save(error => {
                                                                        if (error) {
                                                                            // Rollback the sql update
                                                                            done(error, () => {
                                                                                res.status(500).send({
                                                                                    errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", error)
                                                                                });
                                                                            });
                                                                        } else {
                                                                            // Commit the transaction
                                                                            done(null, () => {
                                                                                res.status(201).json(forumThread);
                                                                            });
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

                            }
                        }
                    }
                );
                updateCounterRequest.addParameter('CodDisease', TYPES.Numeric, req.body.codDisease);

                // Performs the rare disease experiences counter update query on the relational database
                sql.connection.execSql(updateCounterRequest);
            }
        }, "FORUM_THREAD_INSERTION_TRANSACTION", ISOLATION_LEVEL.SNAPSHOT);

    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }
}


function putForumThread(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idForumThread = parseInt(req.params.idForumThread, 10);

    /**
     * Searches the rare disease with the specified code.
     */
    RareDisease.findOne({ code: idDisease }, (error, disease) => {
        if (error) {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_ForumThreads_ThreadUpdate", error)
            });
        } else {
            if (!disease) {
                res.status(404).send({
                    errorMessage: req.i18n.__("Err_ForumThreads_DiseaseNotFound")
                });
            } else {
                /**
                 * Searches the forum thread inside the found disease and with the specified code.
                 */
                ForumThread.findOne({ _forumId: disease._forumId, code: idForumThread }).populate('_authorId').exec((error, forumThread) => {
                    if (error) {
                        res.status(500).send({
                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadUpdate", error)
                        });
                    } else {
                        if (!forumThread) {
                            res.status(404).send({
                                errorMessage: req.i18n.__("Err_ForumThreads_ThreadNotFound")
                            });
                        } else {
                            /**
                             * Only a logged user with the same code of the request can update the data.
                             */
                            if (req.session.user == forumThread._authorId.code) {

                                forumThread.title = req.body.title;
                                forumThread.description = req.body.description;
                                forumThread.save(error => {
                                    if (error) {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadUpdate", error)
                                        });
                                    } else {
                                        res.status(200).json(forumThread);
                                    }
                                });

                            } else {
                                res.status(401).send({
                                    errorMessage: req.i18n.__("Err_UnauthorizedUser")
                                });
                            }
                        }
                    }
                });
            }
        }
    });

}


function deleteForumThread(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idForumThread = parseInt(req.params.idForumThread, 10);

    /**
     * Handles a transaction in order to rollback from sql update if the mongo deletion fails
     * or another error occurres.
     */
    sql.connection.transaction((error, done) => {
        if (error) {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_ForumThreads_BeginTransaction", error)
            });
        } else {
            /**
             * Prepares the SQL statement with parameters for SQL-injection avoidance,
             * in order to decrement the number of forum threads for the specified rare disease.
             */
            updateCounterRequest = new Request(
                "UPDATE RareDisease " +
                "SET ForumThreadsNumber = (SELECT ForumThreadsNumber FROM RareDisease WHERE CodDisease = @CodDisease) - 1" +
                "WHERE CodDisease = @CodDisease", (queryError, rowCount) => {
                    if (queryError) {
                        done(null, () => {
                            res.status(500).send({
                                errorMessage: req.i18n.__("Err_ForumThreads_ThreadDeletion", queryError)
                            });
                        });
                    } else {
                        // The operation concerns a single row
                        if (rowCount == 0) {
                            done(null, () => {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_ForumThreads_DiseaseNotFound")
                                });
                            });
                        } else {

                            /**
                             * Searches the rare disease with the specified code.
                             */
                            RareDisease.findOne({ code: idDisease }, (error, disease) => {
                                if (error) {
                                    // Rollback the sql update
                                    done(error, () => {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadDeletion", error)
                                        });
                                    });
                                } else {
                                    if (!disease) {
                                        // Rollback the sql update
                                        done(new Error(), () => {
                                            res.status(404).send({
                                                errorMessage: req.i18n.__("Err_ForumThreads_DiseaseNotFound")
                                            });
                                        });
                                    } else {

                                        /**
                                        * Searches and removes the forum thread inside the found disease and with the specified code.
                                        */
                                        ForumThread.findOne({ _forumId: disease._forumId, code: idForumThread }).populate('_authorId').exec((error, forumThread) => {
                                            if (error) {
                                                // Rollback the sql update
                                                done(error, () => {
                                                    res.status(500).send({
                                                        errorMessage: req.i18n.__("Err_ForumThreads_ThreadDeletion", error)
                                                    });
                                                });
                                            } else {
                                                if (!forumThread) {
                                                    // Rollback the sql update
                                                    done(new Error(), () => {
                                                        res.status(404).send({
                                                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadNotFound")
                                                        });
                                                    });
                                                } else {
                                                    /**
                                                    * Only a logged user with the same code of the thread author can delete the data.
                                                    */
                                                    if (req.session.user == forumThread._authorId.code) {

                                                        ForumThread.findByIdAndRemove(forumThread._id)
                                                            .then(forumThread => {
                                                                // Checks that the forum thread has been found
                                                                if (!forumThread) {
                                                                    // Rollback the sql update
                                                                    done(new Error(), () => {
                                                                        res.status(404).send({
                                                                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadNotFound", error)
                                                                        });
                                                                    });
                                                                } else {
                                                                    // Commit the transaction
                                                                    done(null, () => {
                                                                        res.status(200).send({
                                                                            infoMessage: req.i18n.__("ForumThreadDeletion_Completed")
                                                                        });
                                                                    });
                                                                }
                                                            })
                                                            .catch(error => {
                                                                if (error) {
                                                                    // Rollback the sql update
                                                                    done(error, () => {
                                                                        res.status(500).send({
                                                                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadDeletion", error)
                                                                        });
                                                                    });
                                                                }
                                                            });

                                                    } else {
                                                        // Rollback the sql update
                                                        done(new Error(), () => {
                                                            res.status(401).send({
                                                                errorMessage: req.i18n.__("Err_UnauthorizedUser")
                                                            });
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                        
                                    }
                                }
                            });

                        }
                    }
                }
            );
            updateCounterRequest.addParameter('CodDisease', TYPES.Numeric, idDisease);

            // Performs the rare disease experiences counter update query on the relational database
            sql.connection.execSql(updateCounterRequest);
        }
    }, "FORUM_THREAD_DELETION_TRANSACTION", ISOLATION_LEVEL.SNAPSHOT);

}


function getRareDiseaseForumThreads(req, res) {

    const id = parseInt(req.params.id, 10);

    /**
     * Only a logged user can access to forum data.
     */
    if (req.session.user) {

        /**
         * Searches the rare disease with the specified code.
         */
        RareDisease.findOne({ code: id }, (error, disease) => {
            if (error) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_ForumThreads_GettingThreads", error)
                });
            } else {
                if (!disease) {
                    res.status(404).send({
                        errorMessage: req.i18n.__("Err_ForumThreads_DiseaseNotFound")
                    });
                } else {

                    /**
                     * Searches the forum threads associated to the forum of the found disease.
                     */
                    ForumThread.find({ _forumId: disease._forumId })
                        .populate('_authorId')
                        .populate('messages', 'update_date')
                        .select('code title description views messages_count last_activity_date')
                        .exec((error, forumThreads) => {
                            if (error) {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_ForumThreads_GettingThreads", error)
                                });
                            } else {
                                /**
                                 * Parses the resulting json.
                                 */
                                var parsedForumThreads = [];
                                for (var i = 0; i < forumThreads.length; i++) {
                                    var forumThread = {};
                                    forumThread["code"] = forumThreads[i].code;
                                    forumThread["title"] = forumThreads[i].title;
                                    forumThread["description"] = forumThreads[i].description;
                                    forumThread["views"] = forumThreads[i].views;
                                    forumThread["messages_count"] = forumThreads[i].messages_count;
                                    forumThread["last_activity_date"] = forumThreads[i].last_activity_date;
                                    forumThread["author"] = {
                                        "code": forumThreads[i]._authorId.code,
                                        "is_anonymous": forumThreads[i]._authorId.is_anonymous,
                                        "first_name": forumThreads[i]._authorId.first_name,
                                        "last_name": forumThreads[i]._authorId.last_name,
                                        "fullname": forumThreads[i]._authorId.fullname,
                                        "photo": forumThreads[i]._authorId.photo
                                    };
                                    parsedForumThreads.push(forumThread);
                                }
                                res.status(200).json(parsedForumThreads);
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


function getUserForumThreads(req, res) {

    const id = parseInt(req.params.id, 10);

    /**
     * Only a logged user can access to forum data.
     */
    if (req.session.user) {

        User.findOne({ code: id })
            .populate({
                path: 'forumThreads',
                populate: {
                    path: '_forumId',
                    model: 'Forum',
                    populate: {
                        path: '_diseaseId',
                        model: 'RareDisease'
                    }
                }
            })
            .exec((error, user) => {
                if (error) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_ForumThreads_GettingThreads", error)
                    });
                } else {
                    if (!user) {
                        res.status(404).send({
                            errorMessage: req.i18n.__("Err_ForumThreads_UserNotFound")
                        });
                    } else {
                        
                        /**
                         * Parses the resulting json.
                         */
                        var forumThreads = [];
                        for (var i = 0; i < user.forumThreads.length; i++) {
                            var forumThread = {};
                            forumThread["code"] = user.forumThreads[i].code;
                            forumThread["title"] = user.forumThreads[i].title;
                            forumThread["description"] = user.forumThreads[i].description;

                            /**
                             * Handles the translation of the disease name.
                             * If the current language is not available, it use the default one.
                             */
                            var translationLanguages = user.forumThreads[i]._forumId._diseaseId.names.map(item => item.language);
                            var reqLanguageIndex = translationLanguages.indexOf(req.i18n.getLocale());
                            var defaultLanguageIndex = translationLanguages.indexOf(translationEnv.defaultLanguage);
                            if (reqLanguageIndex >= 0) {
                                forumThread["disease_name"] = user.forumThreads[i]._forumId._diseaseId.names[reqLanguageIndex].name;
                            } else {
                                if (defaultLanguageIndex >= 0) {
                                    forumThread["disease_name"] = user.forumThreads[i]._forumId._diseaseId.names[defaultLanguageIndex].name;
                                } else {
                                    res.status(500).send({
                                        errorMessage: req.i18n.__("Err_ForumThreads_GettingThreads", "Not found translation for default language")
                                    });
                                }
                            }

                            forumThread["creation_date"] = user.forumThreads[i].creation_date;
                            forumThread["update_date"] = user.forumThreads[i].update_date;
                            forumThreads.push(forumThread);
                        }
                        res.status(200).json(forumThreads);
                    }
                }
            });

    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


function getForumThread(req, res) {
    
    const idDisease = parseInt(req.params.idDisease, 10);
    const idThread = parseInt(req.params.idForumThread, 10);

    /**
     * Only a logged user can access to forum data.
     */
    if (req.session.user) {

         /**
         * Searches the rare disease with the specified code.
         */
        RareDisease.findOne({ code: idDisease }, (error, disease) => {
            if (error) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_ForumThreads_GettingThread", error)
                });
            } else {
                if (!disease) {
                    res.status(404).send({
                        errorMessage: req.i18n.__("Err_ForumThreads_DiseaseNotFound")
                    });
                } else {

                    /**
                     * Searches the forum thread associated to the forum of the found disease, with the specified code.
                     */
                    ForumThread.findOne({ _forumId: disease._forumId, code: idThread })
                        .populate('_authorId')
                        .populate({
                            path: 'messages',
                            match: { _parentMessageId: { $exists: false } }
                        })
                        .select('code title description views creation_date update_date past_time')
                        .exec((error, forumThread) => {
                            if (error) {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_ForumThreads_GettingThreads", error)
                                });
                            } else {
                                /**
                                 * Increments the forum views number.
                                 */
                                forumThread.views++;
                                forumThread.save(error => {
                                    if (error) {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadUpdate", error)
                                        });
                                    } else {
                                        /**
                                         * Parses the resulting json.
                                         */
                                        var parsedForumThread = {};
                                        parsedForumThread["code"] = forumThread.code;
                                        parsedForumThread["title"] = forumThread.title;
                                        parsedForumThread["description"] = forumThread.description;
                                        parsedForumThread["views"] = forumThread.views;
                                        parsedForumThread["creation_date"] = forumThread.creation_date;
                                        parsedForumThread["update_date"] = forumThread.update_date;
                                        parsedForumThread["past_time"] = forumThread.past_time;
                                        parsedForumThread["author"] = {
                                            "code": forumThread._authorId.code,
                                            "is_anonymous": forumThread._authorId.is_anonymous,
                                            "first_name": forumThread._authorId.first_name,
                                            "last_name": forumThread._authorId.last_name,
                                            "fullname": forumThread._authorId.fullname,
                                            "photo": forumThread._authorId.photo,
                                            "gender": forumThread._authorId.gender,
                                            "birthDate": forumThread._authorId.birthDate,
                                            "age": forumThread._authorId.age
                                        };
                                        parsedForumThread["messages"] = forumThread.messages;

                                        res.status(200).json(parsedForumThread);
                                    }
                                });
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


module.exports = {
    postForumThread,
    putForumThread,
    deleteForumThread,
    getRareDiseaseForumThreads,
    getUserForumThreads,
    getForumThread
};