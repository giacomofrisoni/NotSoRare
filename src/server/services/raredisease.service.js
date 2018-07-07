// Modules for managing queries and transactions on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const ISOLATION_LEVEL = require('tedious').ISOLATION_LEVEL;

// Request for connection to the relational database
const sql = require('../sql');


function searchRareDiseases(req, res) {

    const view = getRareDiseasesNameViewFromLanguage(req.i18n.getLocale());

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to use a full-text index for the rare diseases research with starts with
     * and freetext support (for syntax error avoidance).
     */
    diseasesRequest = new Request(
        "(SELECT RareDiseaseView.[CodDisease], RareDiseaseView.[Name] " +
            "FROM " + view + " AS RareDiseaseView " +
            "WHERE FREETEXT([Name], @RareDisease)) " +
        "UNION " +
        "(SELECT RareDiseaseView.[CodDisease], RareDiseaseView.[Name] " +
            "FROM " + view + " AS RareDiseaseView " +
            "WHERE CONTAINS([Name], @RareDiseaseStartsWith));", (queryError, rowCount, rows) => {
            if (queryError) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_RareDiseases_Search", queryError)
                });
            } else {
                // Checks for sufficient similarity
                if (rowCount == 0) {
                    res.status(200).json({});
                } else {

                    var searchResults = [];

                    // Parses the data from each of the row and populate the user statistics json array
                    for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                        var rowObject = {};
                        var singleRowData = rows[rowIndex];
                        for (var colIndex = 0; colIndex < singleRowData.length; colIndex++) {
                            var tempColName = singleRowData[colIndex].metadata.colName;
                            var tempColData = singleRowData[colIndex].value;
                            if (tempColData === null) {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_RareDiseases_Search", "Invalid data")
                                });
                            }
                            rowObject[tempColName] = tempColData;
                        }
                        searchResults.push(rowObject);
                    }
                    
                    res.status(200).json(searchResults);

                }
            }
        }
    );
    diseasesRequest.addParameter('RareDisease', TYPES.NVarChar, '"' + req.body.text + '"');
    diseasesRequest.addParameter('RareDiseaseStartsWith', TYPES.NVarChar, '"' + req.body.text + '*"');

    // Performs the research query on the relational database
    sql.connection.execSql(diseasesRequest);

}


function getRareDiseasesNameViewFromLanguage(codLanguage) {
    var viewName;
    switch (codLanguage) {
        case "it": viewName = "RareDiseaseNameITAView"; break;
        case "en": viewName = "RareDiseaseNameENGView"; break;
        case "pl": viewName = "RareDiseaseNamePOLView"; break;
        default: viewName = "RareDiseaseNameENGView"; break;
    }
    return viewName;
}


