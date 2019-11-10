'use strict';

const rp = require('request-promise-native');
const {spawn} = require('child_process');
const path = require('path');
const {config} = require('./orchestrator-config');
const {state} = require('./orch-state');

const {info} = require('./util');
const {insertTransaction} = require('./mysql');


async function storeBatchOutputs(dataAsString) {
    const data = JSON.parse(dataAsString);
    const tableName = 'transactions';
    // const tableName = config.outputTable || 'transactions';

    await Promise.all(data.transactions.map(tx => {
        return insertTransaction(data, tableName, tx);
    }));
}

async function sendJob(jobProps) {
    const cwd = path.join(__dirname, '../../job-executor');
    const jobExecutorPort = jobProps.port || 4568;
    const jobExecutor = spawn('node', ['executor.js', `-port=${jobExecutorPort}`], {cwd});
    state.live_jobs++;
    state.jobs[`${jobExecutor.pid}`] = {
        timestamp: new Date().toISOString(),
    };
    info(`State after starting job: ${state}`);

    jobExecutor.on('exit', (code, signal) => {
        state.live_jobs--;
        delete state.jobs[`${jobExecutor.pid}`];
        info(`Job Executor process pid=${jobExecutor.pid} exited with code ${code} and signal ${signal}`);
    });

    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    sendJobStartToExecutor(jobProps);

    info(`JobExecutor with ${jobExecutor.pid} started on port ${jobExecutorPort}.`);

    // TODO Call executor with /job/start

    return {
        status: 'PENDING',
        job_id: jobProps.job_id,
        props: jobProps,
    };
}

function sendJobStartToExecutor(jobProps) {

    const uri = `http://${config.executor_host}:${config.executor_port}/job/start`;

    const options = {
        method: 'POST',
        uri: uri,
        body: jobProps,
        json: true,
    };

    return rp(options)
        .then(res => {
            info(`Response from JobExecutor: ${JSON.stringify(res)}`);
        })
        .catch(ex => {
            info(`Error sending to Job Executor: ${ex}`);
        });
}

function shutdownExecutor() {
    const uri = `http://${config.executor_host}:${config.executor_port}/shutdown`;
    const options = {
        method: 'GET',
        uri: uri,
    };
    return rp(options);
}


process.on('exit', () => {
    info('Shutdown');
});

module.exports = {
    sendJob: sendJob,
    shutdownExecutor: shutdownExecutor,
};