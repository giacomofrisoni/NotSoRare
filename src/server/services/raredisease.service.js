// Modules for managing queries and transactions on sql server database
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const ISOLATION_LEVEL = require('tedious').ISOLATION_LEVEL;

// Request for connection to the relational database
const sql = require('../sql');


function searchRareDiseases(req, res) {

    /**
     * Prepares the SQL statement with parameters for SQL-injection avoidance,
     * in order to use a full-text index for the rare diseases research with starts with
     * and freetext support (for syntax error avoidance).
     */
    diseasesRequest = new Request(
        "(SELECT RareDiseaseView.[CodDisease], RareDiseaseView.[Name] " +
            "FROM RareDiseaseNameITAView AS RareDiseaseView " +
            "WHERE FREETEXT([Name], @RareDisease)) " +
        "UNION " +
        "(SELECT RareDiseaseView.[CodDisease], RareDiseaseView.[Name] " +
            "FROM RareDiseaseNameITAView AS RareDiseaseView " +
            "WHERE CONTAINS([Name], @RareDiseaseStartsWith))", (queryError, rowCount, rows) => {
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

module.exports = {
    searchRareDiseases/*,
    getRareDiseases,
    getRareDiseaseStats,
    getRareDisease*/
};