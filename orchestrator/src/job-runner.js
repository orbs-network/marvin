const rp = require('request-promise-native');
const {spawn} = require('child_process');
const {info, generateJobId} = require('./util');
const {insertTransaction} = require('./mysql');
const path = require('path');

async function storeBatchOutputs(dataAsString) {
    const data = JSON.parse(dataAsString);
    const tableName = 'transactions';
    // const tableName = config.outputTable || 'transactions';

    await Promise.all(data.transactions.map(tx => {
        return insertTransaction(tx, data, tableName)
    }))
}

async function runJob(jobProps) {
    console.log(__dirname);
    const cwd = path.join(__dirname, '../../job-executor');
    const jobExecutor = spawn('node', ['executor.js'], {cwd});

    jobExecutor.on('exit', (code, signal) => {
        info('Job Executor process exited with ' +
            `code ${code} and signal ${signal}`);
    });

    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    sendJobStart(jobProps.job_id);

    info(`JobExecutor with ${jobExecutor.pid} started.`);

    // TODO Call executor with /job/start

    return {
        status: 'PENDING',
        job_id: jobProps.job_id,
        props: jobProps,
    }
}

function sendJobStart(jobId) {
    const options = {
        method: 'POST',
        uri: 'http://localhost:4568/job/start',
        body: {
            job_id: jobId,
            client_timeout_sec: 3,
            job_timeout_sec: 10
        },
        json: true,
    };

    return rp(options)
        .then(res => {
            info(`Response from JobExecutor: ${JSON.stringify(res)}`);
        })
        .catch(ex => {
            info(ex);
        });
}


process.on('exit', () => {
    info('Shutdown');
});

module.exports = {
    runJob: runJob,
};