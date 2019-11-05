'use strict';

const {generateJobId} = require('../util');

function insertJobToDb(jobProps) {

    // TODO DB Stuff

    return generateJobId();
}

function createSlackMessageJobRunning(jobUpdate) {
    return `_[${jobUpdate.job_id}]_ Started Stress test on vchain 2013 on testnet`;
}

function createSlackMessageJobDone(jobUpdate) {
    return `_[${jobUpdate.job_id}]_ Completed Stress test with status *${jobUpdate.job_status}* on vchain 2013 version _${jobUpdate.results.version}_ in *${jobUpdate.runtime}* ms. 
Total transactions: *${jobUpdate.results.total_tx}* (of which *${jobUpdate.results.err_tx}* returned with error). 
Max service time: *${jobUpdate.results.max_service_time_ms}* ms`;

}


module.exports = {
    insertJobToDb: insertJobToDb,
    createSlackMessageJobRunning: createSlackMessageJobRunning,
    createSlackMessageJobDone: createSlackMessageJobDone,
};