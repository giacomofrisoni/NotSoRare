// Modules for managing queries and transactions on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const ISOLATION_LEVEL = require('tedious').ISOLATION_LEVEL;

// Request for connection to the relational database
const sql = require('../sql');

// Module for tedious query result handling
const queryResultHandler = require('../utilities/tedious_query_result_util');

// Mongoose model for an user
const User = require('../models/user.model');


function getUsersStats(req, res) {

    // Gets the total number of users
    globalCountRequest = new Request("SELECT COUNT(*) FROM StandardUser;", (queryError, rowCount, rows) => {
        if (queryError) {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_Users_GlobalCount", queryError)
            });
        } else {
            // The select operation concerns a single row
            if (rowCount == 0) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_Users_GlobalCount")
                });
            } else {

                // Checks for a invalid counter value
                if (rows[0][0].value === null) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Users_GlobalCount")
                    });
                } else {

                    const nTotalUsers = rows[0][0].value;

                    // Gets the number of users for each country
                    countryCountRequest = new Request("SELECT Nationality AS country, COUNT(*) AS countryUsers FROM StandardUser GROUP BY Nationality;", (queryError, rowCount, rows) => {
                        if (queryError) {
                            res.status(500).send({
                                errorMessage: req.i18n.__("Err_Users_CountryCount", queryError)
                            });
                        } else {
                            
                            var usersStats = [];
                            usersStats.push({ totalUsers: nTotalUsers });

                            // Parses the data from each of the row and populate the user statistics json array
                            var countryObject = {};
                            queryResultHandler.addArraySectionToJSONFromRows("countries", rowCount, rows, countryObject, null, true, () => {
                                return res.status(500).send({
                                    errorMessage: req.i18n.__("Err_Users_CountryCount", "Invalid data")
                                });
                            });
                            usersStats.push(countryObject);
                            
                            res.status(200).json(usersStats);

                        }
                    });

                    // Performs the country user counter retrieving on the relational database
                    sql.connection.execSql(countryCountRequest);
                }

            }
        }
    });

    // Performs the global user counter retrieving on the relational database
    sql.connection.execSql(globalCountRequest);

}


function getUser(req, res) {

    const id = parseInt(req.params.id, 10);

    /**
     * Only a logged user whit the same code of the request can retrieve the data.
     */
    if (req.session.user == id) {

        /**
         * Prepares the SQL statement with parameters for SQL-injection avoidance,
         * in order to obtain the registered user data.
         */
        userRequest = new Request(
            "SELECT Email, Surname, Name, Gender, BirthDate, Nationality, AnonymousYN, Photo, Biography, RegistrationDate, PatientYN, PatientName, PatientSurname, PatientGender, PatientBirthDate, PatientNationality " +
            "FROM StandardUser WHERE CodUser = @CodUser;", (queryError, rowCount, rows) => {
                if (queryError) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Users_UserInfo", queryError)
                    });
                } else {
                    // The select operation concerns a single row
                    if (rowCount == 0) {
                        res.status(404).send({
                            errorMessage: req.i18n.__("Err_Users_UserNotFound")
                        });
                    } else {

                        // Parses the data from each of the row and populate the user statistics json array
                        const userInfo = queryResultHandler.getJSONFromRow(rows[0]);
                        
                        res.status(200).json(userInfo);

                    }
                }
            }
        );
        userRequest.addParameter('CodUser', TYPES.Numeric, id);

        // Performs the info selection query on the relational database
        sql.connection.execSql(userRequest);

    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


