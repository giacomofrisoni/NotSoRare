var Connection = require("tedious").Connection;
var Request = require("tedious").Request;

// Create connection to database
var config = {
    userName: "StandardUser",
    password: "L!vX;c4$MseLm3SL",
    server: "notsorareserver.database.windows.net",
    options: {
        database: "NotSoRareDB",
        encrypt: true
    }
};
var connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", function (err) {
    if (err) {
        console.log(err);
    } else {
        queryDatabase();
    }
});

function queryDatabase() {
    console.log('Reading rows from the Table...');

    // Read all rows from table
    request = new Request(
        "SELECT Name FROM Administrator",
        function (err, rowCount, rows) {
            console.log(rowCount + ' row(s) returned');
            process.exit();
        }
    );

    request.on('row', function (columns) {
        columns.forEach(function (column) {
            console.log("%s\t%s", column.metadata.colName, column.value);
        });
    });
    connection.execSql(request);
}