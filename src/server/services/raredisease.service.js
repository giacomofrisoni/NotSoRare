// Modules for managing queries and transactions on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

// Request for connection to the relational database
const sql = require('../sql');

// Module for tedious query result handling
const queryResultHandler = require('../utilities/tedious_query_result_util');

// Module for sql translation handling
const translationEnv = require('../env/sql_translation_environment');


function searchRareDiseases(req, res) {

    const view = translationEnv.getRareDiseasesNameViewFromLanguage(req.i18n.getLocale());
    const synonymousView = translationEnv.getRareDiseasesSynonymousNameViewFromLanguage(req.i18n.getLocale());

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
        "(SELECT RareDiseaseSynonymousView.[CodDisease], RareDiseaseSynonymousView.[Name] " +
            "FROM " + synonymousView + " AS RareDiseaseSynonymousView " +
            "WHERE FREETEXT([Name], @RareDisease)) " +
        "UNION " +
        "(SELECT RareDiseaseView.[CodDisease], RareDiseaseView.[Name] " +
            "FROM " + view + " AS RareDiseaseView " +
            "WHERE CONTAINS([Name], @RareDiseaseStartsWith))" +
        "UNION " +
        "(SELECT RareDiseaseSynonymousView.[CodDisease], RareDiseaseSynonymousView.[Name] " +
            "FROM " + synonymousView + " AS RareDiseaseSynonymousView " +
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
                    queryResultHandler.fillArrayFromRows(searchResults, rowCount, rows, null, true, () => {
                        return res.status(500).send({
                            errorMessage: req.i18n.__("Err_RareDiseases_Search", "Invalid data")
                        });
                    });
                    
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


function getRareDiseases(req, res) {

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to get the basic information about all the registered rare diseases.
     */
    diseasesRequest = new Request(
        "SELECT Disease.CodSpecialty, SpecialtyTR.Name AS SpecialtyName, Disease.CodDisease, DiseaseTR.Name AS DiseaseName " +
        "FROM RareDisease AS Disease " +
        "INNER JOIN SpecialtyTranslation AS SpecialtyTR ON Disease.CodSpecialty = SpecialtyTR.CodSpecialty AND SpecialtyTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM SpecialtyTranslation), @CodLanguage, @DefaultCodLanguage) " +
        "INNER JOIN RareDiseaseTranslation AS DiseaseTR ON Disease.CodDisease = DiseaseTR.CodDisease AND DiseaseTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM RareDiseaseTranslation), @CodLanguage, @DefaultCodLanguage) " +
        "ORDER BY Disease.CodSpecialty, DiseaseTR.Name;", (queryError, rowCount, rows) => {
            if (queryError) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_RareDiseases_List", queryError)
                });
            } else {
                // Builds the json object by grouping diseases for specialties
                var diseases = [];
                var specialtiesGroups = [];
                queryResultHandler.fillArrayFromRows(diseases, rowCount, rows, (rowObject) => {
                    // For each disease...
                    // Searches the index of the specialty group for the current disease, if already present
                    var specialtyIndex = -1;
                    for (var i = 0; i < specialtiesGroups.length; i++) {
                        if (specialtiesGroups[i].hasOwnProperty('CodSpecialty')) {
                            if (specialtiesGroups[i].CodSpecialty == rowObject.CodSpecialty) {
                                specialtyIndex = i;
                            }
                        }
                    }
                    // If the specialty group is not present, adds it
                    if (specialtyIndex < 0) {
                        var specialtyObject = {};
                        specialtyObject["CodSpecialty"] = rowObject.CodSpecialty;
                        specialtyObject["SpecialtyName"] = rowObject.SpecialtyName;
                        specialtyObject["diseases"] = [];   // Empty array
                        specialtiesGroups.push(specialtyObject);
                        specialtyIndex = specialtiesGroups.indexOf(specialtyObject);
                    }
                    // Stores the current disease in the related specialty group
                    var diseaseObject = {};
                    diseaseObject["CodDisease"] = rowObject.CodDisease;
                    diseaseObject["DiseaseName"] = rowObject.DiseaseName;
                    specialtiesGroups[specialtyIndex]["diseases"].push(diseaseObject);
                }, true, () => {
                    return res.status(500).send({
                        errorMessage: req.i18n.__("Err_RareDiseases_List", "Invalid data")
                    });
                });

                // Orders the groups array by specialty name
                specialtiesGroups.sort(getSortOrder("SpecialtyName"));

                res.status(200).json(specialtiesGroups);
            }
        }
    );
    diseasesRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
    diseasesRequest.addParameter('DefaultCodLanguage', TYPES.Char, translationEnv.defaultLanguage);
    
    // Performs the rare diseases data selection query on the relational database
    sql.connection.execSql(diseasesRequest);

}


