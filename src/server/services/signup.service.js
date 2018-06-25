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


function signup(req, res) {

    /*
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to check if already exists an account with the specified email address.
     */
    checkRequest = new Request("SELECT COUNT(*) FROM StandardUser WHERE Email = @Email;", (queryError) => {
        if (queryError) {
            res.status(500).send(queryError);
        }
    });
    checkRequest.addParameter('Email', TYPES.NVarChar, req.body.email);

    // Handles checking result
    checkRequest.on('row', (columns) => {
        columns.forEach((column) => {

            if (column.value === null) {
                res.status(500).send("Not valid email checking result during signup request");
            } else {
                
                // Checks if there is a registered account with the same email
                if (column.value >= 1) {
                    res.status(500).send("The specified email is already associated to an existing account");
                } else {

                    // Performs the hashing operation on the specified password in order to store it as encrypted text
                    bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS, (bcryptError, hashedPassword) => {
                        
                        // Checks for encryption error
                        if (bcryptError) {
                            res.status(500).send(bcryptError);
                        } else {

                            /*
                             * Prepares the SQL statement with parameters for SQL-injection avoidance,
                             * in order to register the new user account.
                             */
                            request = new Request("INSERT StandardUser (Id, Email, Password, Name, Surname, Gender, BirthDate, Nationality, RegistrationDate, PatientYN) " +
                                "VALUES (@Id, @Email, @Password, @Name, @Surname, @Gender, @BirthDate, @Nationality, CURRENT_TIMESTAMP, @PatientYN);", (queryError, rowCount) => {
                                if (queryError) {
                                    console.log(queryError);
                                    res.status(500).send(queryError);
                                } else {
                                    console.log("User '" + req.body.name + " " + req.body.surname + "' successfully registered.");
                                    console.log(rowCount + ' rows returned');
                                    res.status(201).send("OK");
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

                            // Performs the insertion query on the relational database
                            sql.connection.execSql(request);
                        }

                    });
                }
            }
        });
    });

    // Performs the email control on the relational database
    sql.connection.execSql(checkRequest);

}

module.exports = {
    signup
};