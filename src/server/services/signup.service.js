// Module and constant for salt and password hashing handling
const bcrypt = require('bcrypt');
const BCRYPT_SALT_ROUNDS = 10;

// Module for guid generation
const uuidV1 = require('uuid/v1');

// Modules for managing queries on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

// Request for connection to the relational database
const sql = require('../sql');

// Module for email utilities
const email = require('../utilities/email_util');


function signup(req, res) {

    /*
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to check if already exists an account with the specified email address.
     */
    checkRequest = new Request("SELECT COUNT(*) FROM StandardUser WHERE Email = @Email;", (queryError, rowCount, rows) => {
        if (queryError) {
            res.status(500).send({
                errorMessage: queryError
            });
        } else {

            // The operation concerns a single row
            if (rowCount == 0) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_Signup_EmailChecking")
                });
            } else {

                // Checks for a invalid counter value
                if (rows[0].value === null) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Signup_EmailChecking")
                    });
                } else {

                    // Checks if there is a registered account with the same email
                    if (rows[0].value >= 1) {
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

                                /*
                                * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                * in order to register the new user account.
                                */
                                request = new Request("INSERT StandardUser (Id, Email, Password, Name, Surname, Gender, BirthDate, Nationality, RegistrationDate, PatientYN, ActivationCode) " +
                                    "VALUES (@Id, @Email, @Password, @Name, @Surname, @Gender, @BirthDate, @Nationality, CURRENT_TIMESTAMP, @PatientYN, @ActivationCode);", (queryError, rowCount) => {
                                    if (queryError) {
                                        res.status(500).send({
                                            errorMessage: req.i18n.__("Err_Signup_UserSaving", queryError)
                                        });
                                    } else {

                                        if (rowCount == 0) {
                                            res.status(500).send({
                                                errorMessage: req.i18n.__("Err_Signup_UserSaving", queryError)
                                            });
                                        } else {
                                            console.log("User '" + req.body.name + " " + req.body.surname + "' successfully registered.");

                                            email.sendHTML(
                                                req.body.name + " " + req.body.surname + " <" + req.body.email + ">",
                                                req.i18n.__("Signup_EmailSubject"),
                                                req.i18n.__("Signup_HTMLEmailContent", req.body.name, req.body.surname, activationCode),
                                                (error, info) => {
                                                    if (error) {
                                                        res.status(500).send({
                                                            errorMessage: req.i18n.__("Err_Signup_EmailSending", error)
                                                        });
                                                    } else {
                                                        console.log("Mail message sent: " + info.messageId);
                                                        res.status(201).send(req.i18n.__("Signup_Completed"));
                                                    }
                                                }
                                            )
                                        }

                                    }
                                });
                                request.addParameter('Id', TYPES.NVarChar, uuidV1()); // Generates a v1 UUID (time-based): '6c84fb90-12c4-11e1-840d-7b25c5ee775a'
                                request.addParameter('Email', TYPES.NVarChar, req.body.email);
                                request.addParameter('Password', TYPES.NVarChar, hashedPassword);
                                request.addParameter('Name', TYPES.NVarChar, req.body.name);
                                request.addParameter('Surname', TYPES.NVarChar, req.body.surname);
                                request.addParameter('Gender', TYPES.Char, req.body.gender);
                                request.addParameter('BirthDate', TYPES.Date, req.body.birthDate);
                                request.addParameter('Nationality', TYPES.NVarChar, req.body.nationality);
                                request.addParameter('PatientYN', TYPES.Bit, req.body.patientYN);
                                request.addParameter('ActivationCode', TYPES.NChar, activationCode);

                                // Performs the insertion query on the relational database
                                sql.connection.execSql(request);
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

module.exports = {
    signup
};