// Comparer function  
function getSortOrder(property) {
    return function (a, b) {
        if (a[property] > b[property]) {
            return 1;
        } else if (a[property] < b[property]) {
            return -1;
        }
        return 0;
    }
}  


function getRareDisease(req, res) {

    const id = parseInt(req.params.id, 10);

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to get general information about the rare disease.
     */
    diseaseRequest = new Request(
        "SELECT Disease.CodDisease, Disease.OrphaNumber, Disease.ICD10, Disease.OMIM, Disease.UMLS, Disease.MeSH, Disease.GARD, Disease.MedDRA, " +
        "Disease.Incidence, Disease.ForumThreadsNumber, Disease.StandardUsersNumber, Disease.ModeratorsNumber, Disease.ExperiencesNumber, " +
        "SpecialtyTR.CodSpecialty, SpecialtyTR.Name AS SpecialtyName, DiseaseTR.Name, DiseaseTR.Description, DiseaseTR.Causes " +
        "FROM RareDisease AS Disease " +
        "INNER JOIN SpecialtyTranslation AS SpecialtyTR ON Disease.CodSpecialty = SpecialtyTR.CodSpecialty AND SpecialtyTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM SpecialtyTranslation), @CodLanguage, @DefaultCodLanguage) " +
        "INNER JOIN RareDiseaseTranslation AS DiseaseTR ON Disease.CodDisease = DiseaseTR.CodDisease AND DiseaseTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM RareDiseaseTranslation), @CodLanguage, @DefaultCodLanguage) " +
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
                    res.status(404).send({
                        errorMessage: req.i18n.__("Err_RareDiseases_DiseaseNotFound")
                    });
                } else {

                    var diseaseData = {};

                    // Parses the data from each of the row and populates the rare disease json array
                    queryResultHandler.addSingleSectionToJSONFromRow("general", rows[0], diseaseData, null, true, () => {
                        return res.status(500).send({
                            errorMessage: req.i18n.__("Err_RareDiseases_Data", "Invalid data")
                        });
                    });

                    synonymousRequest = new Request(
                        "SELECT Name FROM RareDiseaseSynonymousTranslation WHERE CodDisease = @CodDisease AND CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM RareDiseaseSynonymousTranslation), @CodLanguage, @DefaultCodLanguage);", (queryError, rowCount, rows) => {
                            if (queryError) {
                                res.status(500).send({
                                    errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                                });
                            } else {
                                // Parses the data from each of the row and populates the synonymous section inside rare disease json array
                                queryResultHandler.addArraySectionToJSONFromRows("synonymous", rowCount, rows, diseaseData, null, true, () => {
                                    return res.status(500).send({
                                        errorMessage: req.i18n.__("Err_RareDiseases_Data", "Invalid data")
                                    });
                                });

                                /**
                                 * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                 * in order to get the symptoms of the rare disease.
                                 */
                                symptomRequest = new Request(
                                    "SELECT Symptom.CodSymptom, SymptomTR.Name, SymptomTR.Description " +
                                    "FROM RareDisease " +
                                    "INNER JOIN RareDiseaseSymptom ON RareDisease.CodDisease = RareDiseaseSymptom.CodDisease " +
                                    "INNER JOIN Symptom ON Symptom.CodSymptom = RareDiseaseSymptom.CodSymptom " +
                                    "INNER JOIN SymptomTranslation AS SymptomTR ON SymptomTR.CodSymptom = Symptom.CodSymptom AND SymptomTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM SymptomTranslation), @CodLanguage, @DefaultCodLanguage) " +
                                    "WHERE RareDisease.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
                                        if (queryError) {
                                            res.status(500).send({
                                                errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                                            });
                                        } else {
                                            // Parses the data from each of the row and populates the symptoms section inside rare disease json array
                                            queryResultHandler.addArraySectionToJSONFromRows("symptoms", rowCount, rows, diseaseData, null, true, () => {
                                                return res.status(500).send({
                                                    errorMessage: req.i18n.__("Err_RareDiseases_Data", "Invalid data")
                                                });
                                            });

                                            /**
                                            * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                            * in order to get the treatments for the rare disease.
                                            */
                                            treatmentRequest = new Request(
                                                "SELECT Treatment.CodTreatment, TreatmentTR.Name, TreatmentTR.Description, TreatmentTypeTR.Description AS Type " +
                                                "FROM Treatment " +
                                                "INNER JOIN TreatmentTranslation AS TreatmentTR ON TreatmentTR.CodDisease = Treatment.CodDisease AND TreatmentTR.CodTreatment = Treatment.CodTreatment AND TreatmentTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM TreatmentTranslation), @CodLanguage, @DefaultCodLanguage) " +
                                                "INNER JOIN TreatmentType ON TreatmentType.CodTreatmentType = Treatment.CodTreatmentType " +
                                                "INNER JOIN TreatmentTypeTranslation AS TreatmentTypeTR ON TreatmentTypeTR.CodTreatmentType = TreatmentType.CodTreatmentType AND TreatmentTypeTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM TreatmentTypeTranslation), @CodLanguage, @DefaultCodLanguage) " +
                                                "WHERE Treatment.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
                                                    if (queryError) {
                                                        res.status(500).send({
                                                            errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                                                        });
                                                    } else {
                                                        // Parses the data from each of the row and populates the treatments section inside rare disease json array
                                                        var collateralEffectsQuery = [];
                                                        const diseaseTreatmentsKey = "treatments";
                                                        queryResultHandler.addArraySectionToJSONFromRows(diseaseTreatmentsKey, rowCount, rows, diseaseData, (rowObject) => {
                                                            // For each tratement...
                                                            // Stores the getter query for the related collateral effects
                                                            collateralEffectsQuery.push(
                                                                "SELECT Treatment.CodTreatment, CollateralEffect.CodCollateralEffect, CollateralEffectTR.Description " +
                                                                "FROM Treatment " +
                                                                "INNER JOIN TreatmentCollateralEffect ON Treatment.CodDisease = TreatmentCollateralEffect.CodDisease AND Treatment.CodTreatment = TreatmentCollateralEffect.CodTreatment " +
                                                                "INNER JOIN CollateralEffect ON TreatmentCollateralEffect.CodCollateralEffect = CollateralEffect.CodCollateralEffect " +
                                                                "INNER JOIN CollateralEffectTranslation AS CollateralEffectTR ON CollateralEffect.CodCollateralEffect = CollateralEffectTR.CodCollateralEffect AND CollateralEffectTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM CollateralEffectTranslation), @CodLanguage, @DefaultCodLanguage) " +
                                                                "WHERE Treatment.CodDisease = @CodDisease AND Treatment.CodTreatment = " + rowObject.CodTreatment
                                                            )
                                                        }, true, () => {
                                                            return res.status(500).send({
                                                                errorMessage: req.i18n.__("Err_RareDiseases_Data", "Invalid data")
                                                            });
                                                        });

                                                        /**
                                                        * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                                        * in order to get the collateral effects of the treatments for the rare disease.
                                                        */
                                                        collateralEffectRequest = new Request(collateralEffectsQuery.join(' UNION '), (queryError, rowCount, rows) => {
                                                            if (queryError) {
                                                                res.status(500).send({
                                                                    errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                                                                });
                                                            } else {

                                                                // Parses the data from each of the row and populates the collateral effects inside rare disease json array
                                                                const diseaseTreatmentCollateralEffectsKey = "collateralEffects";
                                                                for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                                                                    var rowObject = {};
                                                                    var singleRowData = rows[rowIndex];
                                                                    for (var colIndex = 0; colIndex < singleRowData.length; colIndex++) {
                                                                        var tempColName = singleRowData[colIndex].metadata.colName;
                                                                        var tempColData = singleRowData[colIndex].value;
                                                                        rowObject[tempColName] = tempColData;
                                                                    }
                                                                    // Searches the stored treatment object related to the current collateral effect
                                                                    for (var treatmentIndex = 0; treatmentIndex < diseaseData[diseaseTreatmentsKey].length; treatmentIndex++) {
                                                                        const treatment = diseaseData[diseaseTreatmentsKey][treatmentIndex];
                                                                        if (treatment.hasOwnProperty('CodTreatment')) {
                                                                            if (treatment.CodTreatment == rowObject.CodTreatment) {
                                                                                // Only if there are no already collateral effects for the treatment...
                                                                                if (!treatment.hasOwnProperty(diseaseTreatmentCollateralEffectsKey)) {
                                                                                    treatment[diseaseTreatmentCollateralEffectsKey] = []; // Empty array
                                                                                }
                                                                                treatment[diseaseTreatmentCollateralEffectsKey].push(rowObject);
                                                                            }
                                                                        }
                                                                    }
                                                                }

                                                                /**
                                                                * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                                                * in order to get the diagnosis available for the rare disease.
                                                                */
                                                                diagnosisRequest = new Request(
                                                                    "SELECT Diagnosis.CodDiagnosis, DiagnosisTR.Name, DiagnosisTR.Description " +
                                                                    "FROM RareDisease " +
                                                                    "INNER JOIN RareDiseaseDiagnosis ON RareDiseaseDiagnosis.CodDisease = RareDisease.CodDisease " +
                                                                    "INNER JOIN Diagnosis ON Diagnosis.CodDiagnosis = RareDiseaseDiagnosis.CodDiagnosis " +
                                                                    "INNER JOIN DiagnosisTranslation AS DiagnosisTR ON DiagnosisTR.CodDiagnosis = Diagnosis.CodDiagnosis AND DiagnosisTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM DiagnosisTranslation), @CodLanguage, @DefaultCodLanguage) " +
                                                                    "WHERE RareDisease.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
                                                                        if (queryError) {
                                                                            res.status(500).send({
                                                                                errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                                                                            });
                                                                        } else {
                                                                            // Parses the data from each of the row and populates the diagnosis section inside rare disease json array
                                                                            queryResultHandler.addArraySectionToJSONFromRows("diagnosis", rowCount, rows, diseaseData, null, true, () => {
                                                                                return res.status(500).send({
                                                                                    errorMessage: req.i18n.__("Err_RareDiseases_Data", "Invalid data")
                                                                                });
                                                                            });

                                                                            /**
                                                                            * Prepares the SQL statement with parameters for SQL-injection avoidance,
                                                                            * in order to get the complications of the rare disease.
                                                                            */
                                                                            complicationRequest = new Request(
                                                                                "SELECT Complication.CodComplication, ComplicationTR.Description " +
                                                                                "FROM RareDisease " +
                                                                                "INNER JOIN Risk ON Risk.CodDisease = RareDisease.CodDisease " +
                                                                                "INNER JOIN Complication ON Complication.CodComplication = Risk.CodComplication " +
                                                                                "INNER JOIN ComplicationTranslation AS ComplicationTR ON ComplicationTR.CodComplication = Complication.CodComplication AND ComplicationTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM ComplicationTranslation), @CodLanguage, @DefaultCodLanguage) " +
                                                                                "WHERE RareDisease.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
                                                                                    if (queryError) {
                                                                                        res.status(500).send({
                                                                                            errorMessage: req.i18n.__("Err_RareDiseases_Data", queryError)
                                                                                        });
                                                                                    } else {
                                                                                        // Parses the data from each of the row and populates the complications section inside rare disease json array
                                                                                        queryResultHandler.addArraySectionToJSONFromRows("complications", rowCount, rows, diseaseData, null, true, () => {
                                                                                            return res.status(500).send({
                                                                                                errorMessage: req.i18n.__("Err_RareDiseases_Data", "Invalid data")
                                                                                            });
                                                                                        });

                                                                                        res.status(200).json(diseaseData);
                                                                                    }
                                                                                }
                                                                            );
                                                                            complicationRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                                                                            complicationRequest.addParameter('DefaultCodLanguage', TYPES.Char, translationEnv.defaultLanguage);
                                                                            complicationRequest.addParameter('CodDisease', TYPES.Numeric, id);

                                                                            // Performs the rare disease complications data selection query on the relational database
                                                                            sql.connection.execSql(complicationRequest);
                                                                        }
                                                                    }
                                                                );
                                                                diagnosisRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                                                                diagnosisRequest.addParameter('DefaultCodLanguage', TYPES.Char, translationEnv.defaultLanguage);
                                                                diagnosisRequest.addParameter('CodDisease', TYPES.Numeric, id);

                                                                // Performs the rare disease diagnosis data selection query on the relational database
                                                                sql.connection.execSql(diagnosisRequest);
                                                            }
                                                        });
                                                        collateralEffectRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                                                        collateralEffectRequest.addParameter('DefaultCodLanguage', TYPES.Char, translationEnv.defaultLanguage);
                                                        collateralEffectRequest.addParameter('CodDisease', TYPES.Numeric, id);

                                                        // Performs the data selection query for the collateral effects of each disease treatment on the relational database
                                                        sql.connection.execSql(collateralEffectRequest);
                                                    }
                                                }
                                            );
                                            treatmentRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                                            treatmentRequest.addParameter('DefaultCodLanguage', TYPES.Char, translationEnv.defaultLanguage);
                                            treatmentRequest.addParameter('CodDisease', TYPES.Numeric, id);

                                            // Performs the rare disease symptoms data selection query on the relational database
                                            sql.connection.execSql(treatmentRequest);
                                        }
                                    }
                                );
                                symptomRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                                symptomRequest.addParameter('DefaultCodLanguage', TYPES.Char, translationEnv.defaultLanguage);
                                symptomRequest.addParameter('CodDisease', TYPES.Numeric, id);

                                // Performs the rare disease symptoms data selection query on the relational database
                                sql.connection.execSql(symptomRequest);
                            }
                        }
                    );
                    synonymousRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                    synonymousRequest.addParameter('DefaultCodLanguage', TYPES.Char, translationEnv.defaultLanguage);
                    synonymousRequest.addParameter('CodDisease', TYPES.Numeric, id);

                    // Performs the rare disease synonymous data selection query on the relational database
                    sql.connection.execSql(synonymousRequest);
                }
            }
        }
    );
    diseaseRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
    diseaseRequest.addParameter('DefaultCodLanguage', TYPES.Char, translationEnv.defaultLanguage);
    diseaseRequest.addParameter('CodDisease', TYPES.Numeric, id);

    // Performs the rare disease data selection query on the relational database
    sql.connection.execSql(diseaseRequest);

}


