const {fork} = require('child_process');
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

async function runJob(jobProps) {
    const jobExecutor = fork(`../../../job-executor/app.js ${clientConfigPath} IDO,5`);
    jobExecutor.on('exit', (code, signal) => {
        info('Job Executor process exited with ' +
            `code ${code} and signal ${signal}`);
    });

    info(`JobExecutor with ${jobExecutor.pid} started.`);
}


process.on('exit', () => {
    info('Shutdown');
});

module.exports = {
    runJobExecutor: runJob,
};