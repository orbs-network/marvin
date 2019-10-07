const {promisify} = require('util');
const { getConnection } = require('./db');

function insertTransaction(record = {}, data, connection, tableName, callback) {
    const hash = (data.commitHash || '').slice(0, 10);
    const version = data.semanticVersion || '';

    const queryStr = `INSERT INTO ${tableName} (durationMillis, txResult, rr_createdate, rr_createdate_unix, blockHeight, txId, papiUrl, vchain, commitHash, version)
                      VALUES (${record.durationMillis}, '${record.txResult}', NOW(), ${Math.floor(Date.now() / 1000)}, ${record.blockHeight}, '${record.txId}', '${record.papiUrl}', '${data.vchain}', '${hash}', '${version}');`;

    connection.query(queryStr, (error, results, fields) => {

        if (error != null) {
            throw new Error(error)
        }

        callback(null, results)
    });
}

async function listJobs() {

    const conn = await getConnection();
    const [rows,] = await conn.query('SELECT * FROM `jobs`', []);
    console.log(rows);
}


module.exports = {
    insertTransaction: promisify(insertTransaction),
    listJobs
};