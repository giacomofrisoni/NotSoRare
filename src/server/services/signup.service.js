// Module and constant for salt and password hashing handling
const bcrypt = require('bcrypt');
const BCRYPT_SALT_ROUNDS = 10;

// Module for guid generation
const uuidV1 = require('uuid/v1');

// Modules for managing queries and transactions on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const ISOLATION_LEVEL = require('tedious').ISOLATION_LEVEL;

// Request for connection to the relational database
const sql = require('../sql');

// Module for email utilities
const email = require('../utilities/email_util');

// Mongoose model for an user
const User = require('../models/user.model');

// Module for cookie names
const cookiesEnv = require('../env/cookies_environment');


function signup(req, res) {

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to check if already exists an account with the specified email address.
     */
    checkRequest = new Request("SELECT COUNT(*) FROM StandardUser WHERE Email = @Email;", (queryError, rowCount, rows) => {
        if (queryError) {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_Signup_EmailChecking", queryError)
            });
        } else {

            // The select operation concerns a single row
            if (rowCount == 0) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_Signup_EmailChecking")
                });
            } else {

                // Checks for a invalid counter value
                if (rows[0][0].value === null) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Signup_EmailChecking")
                    });
                } else {

                    // Checks if there is a registered account with the same email
                    if (rows[0][0].value >= 1) {
                        res.status(500).send({
                            errorMessage: req.i18n.__("Err_Signup_AlreadyUsedEmail")
                        });
                    } else {

                        // Performs the hashing operation on the specified password in order to store it as encrypted text
                        bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS, (bcryptError, hashedPassword) => {
                                                
                            // Checks for encryption error
                            if (bcryptError) {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_Signup_PasswordEncryption", bcryptError)
                                });
                            } else {

                                // Generates a random number of 6 digits
                                const activationCode = Math.floor(100000 + Math.random() * 900000);

                                /**
                                 * Handles a transaction in order to rollback from sql insertion if the mongo one fails
                                 * or another error occurres.
                                 */
                                sql.connection.transaction((error, done) => {
                                    if (error) {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_Signup_BeginTransaction")
                                        });
                                    } else {

                                        /**
                                         * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                         * in order to register the new user account.
                                         */
                                        insertRequest = new Request(
                                            "INSERT StandardUser (Id, Email, Password, Name, Surname, Gender, BirthDate, Nationality, RegistrationDate, PatientYN, " + (req.body.patientYN ? "" : "PatientName, PatientSurname, PatientGender, PatientBirthDate, PatientNationality, ") + "ActivationCode, Photo, Biography) " +
                                            "VALUES (@Id, @Email, @Password, @Name, @Surname, @Gender, @BirthDate, @Nationality, CURRENT_TIMESTAMP, @PatientYN, " + (req.body.patientYN ? "" : "@PatientName, @PatientSurname, @PatientGender, @PatientBirthDate, @PatientNationality, ") + "@ActivationCode, " + (req.body.photo ? "@Photo" : "NULL") + ", " + (req.body.biography ? "@Biography" : "NULL") + ");", (queryError, rowCount) => {
                                            if (queryError) {
                                                done(null, () => {
                                                    res.status(500).send({
                                                        errorMessage: req.i18n.__("Err_Signup_UserSaving", queryError)
                                                    });
                                                });
                                            } else {

                                                // The operation concerns a single row
                                                if (rowCount == 0) {
                                                    done(null, () => {
                                                        res.status(500).send({
                                                            errorMessage: req.i18n.__("Err_Signup_UserSaving", queryError)
                                                        });
                                                    });
                                                } else {

                                                    /**
                                                     * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                                     * in order to get the id of the new user account.
                                                     */
                                                    idRequest = new Request("SELECT @@IDENTITY;", (queryError, rowCount, rows) => {
                                                        if (queryError) {
                                                            done(queryError, () => {
                                                                res.status(500).send({
                                                                    errorMessage: req.i18n.__("Err_Signup_CodeUserQuery", queryError)
                                                                });
                                                            });
                                                        } else {

                                                            // The select operation concerns a single row
                                                            if (rowCount == 0) {
                                                                done(new Error(), () => {
                                                                    res.status(500).send({
                                                                        errorMessage: req.i18n.__("Err_Signup_InvalidCodeUser")
                                                                    });
                                                                });
                                                            } else {

                                                                // Checks for a invalid code user value
                                                                if (rows[0][0].value === null) {
                                                                    done(new Error(), () => {
                                                                        res.status(500).send({
                                                                            errorMessage: req.i18n.__("Err_Signup_InvalidCodeUser")
                                                                        });
                                                                    });
                                                                } else {
                                                                    const codeNewUser = rows[0][0].value;

                                                                    // Stores the user data into mongo database
                                                                    var originalUser = {
                                                                        code: codeNewUser,
                                                                        first_name: req.body.name,
                                                                        last_name: req.body.surname,
                                                                        gender: req.body.gender,
                                                                        birth_date: req.body.birthDate,
                                                                        is_anonymous: false
                                                                    }
                                                                    if (req.body.photo) {
                                                                        originalUser.photo = req.body.photo;
                                                                    }
                                                                    const user = new User(originalUser);
                                                                    user.save(error => {
                                                                        if (error) {
                                                                            // Rollback the sql insertion if the mongo one fails
                                                                            done(error, () => {
                                                                                res.status(500).send({
                                                                                    errorMessage: req.i18n.__("Err_Signup_UserSaving", error)
                                                                                });
                                                                            });
                                                                        } else {

                                                                            // Commit the transaction
                                                                            done(null, () => {
                                                                                console.log("User '" + req.body.name + " " + req.body.surname + "' successfully registered with code " + codeNewUser + ".");

                                                                                // Sends the activation code email
                                                                                email.sendHTML(
                                                                                    req.body.name + " " + req.body.surname + " <" + req.body.email + ">",
                                                                                    req.i18n.__("Signup_EmailSubject"),
                                                                                    req.i18n.__("Signup_HTMLEmailContent", req.body.name, req.body.surname, activationCode),
                                                                                    (error, info) => {
                                                                                        if (error) {
                                                                                            // If the email sending fails the user data remain saved into the databases
                                                                                            res.status(500).send({
                                                                                                errorMessage: req.i18n.__("Err_Signup_EmailSending", error)
                                                                                            });
                                                                                        } else {
                                                                                            console.log("Mail message sent: " + info.messageId);
                                                                                            res.status(201).send({
                                                                                                infoMessage: req.i18n.__("Signup_Completed")
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                )
                                                                            });

                                                                        }
                                                                    });
                                                                }
                                                            }

                                                        }
                                                    });

                                                    // Performs the user id code selection query on the relational database
                                                    sql.connection.execSql(idRequest);

                                                }

                                            }
                                        });
                                        insertRequest.addParameter('Id', TYPES.NVarChar, uuidV1()); // Generates a v1 UUID (time-based): '6c84fb90-12c4-11e1-840d-7b25c5ee775a'
                                        insertRequest.addParameter('Email', TYPES.NVarChar, req.body.email);
                                        insertRequest.addParameter('Password', TYPES.NVarChar, hashedPassword);
                                        insertRequest.addParameter('Name', TYPES.NVarChar, req.body.name);
                                        insertRequest.addParameter('Surname', TYPES.NVarChar, req.body.surname);
                                        insertRequest.addParameter('Gender', TYPES.Char, req.body.gender);
                                        insertRequest.addParameter('BirthDate', TYPES.Date, req.body.birthDate);
                                        insertRequest.addParameter('Nationality', TYPES.NVarChar, req.body.nationality);
                                        insertRequest.addParameter('PatientYN', TYPES.Bit, req.body.patientYN);
                                        if (!req.body.patientYN) {
                                            insertRequest.addParameter('PatientName', TYPES.NVarChar, req.body.patientName);
                                            insertRequest.addParameter('PatientSurname', TYPES.NVarChar, req.body.patientSurname);
                                            insertRequest.addParameter('PatientGender', TYPES.Char, req.body.patientGender);
                                            insertRequest.addParameter('PatientBirthDate', TYPES.Date, req.body.patientBirthDate);
                                            insertRequest.addParameter('PatientNationality', TYPES.NVarChar, req.body.patientNationality);
                                        }
                                        insertRequest.addParameter('ActivationCode', TYPES.NChar, activationCode);
                                        if (req.body.photo) {
                                            insertRequest.addParameter('Photo', TYPES.VarBinary, req.body.photo);
                                        }
                                        if (req.body.biography) {
                                            insertRequest.addParameter('Biography', TYPES.NVarChar, req.body.biography);
                                        }

                                        // Performs the insertion query on the relational database
                                        sql.connection.execSql(insertRequest);

                                    }
                                }, "INSERT_TRANSACTION", ISOLATION_LEVEL.SNAPSHOT);

                            }

                        });

                    }
                }

            }

        }
    });
    checkRequest.addParameter('Email', TYPES.NVarChar, req.body.email);

    // Performs the email control on the relational database
    sql.connection.execSql(checkRequest);

}


