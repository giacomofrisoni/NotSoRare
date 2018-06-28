// Module and constant for salt and password hashing handling
const bcrypt = require('bcrypt');

// Modules for managing queries on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

// Request for connection to the relational database
const sql = require('../sql');


function login(req, res) {

     /*
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to get the stored hashed user password if already exists an account with the specified email address.
     */
    checkRequest = new Request("SELECT Password FROM StandardUser WHERE Email = @Email;", (queryError, rowCount) => {
        if (queryError) {
            res.status(500).send(queryError);
        } else {
            if (rowCount == 0) {
                res.status(401).send(req.i18n.__("Err_Login_InvalidEmail"));
            }
        }
    });
    checkRequest.addParameter('Email', TYPES.NVarChar, req.body.email);

    // Handles checking result
    checkRequest.on('row', (columns) => {
        columns.forEach((column) => {

            if (column.value === null) {
                res.status(500).send(req.i18n.__("Err_Login_PasswordRetrieving"));
            } else {

                bcrypt.compare(req.body.password, column.value, (bcryptError, match) => {
                    if (bcryptError) {
                        res.status(500).send(bcryptError);
                    } else {
                        if (match) {
                            res.status(201).send(req.i18n.__("Login_Completed"));
                        } else {
                            res.status(401).send(req.i18n.__("Err_Login_InvalidPassword"));
                        }
                    }
                });

            }

        });
    });

    // Performs the password retrieval operation on the relational database
    sql.connection.execSql(checkRequest);

}

module.exports = {
    login
};