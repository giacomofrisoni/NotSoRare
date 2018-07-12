// Module for guid generation
const uuidV1 = require('uuid/v1');

// Modules for managing queries and transactions on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

// Request for connection to the relational database
const sql = require('../sql');

// Module for tedious query result handling
const queryResultHandler = require('../utilities/tedious_query_result_util');


function postExperience(req, res) {

    /**
     * Only a logged user whit the same code of the request can add the experience.
     */
    if (req.session.user == req.body.codUser) {

        /**
         * Prepares the SQL statement with parameters for SQL-injection avoidance,
         * in order to add the new user experience.
         */
        insertRequest = new Request(
            "INSERT Experience(Id, CodDisease, CodUser, Photo, Description) " +
            "VALUES (@Id, @CodDisease, @CodUser, " + (req.body.photo ? "@Photo" : "NULL") + ", @Description);", (queryError, rowCount) => {
                if (queryError) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Experiences_ExperienceInsertion", queryError)
                    });
                } else {

                    // The operation concerns a single row
                    if (rowCount == 0) {
                        res.status(500).send({
                            errorMessage: req.i18n.__("Err_Experiences_ExperienceInsertion", "Zero rows affected")
                        });
                    } else {
                        res.status(200).send({
                            infoMessage: req.i18n.__("Experience_Added")
                        });
                    }

                }
            }
        );
        insertRequest.addParameter('Id', TYPES.NVarChar, uuidV1()); // Generates a v1 UUID (time-based): '6c84fb90-12c4-11e1-840d-7b25c5ee775a'
        insertRequest.addParameter('CodUser', TYPES.Numeric, req.body.codUser);
        insertRequest.addParameter('CodDisease', TYPES.Numeric, req.body.codDisease);
        if (!req.body.photo) {
            insertRequest.addParameter('Photo', TYPES.NVarChar, req.body.photo);
        }
        insertRequest.addParameter('Description', TYPES.NVarChar, req.body.description);
        
        // Performs the experience insertion query on the relational database
        sql.connection.execSql(insertRequest);

    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


function putExperience(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idUser = parseInt(req.params.idUser, 10);

    /**
     * Only a logged user whit the same code of the request can update the experience.
     */
    if (req.session.user == idUser) {

        /**
         * Prepares the SQL statement with parameters for SQL-injection avoidance,
         * in order to update the registered experience.
         */
        updateRequest = new Request(
            "UPDATE Experience " +
            "SET Photo = @Photo, Description = @Description " +
            "WHERE CodDisease = @CodDisease AND CodUser = @CodUser;", (queryError, rowCount) => {
                if (queryError) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Experience_ExperienceUpdate", queryError)
                    });
                } else {
                    /**
                     * The operation concerns a single row.
                     * If zero rows are affected, it means that there is no experience with the specified id code.
                     */
                    if (rowCount == 0) {
                        res.status(404).send({
                            errorMessage: req.i18n.__("Err_Experiences_ExperienceNotFound")
                        });
                    } else {
                        res.status(200).send({
                            infoMessage: req.i18n.__("Experience_Updated")
                        });
                    }
                }
            }
        );
        updateRequest.addParameter('Photo', TYPES.NVarChar, req.body.photo);
        updateRequest.addParameter('Description', TYPES.NVarChar, req.body.description);
        updateRequest.addParameter('CodDisease', TYPES.Numeric, idDisease);
        updateRequest.addParameter('CodUser', TYPES.Numeric, idUser);
        
        // Performs the experience update query on the relational database
        sql.connection.execSql(updateRequest);

    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}


function deleteExperience(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idUser = parseInt(req.params.idUser, 10);

    /**
     * Only a logged user whit the same code of the request can remove the experience.
     */
    if (req.session.user == idUser) {

        /**
         * Prepares the SQL statement with parameters for SQL-injection avoidance,
         * in order to delete the registered experience.
         */
        deletionRequest = new Request(
            "DELETE FROM Experience WHERE CodDisease = @CodDisease AND CodUser = @CodUser;", (queryError, rowCount) => {
                if (queryError) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_Experience_ExperienceDeletion", queryError)
                    });
                } else {
                    /**
                     * The operation concerns a single row.
                     * If zero rows are affected, it means that there is no experience with the specified id code.
                     */
                    if (rowCount == 0) {
                        res.status(404).send({
                            errorMessage: req.i18n.__("Err_Experiences_ExperienceNotFound")
                        });
                    } else {
                        res.status(200).send({
                            infoMessage: req.i18n.__("Experience_Removed")
                        });
                    }
                }
            }
        );
        deletionRequest.addParameter('CodDisease', TYPES.Numeric, idDisease);
        deletionRequest.addParameter('CodUser', TYPES.Numeric, idUser);
        
        // Performs the experience deletion query on the relational database
        sql.connection.execSql(deletionRequest);

    } else {
        res.status(401).send({
            errorMessage: req.i18n.__("Err_UnauthorizedUser")
        });
    }

}

