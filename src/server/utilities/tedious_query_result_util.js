function fillArrayFromRows(array, rowCount, rows, eachRow, nullCheck, doIfNull) {
    for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        var rowObject = {};
        var singleRowData = rows[rowIndex];
        for (var colIndex = 0; colIndex < singleRowData.length; colIndex++) {
            var tempColName = singleRowData[colIndex].metadata.colName;
            var tempColData = singleRowData[colIndex].value;
            if (nullCheck) {
                if (tempColData === null) {
                    doIfNull();
                }
            }
            rowObject[tempColName] = tempColData;
        }
        if (eachRow) {
            eachRow(rowObject);
        }
        array.push(rowObject);
    }
}

function getJSONFromRow(row) {
    var json = {};
    for (var colIndex = 0; colIndex < row.length; colIndex++) {
        var tempColName = row[colIndex].metadata.colName;
        var tempColData = row[colIndex].value;
        json[tempColName] = tempColData;
    }
    return json;
}

function addSingleSectionToJSONFromRow(sectionKey, row, jsonData, nullCheck, doIfNull) {
    var rowObject = {};
    for (var colIndex = 0; colIndex < row.length; colIndex++) {
        var tempColName = row[colIndex].metadata.colName;
        var tempColData = row[colIndex].value;
        if (nullCheck) {
            if (tempColData === null) {
                doIfNull();
            }
        }
        rowObject[tempColName] = tempColData;
    }
    jsonData[sectionKey] = rowObject;
}


function addArraySectionToJSONFromRows(sectionKey, rowCount, rows, jsonData, eachRow, nullCheck, doIfNull) {
    jsonData[sectionKey] = []; // Empty array
    for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        var rowObject = {};
        var singleRowData = rows[rowIndex];
        for (var colIndex = 0; colIndex < singleRowData.length; colIndex++) {
            var tempColName = singleRowData[colIndex].metadata.colName;
            var tempColData = singleRowData[colIndex].value;
            if (nullCheck) {
                if (tempColData === null) {
                    doIfNull();
                }
            }
            rowObject[tempColName] = tempColData;
        }
        if (eachRow) {
            eachRow(rowObject);
        }
        jsonData[sectionKey].push(rowObject);
    }
}


module.exports = {
    fillArrayFromRows,
    getJSONFromRow,
    addSingleSectionToJSONFromRow,
    addArraySectionToJSONFromRows
};