function activate(req, res) {

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to retrieve the activation code for the account with the specified email address.
     */
    codeRequest = new Request("SELECT IsActivated, ActivationCode FROM StandardUser WHERE Email = @Email;", (queryError, rowCount, rows) => {
        if (queryError) {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_Activation", queryError)
            });
        } else {

            /**
             * The operation concerns a single row.
             * If zero rows are affected, it means that there is no user with the specified id code.
             */
            if (rowCount == 0) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_Activation_InvalidEmail")
                });
            } else {
                var userData = [];

                // Parses the data from each of the row and populate the user data json array 
                for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                    var rowObject = {};
                    var singleRowData = rows[rowIndex];
                    for (var colIndex = 0; colIndex < singleRowData.length; colIndex++) {
                        var tempColName = singleRowData[colIndex].metadata.colName;
                        var tempColData = singleRowData[colIndex].value;
                        if (tempColData === null) {
                            res.status(500).send({
                                errorMessage: req.i18n.__("Err_Activation", "Invalid value")
                            });
                        }
                        rowObject[tempColName] = tempColData;
                    }
                    userData.push(rowObject);
                }

                 // Checks if the account has been activated
                if (userData[0].IsActivated) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Activation_AlreadyActivated")
                    });
                } else {
                    // Checks if the specified code is valid
                    if (userData[0].ActivationCode == req.body.activationCode) {
                        /**
                         * Prepares the SQL statement with parameters for SQL-injection avoidance,
                         * in order to activate the account.
                         */
                        activationRequest = new Request("UPDATE StandardUser SET IsActivated = 1 WHERE Email = @Email;", (queryError) => {
                            if (queryError) {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_Activation", queryError)
                                });
                            } else {
                                res.status(200).send({
                                    infoMessage: req.i18n.__("Activation_Completed")
                                });
                            }
                        });
                        activationRequest.addParameter('Email', TYPES.NVarChar, req.body.email);

                        // Performs the account activation on the relational database
                        sql.connection.execSql(activationRequest);
                    } else {
                        // Invalid code
                        res.status(401).send({
                            errorMessage: req.i18n.__("Err_Activation_InvalidCode")
                        });
                    }
                }

            }
        }
    });
    codeRequest.addParameter('Email', TYPES.NVarChar, req.body.email);

    // Performs the activation code retrieving on the relational database
    sql.connection.execSql(codeRequest);

}


module.exports = {
    signup,
    activate
};