function getRareDiseaseReferences(req, res) {

    const id = parseInt(req.params.id, 10);

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to check rare disease existance.
     */
    diseaseRequest = new Request(
        "SELECT COUNT(*) FROM RareDisease WHERE CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
            if (queryError) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_RareDiseases_References", queryError)
                });
            } else {
                // The select operation concerns a single row
                if (rowCount == 0) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_RareDiseases_References")
                    });
                } else {
                    // Checks if the specified disease code is valid or not
                    if (rows[0][0].value > 0) {

                        /**
                         * Prepares the SQL statement with parameters for SQL-injection avoidance,
                         * in order to get the references available for the rare disease.
                         */
                        referenceRequest = new Request(
                            "SELECT Reference.CodReference, ReferenceTR.Description, Reference.Link " +
                            "FROM Reference " +
                            "INNER JOIN ReferenceTranslation AS ReferenceTR ON ReferenceTR.CodReference = Reference.CodReference AND ReferenceTR.CodLanguage = IIF (@CodLanguage IN (SELECT DISTINCT CodLanguage FROM ReferenceTranslation), @CodLanguage, @DefaultCodLanguage) " +
                            "WHERE Reference.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
                                if (queryError) {
                                    res.status(500).send({
                                        errorMessage: req.i18n.__("Err_RareDiseases_References", queryError)
                                    });
                                } else {
                                    var references = [];

                                    // Parses the data from each of the row and gets the references
                                    queryResultHandler.fillArrayFromRows(references, rowCount, rows, null, true, () => {
                                        return res.status(500).send({
                                            errorMessage: req.i18n.__("Err_RareDiseases_Data", "Invalid data")
                                        });
                                    });

                                    res.status(200).json(references);
                                }
                            }
                        );
                        referenceRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                        referenceRequest.addParameter('DefaultCodLanguage', TYPES.Char, translationEnv.defaultLanguage);
                        referenceRequest.addParameter('CodDisease', TYPES.Numeric, id);

                        // Performs the rare disease references data selection query on the relational database
                        sql.connection.execSql(referenceRequest);

                    } else {
                        res.status(404).send({
                            errorMessage: req.i18n.__("Err_RareDiseases_DiseaseNotFound")
                        });
                    }
                }
            }
        }
    );
    diseaseRequest.addParameter('CodDisease', TYPES.Numeric, id);

    // Performs the rare disease control query on the relational database
    sql.connection.execSql(diseaseRequest);
}


