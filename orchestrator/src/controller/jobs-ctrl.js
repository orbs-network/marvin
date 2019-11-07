'use strict';

const {generateJobId} = require('../util');

function insertJobToDb(jobProps) {

    // TODO DB Stuff

    return generateJobId();
}

function createSlackMessageJobRunning(jobUpdate) {
    return `*_RUNNING Job [${jobUpdate.job_id}]_*
vchain: 2013. TX/min: ${jobUpdate.tpm}, Expected duration: >${jobUpdate.duration_sec} seconds. 
All: ${JSON.stringify(jobUpdate)}`;
}

function createSlackMessageJobDone(jobUpdate) {
    return `*_FINISHED Job [${jobUpdate.job_id}]_*
Status: *${jobUpdate.job_status}* vchain: 2013 version: _${jobUpdate.results.version}_ runtime: *${jobUpdate.runtime}* ms. 
Total transactions: *${jobUpdate.results.total_tx_count}* (of which *${jobUpdate.results.err_tx_count}* returned with error). 
Avg service time: *${jobUpdate.results.avg_service_time_ms}* ms
Max service time: *${jobUpdate.results.max_service_time_ms}* ms
All: ${JSON.stringify(jobUpdate)}`;
}

function createSlackMessageJobError(jobUpdate) {
    return `_[${jobUpdate.job_id}]_ *ERROR:* ${jobUpdate.error}`;
}

function validateJobStart(jobUpdate) {
    if (!jobUpdate) {
        return {
            error: 'Missing jobUpdate body'
        };
    }

    if (!jobUpdate.tpm) {
        jobUpdate.error = "Missing or zero tpm property";
        return jobUpdate;
    }

    if (!jobUpdate.duration_sec) {
        jobUpdate.error = "Missing or zero duration_sec property";
        return jobUpdate;
    }

    return null;
}

module.exports = {
    insertJobToDb: insertJobToDb,
    createSlackMessageJobRunning: createSlackMessageJobRunning,
    createSlackMessageJobDone: createSlackMessageJobDone,
    createSlackMessageJobError: createSlackMessageJobError,
    validateJobStart: validateJobStart,
};