function getExperience(req, res) {

    const idDisease = parseInt(req.params.idDisease, 10);
    const idUser = parseInt(req.params.idUser, 10);

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to obtain the registered experiences for a rare disease.
     */
    experienceRequest = new Request(
        "SELECT Experience.CodUser, User.Name, User.Surname, User.Gender, User.BirthDate, User.Nationality, User.Photo, " +
        "Experience.CreatedAt, Experience.UpdatedAt, Experience.Photo, Experience.Description " +
        "FROM Experience " +
        "INNER JOIN StandardUser ON StandardUser.CodUser = Experience.CodUser " +
        "WHERE Experience.CodDisease = @CodDisease AND Experience.CodUser = @CodUser;", (queryError, rowCount, rows) => {
            if (queryError) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_Experiences_GettingExperience", queryError)
                });
            } else {
                var experiences = [];
                queryResultHandler.fillArrayFromRows(experiences, rowCount, rows, null, true, () => {
                    return res.status(500).send({
                        errorMessage: req.i18n.__("Err_Experiences_GettingExperience", "Invalid data")
                    });
                });
                res.status(200).json(experiences);
            }
        }
    );
    experienceRequest.addParameter('CodDisease', TYPES.Numeric, idDisease);
    experienceRequest.addParameter('CodUser', TYPES.Numeric, idUser);
                                
    // Performs the experience retrieving query on the relational database
    sql.connection.execSql(experienceRequest);

}


function getRareDiseaseExperiences(req, res) {

    const idDisease = parseInt(req.params.id, 10);

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to obtain the registered experiences for a rare disease.
     */
    experienceRequest = new Request(
        "SELECT Experience.CodUser, User.Name, User.Surname, User.Gender, User.BirthDate, User.Nationality, User.Photo, " +
        "FROM Experience " +
        "INNER JOIN StandardUser ON StandardUser.CodUser = Experience.CodUser " +
        "WHERE Experience.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
            if (queryError) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_Experiences_GettingExperiences", queryError)
                });
            } else {
                var experiences = [];
                queryResultHandler.fillArrayFromRows(experiences, rowCount, rows, null, true, () => {
                    return res.status(500).send({
                        errorMessage: req.i18n.__("Err_Experiences_GettingExperiences", "Invalid data")
                    });
                });
                res.status(200).json(experiences);
            }
        }
    );
    experienceRequest.addParameter('CodDisease', TYPES.Numeric, idDisease);
                                
    // Performs the rare diseases experiences retrieving query on the relational database
    sql.connection.execSql(experienceRequest);

}


function getUserExperiencesReferences(req, res) {

    const idUser = parseInt(req.params.id, 10);

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to obtain the registered experiences of an user.
     */
    experienceRequest = new Request(
        "SELECT Experience.CodDisease, Disease.Name AS DiseaseName, Experience.CreatedAt, Experience.UpdatedAt " +
        "FROM Experience " +
        "INNER JOIN RareDisease ON RareDisease.CodDisease = Experience.CodDisease " +
        "WHERE Experience.CodUser = @CodUser;", (queryError, rowCount, rows) => {
            if (queryError) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_Experiences_GettingExperiences", queryError)
                });
            } else {
                var experiencesRefs = [];
                queryResultHandler.fillArrayFromRows(experiencesRefs, rowCount, rows, null, true, () => {
                    return res.status(500).send({
                        errorMessage: req.i18n.__("Err_Experiences_GettingExperiences", "Invalid data")
                    });
                });
                res.status(200).json(experiencesRefs);
            }
        }
    );
    experienceRequest.addParameter('CodUser', TYPES.Numeric, idUser);
                                
    // Performs the user experiences retrieving query on the relational database
    sql.connection.execSql(experienceRequest);

}


module.exports = {
    postExperience,
    putExperience,
    deleteExperience,
    getExperience,
    getRareDiseaseExperiences,
    getUserExperiencesReferences
};