function getRareDiseaseExpertCentres(req, res) {

    const id = parseInt(req.params.id, 10);

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to check rare disease existance.
     */
    diseaseRequest = new Request(
        "SELECT COUNT(*) FROM RareDisease WHERE CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
            if (queryError) {
                res.status(500).send({
                    errorMessage: req.i18n.__("Err_RareDiseases_ExpertCentres", queryError)
                });
            } else {
                // The select operation concerns a single row
                if (rowCount == 0) {
                    res.status(500).send({
                        errorMessage: req.i18n.__("Err_RareDiseases_ExpertCentres")
                    });
                } else {
                    // Checks if the specified disease code is valid or not
                    if (rows[0][0].value > 0) {

                        /**
                        * Prepares the SQL statement with parameters for SQL-injection avoidance,
                        * in order to get the expert centres available for the rare disease.
                        */
                        expertCentreRequest = new Request(
                            "SELECT ExpertCentre.CodExpertCentre, ExpertCentre.Name, ExpertCentre.Image, " +
                            "ExpertCentre.Add_Street, ExpertCentre.Add_HouseNumber, ExpertCentre.Add_PostalCode, ExpertCentre.Add_City, ExpertCentre.Add_Province, ExpertCentre.Add_Country, " +
                            "ExpertCentre.WebSite " +
                            "FROM ExpertCentre " +
                            "INNER JOIN RareDiseaseExpertCentre ON RareDiseaseExpertCentre.CodExpertCentre = ExpertCentre.CodExpertCentre " +
                            "INNER JOIN RareDisease ON RareDisease.CodDisease = RareDiseaseExpertCentre.CodDisease " +
                            "WHERE ExpertCentre.ApprovedYN = 1 AND RareDisease.CodDisease = @CodDisease;", (queryError, rowCount, rows) => {
                                if (queryError) {
                                    res.status(500).send({
                                        errorMessage: req.i18n.__("Err_RareDiseases_ExpertCentres", queryError)
                                    });
                                } else {
                                    /**
                                    * The operation concerns a single row.
                                    * If zero rows are affected, it means that there is no rare disease with the specified id code.
                                    */
                                    if (rowCount == 0) {
                                        res.status(404).send({
                                            errorMessage: req.i18n.__("Err_RareDiseases_DiseaseNotFound")
                                        });
                                    } else {
                                        var expertCentres = [];

                                        // Parses the data from each of the row and gets the expert centres
                                        queryResultHandler.fillArrayFromRows(expertCentres, rowCount, rows, null, true, () => {
                                            return res.status(500).send({
                                                errorMessage: req.i18n.__("Err_RareDiseases_ExpertCentres", "Invalid data")
                                            });
                                        });

                                        res.status(200).json(expertCentres);
                                    }
                                }
                            }
                        );
                        expertCentreRequest.addParameter('CodLanguage', TYPES.Char, req.i18n.getLocale());
                        expertCentreRequest.addParameter('CodDisease', TYPES.Numeric, id);

                        // Performs the rare disease expert centres data selection query on the relational database
                        sql.connection.execSql(expertCentreRequest);
                        
                    } else {
                        res.status(404).send({
                            errorMessage: req.i18n.__("Err_RareDiseases_DiseaseNotFound")
                        });
                    }
                }
            }
        }
    );
    diseaseRequest.addParameter('CodDisease', TYPES.Numeric, id);

    // Performs the rare disease control query on the relational database
    sql.connection.execSql(diseaseRequest);

}


module.exports = {
    searchRareDiseases,
    getRareDiseases,
    getRareDisease,
    getRareDiseaseReferences,
    getRareDiseaseExpertCentres
};