function putUser(req, res) {
    
    const id = parseInt(req.params.id, 10);

    /**
     * Only a logged user whit the same code of the request can update the data.
     */
    if (req.session.user == id) {

        /**
         * Handles a transaction in order to rollback from sql update if the mongo one fails
         * or another error occurres.
         */
        sql.connection.transaction((error, done) => {
            if (error) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_Users_BeginUpdateTransaction")
                });
            } else {
                /**
                 * Prepares the SQL statement with parameters for SQL-injection avoidance,
                 * in order to update the registered user account.
                 */
                updateRequest = new Request(
                    "UPDATE StandardUser " +
                    "SET Email = @Email, Name = @Name, Surname = @Surname, Gender = @Gender, BirthDate = @BirthDate, Nationality = @Nationality, AnonymousYN = @AnonymousYN, Photo = " + (req.body.photo ? "@Photo" : "NULL") + ", Biography = " + (req.body.biography ? "@Biography" : "NULL") + " " +
                    "WHERE CodUser = @CodUser;", (queryError, rowCount) => {
                        if (queryError) {
                            res.status(500).send({
                                errorMessage: req.i18n.__("Err_Users_UserUpdate", queryError)
                            });
                        } else {

                            /**
                             * The operation concerns a single row.
                             * If zero rows are affected, it means that there is no user with the specified id code.
                             */
                            if (rowCount == 0) {
                                done(null, () => {
                                    res.status(404).send({
                                        errorMessage: req.i18n.__("Err_Users_UserNotFound")
                                    });
                                });
                            } else {
                                /**
                                 * The update on relational database was successful.
                                 * Now updates data on mongo database.
                                 */
                                var updatedUser = {
                                    first_name: req.body.name,
                                    last_name: req.body.surname,
                                    gender: req.body.gender,
                                    birth_date: req.body.birthDate,
                                    is_anonymous: req.body.isAnonymous
                                };
                                if (req.body.photo) {
                                    updatedUser.photo = req.body.photo;
                                }
                                User.findOne({ code: id }, (error, user) => {
                                    // Checks server error
                                    if (error) {
                                        // Rollback the sql update if the mongo one fails
                                        done(error, () => {
                                            res.status(500).send({
                                                errorMessage: req.i18n.__("Err_Users_UserUpdate", error)
                                            });
                                        });
                                    } else {
                                        // Checks that the user has been found
                                        if (!user) {
                                            // Rollback the sql update
                                            done(error, () => {
                                                res.status(404).send({
                                                    errorMessage: req.i18n.__("Err_Users_UserNotFound", error)
                                                });
                                            });
                                        } else {
                                            user.first_name = updatedUser.first_name;
                                            user.last_name = updatedUser.last_name;
                                            user.gender = updatedUser.gender;
                                            user.birth_date = updatedUser.birth_date;
                                            user.is_anonymous = updatedUser.is_anonymous;
                                            if (req.body.photo) {
                                                user.photo = updatedUser.photo;
                                            }
                                            user.save(error => {
                                                if (error) {
                                                    // Rollback the sql update if the mongo one fails
                                                    done(error, () => {
                                                        res.status(500).send({
                                                            errorMessage: req.i18n.__("Err_Users_UserUpdate", error)
                                                        });
                                                    });
                                                } else {
                                                    // Commit the transaction
                                                    done(null, () => {
                                                        res.status(200).send(req.i18n.__("UserUpdate_Completed"));
                                                    });
                                                }
                                            });
                                        }
                                    }
                                })
                            }

                        }
                    }
                );
                updateRequest.addParameter('Email', TYPES.NVarChar, req.body.email);
                updateRequest.addParameter('Name', TYPES.NVarChar, req.body.name);
                updateRequest.addParameter('Surname', TYPES.NVarChar, req.body.surname);
                updateRequest.addParameter('Gender', TYPES.Char, req.body.gender);
                updateRequest.addParameter('BirthDate', TYPES.Date, req.body.birthDate);
                updateRequest.addParameter('Nationality', TYPES.NVarChar, req.body.nationality);
                updateRequest.addParameter('AnonymousYN', TYPES.Bit, req.body.isAnonymous);
                if (req.body.photo) {
                    updateRequest.addParameter('Photo', TYPES.VarBinary, req.body.photo);
                }
                if (req.body.biography) {
                    updateRequest.addParameter('Biography', TYPES.NVarChar, req.body.biography);
                }
                updateRequest.addParameter('CodUser', TYPES.Numeric, id);

                // Performs the update query on the relational database
                sql.connection.execSql(updateRequest);
            }
        }, "USER_UPDATE_TRANSACTION", ISOLATION_LEVEL.SNAPSHOT);

    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }
    
}


function deleteUser(req, res) {

    const id = parseInt(req.params.id, 10);

    /**
     * Only a logged user whit the same code of the request can update the data.
     */
    if (req.session.user == id) {

        /**
         * Handles a transaction in order to rollback from sql delete if the mongo one fails
         * or another error occurres.
         */
        sql.connection.transaction((error, done) => {
            if (error) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_Users_BeginDeleteTransaction")
                });
            } else {
                /**
                 * Prepares the SQL statement with parameters for SQL-injection avoidance,
                 * in order to delete the registered user account.
                 */
                deleteRequest = new Request(
                    "DELETE FROM StandardUser WHERE CodUser = @CodUser;", (queryError, rowCount) => {
                        if (queryError) {
                            res.status(500).send({
                                errorMessage: req.i18n.__("Err_Users_UserDelete", queryError)
                            });
                        } else {

                            /**
                             * The operation concerns a single row.
                             * If zero rows are affected, it means that there is no user with the specified id code.
                             */
                            if (rowCount == 0) {
                                done(null, () => {
                                    res.status(404).send({
                                        errorMessage: req.i18n.__("Err_Users_UserNotFound")
                                    });
                                });
                            } else {
                                /**
                                 * The deletion on relational database was successful.
                                 * Now deletes data on mongo database.
                                 */
                                User.findOneAndRemove({ code: id })
                                    .then(user => {
                                        // Checks that the user has been found
                                        if (!user) {
                                            // Rollback the sql update
                                            done(error, () => {
                                                res.status(404).send({
                                                    errorMessage: req.i18n.__("Err_Users_UserNotFound", error)
                                                });
                                            });
                                        } else {
                                            // Commit the transaction
                                            done(null, () => {
                                                res.status(200).send(req.i18n.__("UserDeletion_Completed"));
                                            });
                                        }
                                    })
                                    .catch(error => {
                                        if (error) {
                                            // Rollback the sql update
                                            done(error, () => {
                                                res.status(404).send({
                                                    errorMessage: req.i18n.__("Err_Users_UserDelete", error)
                                                });
                                            });
                                        }
                                    });
                            }
                        }
                    }
                );

                deleteRequest.addParameter('CodUser', TYPES.Numeric, id);

                // Performs the update query on the relational database
                sql.connection.execSql(deleteRequest);
            }
        }, "USER_DELETE_TRANSACTION", ISOLATION_LEVEL.SNAPSHOT);

    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


module.exports = {
    getUsersStats,
    getUser,
    putUser,
    deleteUser
};