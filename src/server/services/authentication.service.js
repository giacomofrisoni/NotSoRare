// Module and constant for salt and password hashing handling
const bcrypt = require('bcrypt');

// Modules for managing queries on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

// Request for connection to the relational database
const sql = require('../sql');

// Module for tedious query result handling
const queryResultHandler = require('../utilities/tedious_query_result_util');


function login(req, res) {

     /**
      * Prepares the SQL statement with parameters for SQL-injection avoidance,
      * in order to get the stored hashed user password if already exists an account with the specified email address.
      */
    checkRequest = new Request("SELECT CodUser, IsActivated, Password FROM StandardUser WHERE Email = @Email;", (queryError, rowCount, rows) => {
        if (queryError) {
            res.status(500).send({
                errorMessage: queryError
            });
        } else {

            if (rowCount == 0) {
                res.status(401).send({
                    errorMessage: req.i18n.__("Err_Login_InvalidEmailPassword")
                });
            } else {

                var userData = [];

                // Parses the data from each of the row and populate the user data json array 
                queryResultHandler.fillArrayFromRows(userData, rowCount, rows, true, () => {
                    return res.status(500).send({
                        errorMessage: req.i18n.__("Err_Login_DataRetrieving")
                    });
                });

                // Checks if the account has been activated
                if (userData[0].IsActivated) {

                    // Checks for password mathing
                    bcrypt.compare(req.body.password, userData[0].Password, (bcryptError, match) => {
                        if (bcryptError) {
                            res.status(500).send({
                                errorMessage: bcryptError
                            });
                        } else {
                            if (match) {
                                req.session.user = userData[0].CodUser; // Stores the code of the logged user into the session
                                res.status(200).send({
                                    infoMessage: req.i18n.__("Login_Completed", userData[0].CodUser)
                                });
                            } else {
                                res.status(401).send({
                                    errorMessage: req.i18n.__("Err_Login_InvalidEmailPassword")
                                });
                            }
                        }
                    });

                } else {
                    res.status(401).send({
                        inactive: req.i18n.__("Err_Login_InactiveAccount")
                    });
                }

            }

        }
    });
    checkRequest.addParameter('Email', TYPES.NVarChar, req.body.email);

    // Performs the password retrieval operation on the relational database
    sql.connection.execSql(checkRequest);

}


function isLoggedIn(req, res) {
    res.status(200).send({
        loggedIn: req.session.user
    });
}


function logout(req, res) {
    req.session.destroy((error) => {
        if (error) {
            res.status(500).send({
                errorMessage: req.i18n.__("Err_Logout")
            });
        } else {
            res.status(200).send({
                infoMessage: req.i18n.__("LogoutCompleted")
            });
        }
    })
}


module.exports = {
    login,
    isLoggedIn,
    logout
};