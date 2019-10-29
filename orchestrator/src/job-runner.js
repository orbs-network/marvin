const {exec} = require('child-process-promise');
const {info} = require('./util');
const {insertTransaction} = require('./mysql');


async function storeBatchOutputs(dataAsString) {
    const data = JSON.parse(dataAsString);
    const tableName = 'transactions';
    // const tableName = config.outputTable || 'transactions';

    await Promise.all(data.transactions.map(tx => {
        return insertTransaction(tx, data, tableName)
    }))
}

async function runJobExecutor() {
    try {
        const result = await exec(`node ../../../job-executor/app.js ${clientConfigPath} IDO,5`);
        // const result = await exec(`node ../../../job-executor/app.js ${clientConfigPath} IDO,5`);
        // const result = await exec(`../client/client ${clientConfigPath} IDO,5`);
        info('Returned from job executor with exit code ' + result.childProcess.exitCode);
        return {
            id: o.id,
            exitCode: result.childProcess.exitCode,
            stderr: result.stderr,
            stdout: result.stdout,
        }
    } catch (ex) {
        console.log('Failed to run job executor: ' + ex);
        throw ex
    }

}


process.on('exit', () => {
    info('Closing the connection to MySQL');
    getConnection().end();
});

module.exports = {
    runJobExecutor,
};