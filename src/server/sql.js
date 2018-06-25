// Import the modules for the db connection
var Connection = require("tedious").Connection;

// Import the module with data environment for db connection
const env = require('./env/sql_environment');

// Create connection to database
var config = {
    userName: env.username,
    password: env.password,
    server: env.server,
    options: {
        database: env.dbName,
        encrypt: true
    }
};

// Get the connection
var connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on('connect', function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to Azure Sql Database");
    }
});

module.exports = {
    connection
};