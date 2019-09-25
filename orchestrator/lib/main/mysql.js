const { promisify } = require('util')

function insertTransaction(record = {}, data, connection, tableName, callback) {
    connection.query(`INSERT INTO ${tableName} (durationMillis, txResult, rr_createdate, rr_createdate_unix, blockHeight, txId, papiUrl, vchain, commitHash, version)
                      VALUES (${record.durationMillis}, '${record.txResult}', NOW(), ${Math.floor(Date.now() / 1000)}, ${record.blockHeight}, '${record.txId}', '${record.papiUrl}', '${data.vchain}', '${data.commitHash||''.slice(0,6)}', '${data.semanticVersion||''}');`, (error, results, fields) => {

        if (error != null) {
            throw new Error(error)
        }

        callback(null, results)
    });
}

module.exports = {
    insertTransaction: promisify(insertTransaction)
}