function getRareDisease(req, res) {

    const id = parseInt(req.params.id, 10);

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to get general information about the rare disease.
     */
    diseaseRequest = new Request(
        "SELECT Disease.OrphaNumber, Disease.Incidence, Disease.ForumThreadsNumber, Disease.StandardUsersNumber, Disease.ModeratorsNumber, " +
        "SpecialtyTR.Name, DiseaseTR.Name, DiseaseTR.Description, DiseaseTR.Causes " +
        "FROM RareDisease AS Disease " +
        "INNER JOIN SpecialtyTranslation AS SpecialtyTR ON Disease.CodSpecialty = SpecialtyTR.CodSpecialty AND SpecialtyTR.CodLanguage = @CodLanguage " +
        "INNER JOIN RareDiseaseTranslation AS DiseaseTR ON Disease.CodDisease = DiseaseTR.CodDisease AND DiseaseTR.CodLanguage = @CodLanguage " +
        "WHERE Disease.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
            if (queryError) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                });
            } else {
                /**
                 * The operation concerns a single row.
                 * If zero rows are affected, it means that there is no rare disease with the specified id code.
                 */
                if (rowCount == 0) {
                    done(null, () => {
                        res.status(404).send({
                            errorMessage: req.i18n.__("Err_RareDiseases_DiseaseNotFound")
                        });
                    });
                } else {

                    var diseaseData = {};

                    // Parses the data from each of the row and populate the rare disease json array
                    const diseaseGeneralKey = "general";
                    var rowObject = {};
                    var singleRowData = rows[0];
                    for (var colIndex = 0; colIndex < singleRowData.length; colIndex++) {
                        var tempColName = singleRowData[colIndex].metadata.colName;
                        var tempColData = singleRowData[colIndex].value;
                        rowObject[tempColName] = tempColData;
                    }
                    diseaseData[diseaseGeneralKey] = rowObject;

                    /**
                     * Prepares the SQL statement with parameters for SQL-injection avoidance,
                     * in order to get the symptoms of the rare disease.
                     */
                    symptomRequest = new Request(
                        "SELECT SymptomTR.Name, SymptomTR.Description " +
                        "FROM RareDisease " +
                        "INNER JOIN RareDiseaseSymptom ON RareDisease.CodDisease = RareDiseaseSymptom.CodDisease " +
                        "INNER JOIN Symptom ON Symptom.CodSymptom = RareDiseaseSymptom.CodSymptom " +
                        "INNER JOIN SymptomTranslation AS SymptomTR ON SymptomTR.CodSymptom = Symptom.CodSymptom AND SymptomTR.CodLanguage = @CodLanguage " +
                        "WHERE RareDisease.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
                            if (queryError) {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                                });
                            } else {
                                // Parses the data from each of the row and populate the rare disease json array
                                const diseaseSymptomsKey = "symptoms";
                                diseaseData[diseaseSymptomsKey] = []; // Empty array
                                for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                                    var rowObject = {};
                                    var singleRowData = rows[rowIndex];
                                    for (var colIndex = 0; colIndex < singleRowData.length; colIndex++) {
                                        var tempColName = singleRowData[colIndex].metadata.colName;
                                        var tempColData = singleRowData[colIndex].value;
                                        rowObject[tempColName] = tempColData;
                                    }
                                    diseaseData[diseaseSymptomsKey].push(rowObject);
                                }

                                /**
                                 * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                 * in order to get the treatments for the rare disease.
                                 */
                                treatmentRequest = new Request(
                                    "SELECT TreatmentTR.Name, TreatmentTR.Description, TreatmentTypeTR.Description " +
                                    "FROM Treatment " +
                                    "INNER JOIN TreatmentTranslation AS TreatmentTR ON TreatmentTR.CodTreatment = TreatmentTR.CodLanguage = @CodLanguage " +
                                    "INNER JOIN TreatmentType ON TreatmentType.CodTreatmentType = Treatment.CodTreatmentType " +
                                    "INNER JOIN TreatmentTypeTranslation AS TreatmentTypeTR ON TreatmentTypeTR.CodTreatmentType = TreatmentType.CodTreatmentType AND TreatmentTypeTR.CodLanguage = @CodLanguage " +
                                    "WHERE Treatment.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
                                        if (queryError) {
                                            res.status(500).send({
                                                errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                                            });
                                        } else {
                                            // Parses the data from each of the row and populate the rare disease json array
                                            const diseaseTreatmentsKey = "treatments";
                                            diseaseData[diseaseTreatmentsKey] = []; // Empty array
                                            for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                                                var rowObject = {};
                                                var singleRowData = rows[rowIndex];
                                                for (var colIndex = 0; colIndex < singleRowData.length; colIndex++) {
                                                    var tempColName = singleRowData[colIndex].metadata.colName;
                                                    var tempColData = singleRowData[colIndex].value;
                                                    rowObject[tempColName] = tempColData;
                                                }
                                                diseaseData[diseaseTreatmentsKey].push(rowObject);
                                            }

                                            /**
                                             * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                             * in order to get the diagnosis availbale for the rare disease.
                                             */
                                            diagnosisRequest = new Request(
                                                "SELECT DiagnosisTR.Name, DiagnosisTR.Description " +
                                                "FROM RareDisease " +
                                                "INNER JOIN RareDiseaseDiagnosis ON RareDiseaseDiagnosis.CodDisease = RareDisease.CodeDisease " +
                                                "INNER JOIN Diagnosis ON Diagnosis.CodDiagnosis = RareDiseaseDiagnosis.CodDiagnosis " +
                                                "INNER JOIN DiagnosisTranslation AS DiagnosisTR ON DiagnosisTR.CodDiagnosis = Diagnosis.CodDiagnosis AND DiagnosisTR.CodLanguage = @CodLanguage " +
                                                "WHERE RareDisease.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
                                                    if (queryError) {
                                                        res.status(500).send({
                                                            errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                                                        });
                                                    } else {
                                                        // Parses the data from each of the row and populate the rare disease json array
                                                        const diseaseDiagnosisKey = "diagnosis";
                                                        diseaseData[diseaseDiagnosisKey] = []; // Empty array
                                                        for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                                                            var rowObject = {};
                                                            var singleRowData = rows[rowIndex];
                                                            for (var colIndex = 0; colIndex < singleRowData.length; colIndex++) {
                                                                var tempColName = singleRowData[colIndex].metadata.colName;
                                                                var tempColData = singleRowData[colIndex].value;
                                                                rowObject[tempColName] = tempColData;
                                                            }
                                                            diseaseData[diseaseDiagnosisKey].push(rowObject);
                                                        }

                                                        res.status(200).json(diseaseData);
                                                    }
                                                }
                                            );
                                            diagnosisRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                                            diagnosisRequest.addParameter('CodDisease', TYPES.Numeric, id);

                                            // Performs the rare disease diagnosis data selection query on the relational database
                                            sql.connection.execSql(diagnosisRequest);

                                        }
                                    }
                                );
                                treatmentRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                                treatmentRequest.addParameter('CodDisease', TYPES.Numeric, id);

                                // Performs the rare disease symptoms data selection query on the relational database
                                sql.connection.execSql(treatmentRequest);
                            }
                        }
                    );
                    symptomRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                    symptomRequest.addParameter('CodDisease', TYPES.Numeric, id);

                    // Performs the rare disease symptoms data selection query on the relational database
                    sql.connection.execSql(symptomRequest);
                }
            }
        }
    );
    diseaseRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
    diseaseRequest.addParameter('CodDisease', TYPES.Numeric, id);

    // Performs the rare disease data selection query on the relational database
    sql.connection.execSql(diseaseRequest);
}


module.exports = {
    searchRareDiseases,
    /*
    getRareDiseases,
    getRareDiseaseStats,*/
    getRareDisease
};