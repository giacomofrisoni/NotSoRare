const username = 'GiacomoFrisoni';
const password = 'blilBKTvm7YexvVY';
const host1 = 'notsorarecluster-shard-00-00-8vuir.mongodb.net';
const port1 = 27017;
const host2 = 'notsorarecluster-shard-00-01-8vuir.mongodb.net';
const port2 = 27017;
const host3 = 'notsorarecluster-shard-00-02-8vuir.mongodb.net';
const port3 = 27017;

const dbName = 'notsorare';
const replicaSet = 'NotSoRareCluster-shard-0';

module.exports = {
    username,
    password,
    host1,
    port1,
    host2,
    port2,
    host3,
    port3,
    dbName,
    replicaSet
};