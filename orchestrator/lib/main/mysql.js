const { promisify } = require('util')

function insertTransaction(record = {}, connection, tableName, callback) {
    connection.query(`INSERT INTO ${tableName} (durationMillis, txResult, rr_createdate, rr_createdate_unix, blockHeight, txId, papiUrl)
                      VALUES (${record.durationMillis}, '${record.txResult}', NOW(), ${Math.floor(Date.now() / 1000)}, ${record.blockHeight}, '${record.txId}', '${record.papiUrl}');`, (error, results, fields) => {

        if (error != null) {
            throw new Error(error)
        }

        callback(null, results)
    });
}

module.exports = {
    insertTransaction: promisify(insertTransaction)
}