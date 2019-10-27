const {promisify} = require('util');
const { info } = require('./util');
const knex = require('knex')({
    client: 'mysql2',
    version: '5.7',
    connection: {
        host: '127.0.0.1',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'marvin'
    }
});

function insertTransaction(record = {}, data, tableName) {
    const hash = (data.commitHash || '').slice(0, 10);
    const version = data.semanticVersion || '';

    return knex(tableName)
        .insert({
            durationMillis: record.durationMillis,
            txResult: record.txResult,
            rr_createdate: knex.fn.now(),
            rr_createdate_unix: Math.floor(Date.now() / 1000),
            blockHeight: record.blockHeight,
            txId: record.txId,
            papiUrl: record.papiUrl,
            vchain: data.vchain,
            commitHash: hash,
            version: version
        });
    // const queryStr = `INSERT INTO ${tableName} (durationMillis, txResult, rr_createdate, rr_createdate_unix, blockHeight, txId, papiUrl, vchain, commitHash, version)
    //                   VALUES (${record.durationMillis}, '${record.txResult}', NOW(),
    //                   ${Math.floor(Date.now() / 1000)},
    //                   ${record.blockHeight}, '${record.txId}', '${record.papiUrl}', '${data.vchain}', '${hash}', '${version}');`;

    // connection.query(queryStr, (error, results, fields) => {
    //
    //     if (error != null) {
    //         throw new Error(error)
    //     }
    //
    //     callback(null, results)
    // });
}

async function listJobs() {

    const rows = knex.select().table('jobs');
    // const conn = await getConnection();
    // const rows = await conn.query('SELECT * FROM `jobs`', []);
    console.log(rows);
}


module.exports = {
    knex,
    insertTransaction,
    listJobs
};