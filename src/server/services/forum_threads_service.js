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


function postForumThread(req, res) {

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
                                    done(error, () => {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", error)
                                        });
                                    });
                                } else {
                                    if (!user) {
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
                                                done(error, () => {
                                                    res.status(500).send({
                                                        errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", error)
                                                    });
                                                });
                                            } else {
                                                if (!disease) {
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
                                                            done(error, () => {
                                                                res.status(500).send({
                                                                    errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", error)
                                                                });
                                                            });
                                                        } else {
                                                            if (count > 0) {
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
                                                                        done(error, () => {
                                                                            res.status(500).send({
                                                                                errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", error)
                                                                            });
                                                                        });
                                                                    } else {

                                                                        // Adds the thread inside the related forum
                                                                        Forum.findByIdAndUpdate(
                                                                            disease._forumId,
                                                                            { $push: { _threadsIds: forumThread._id } },
                                                                            (error) =>{
                                                                                if (error) {
                                                                                    done(error, () => {
                                                                                        res.status(500).send({
                                                                                            errorMessage: req.i18n.__("Err_ForumThreads_ThreadInsertion", error)
                                                                                        });
                                                                                    });
                                                                                }
                                                                            }
                                                                        )

                                                                        res.status(201).json(forumThread);
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
                ForumThread.findOne({ _forumId: disease._forumId, code: idForumThread}, (error, forumThread) => {
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
                            })
                        }
                    }
                });
            }
        }
    });

}


module.exports = {
    postForumThread,
    putForumThread/*,
    deleteForumThread,
    getRareDiseaseForumThreads,
    getUserForumThreads*/
};