// Import the mongoose module
const mongoose = require('mongoose');

// Get mongoose to use the global promise library
mongoose.Promise = global.Promise;

// Import the module with data environment for db connection
const env = require('./env/environment');

// Set up the connection uri
const mongoUri = `mongodb://${env.username}:${env.password}@${env.host1}:${env.port1},${env.host2}:${env.port2},${env.host3}:${env.port3}/${env.dbName}?ssl=true&replicaSet=${env.replicaSet}&authSource=admin`;


function connect() {
    mongoose.connect(mongoUri);
    // Get the default connection
    var db = mongoose.connection;
    // Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log("Connected to DB");
    });
}

module.exports = {
    connect
};