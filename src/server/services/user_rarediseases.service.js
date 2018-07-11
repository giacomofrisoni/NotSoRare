// Module for guid generation
const uuidV1 = require('uuid/v1');

// Modules for managing queries and transactions on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

// Request for connection to the relational database
const sql = require('../sql');

// Module for tedious query result handling
const queryResultHandler = require('../utilities/tedious_query_result_util');


function addUserInterest(req, res) {

    /**
     * Only a logged user whit the same code of the request can add an interest.
     */
    if (req.session.user == req.body.codUser) {
        /**
         * Prepares the SQL statement with parameters for SQL-injection avoidance,
         * in order to save the interest of the logged user for the specified rare disease.
         */
        interestRequest = new Request(
            "INSERT Interest (Id, CodDisease, CodUser) VALUES (@Id, @CodDisease, @CodUser)", (queryError, rowCount, rows) => {
                if (queryError) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_UserInterests_AddingInterest", queryError)
                    });
                } else {
                    // The operation concerns a single row
                    if (rowCount == 0) {
                        res.status(500).send({
                            errorMessage: req.i18n.__("Err_UserInterests_AddingInterest", "Zero rows affected")
                        });
                    } else {
                        res.status(200).send({
                            infoMessage: req.i18n.__("Interest_Added")
                        });
                    }
                }
            }
        );
        interestRequest.addParameter('Id', TYPES.NVarChar, uuidV1()); // Generates a v1 UUID (time-based): '6c84fb90-12c4-11e1-840d-7b25c5ee775a'
        interestRequest.addParameter('CodDisease', TYPES.Numeric, req.body.codDisease);
        interestRequest.addParameter('CodUser', TYPES.Numeric, req.body.codUser);
                                    
        // Performs the rare diseases interest insertion query on the relational database
        sql.connection.execSql(interestRequest);
    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


function removeUserInterest(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idUser = parseInt(req.params.idUser, 10);

    /**
     * Only a logged user whit the same code of the request can remove an interest.
     */
    if (req.session.user == idUser) {
        /**
         * Prepares the SQL statement with parameters for SQL-injection avoidance,
         * in order to remove the interest of the logged user for the specified rare disease.
         */
        interestRequest = new Request(
            "DELETE FROM Interest WHERE CodDisease = @CodDisease AND CodUser = @CodUser", (queryError, rowCount, rows) => {
                if (queryError) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_UserInterests_RemovingInterest", queryError)
                    });
                } else {
                    /**
                     * The operation concerns a single row.
                     * If zero rows are affected, it means that there is no interest between the user
                     * and the rare disease specified.
                     */
                    if (rowCount == 0) {
                        res.status(500).send({
                            errorMessage: req.i18n.__("Err_UserInterests_InterestNotPresent")
                        });
                    } else {
                        res.status(200).send({
                            infoMessage: req.i18n.__("Interest_Removed")
                        });
                    }
                }
            }
        );
        interestRequest.addParameter('CodDisease', TYPES.Numeric, idDisease);
        interestRequest.addParameter('CodUser', TYPES.Numeric, idUser);
                                    
        // Performs the rare diseases interest deletion query on the relational database
        sql.connection.execSql(interestRequest);
    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


function getUserInterests(req, res) {

    const idUser = parseInt(req.params.idUser, 10);

    /**
     * Only a logged user whit the same code of the request can retrieve his interests.
     */
    if (req.session.user == idUser) {
        /**
         * Prepares the SQL statement with parameters for SQL-injection avoidance,
         * in order to obtain the rare disease interests of the logged user.
         */
        interestRequest = new Request(
            "SELECT RareDisease.CodDisease, RareDiseaseTR.Name " +
            "FROM Interest " +
            "INNER JOIN RareDisease ON RareDisease.CodDisease = Interest.CodDisease " +
            "INNER JOIN RareDiseaseTranslation AS RareDiseaseTR ON RareDiseaseTR.CodDisease = RareDisease.CodDisease AND RareDiseaseTR.CodLanguage = @CodLanguage " +
            "WHERE Interest.CodUser = @CodUser;", (queryError, rowCount, rows) => {
                if (queryError) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_UserInterests_GettingInterests", queryError)
                    });
                } else {
                    var interests = [];
                    queryResultHandler.fillArrayFromRows(interests, rowCount, rows, null, true, () => {
                        return res.status(500).send({
                            errorMessage: req.i18n.__("Err_UserInterests_GettingInterests", "Invalid data")
                        });
                    });
                    res.status(200).json(interests);
                }
            }
        );
        interestRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
        interestRequest.addParameter('CodUser', TYPES.Numeric, idUser);
                                    
        // Performs the rare diseases interests retrieving query on the relational database
        sql.connection.execSql(interestRequest);
    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


function isUserInterested(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idUser = parseInt(req.params.idUser, 10);

    /**
     * Only a logged user whit the same code of the request can check his interests.
     */
    if (req.session.user == idUser) {
        /**
         * Prepares the SQL statement with parameters for SQL-injection avoidance,
         * in order to check the existance of an interest for the logged user.
         */
        interestRequest = new Request(
            "SELECT COUNT(*) " +
            "FROM Interest " +
            "WHERE Interest.CodDisease = @CodDisease AND Interest.CodUser = @CodUser;", (queryError, rowCount, rows) => {
                if (queryError) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_UserInterests_CheckingInterest", queryError)
                    });
                } else {
                    // The operation concerns a single row
                    if (rowCount == 0) {
                        res.status(500).send({
                            errorMessage: req.i18n.__("Err_UserInterests_CheckingInterest", "Invalid result")
                        });
                    } else {
                        res.status(200).send({
                            interested: (rows[0][0].value > 0)
                        });
                    }
                }
            }
        );
        interestRequest.addParameter('CodDisease', TYPES.Numeric, idDisease);
        interestRequest.addParameter('CodUser', TYPES.Numeric, idUser);
                                    
        // Performs the rare diseases interest control query on the relational database
        sql.connection.execSql(interestRequest);
    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


module.exports = {
    addUserInterest,
    removeUserInterest,
    getUserInterests,
    isUserInterested
};