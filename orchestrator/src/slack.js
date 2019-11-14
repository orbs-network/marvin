'use strict';

const execSync = require('child_process').execSync;
const {config} = require('./orchestrator-config');
const {info} = require('./util');

// Read a url from the environment variables
function notifySlack(message) {
    info(`Sending to Slack URL: ${config.slack_url}`);
    const baseCommand = `curl -s -X POST --data-urlencode "payload={\\"text\\": \\"${message}\\"}" ${config.slack_url}`;
    try {
        execSync(baseCommand);
    } catch (ex) {
        info(`Failed to notify Slack: ${ex}`);
    }
}

function createSlackMessageJobRunning(jobUpdate) {
    return `*[${jobUpdate.summary.semantic_version||''}]* *_RUNNING Job [${jobUpdate.job_id}]_*
vchain: ${jobUpdate.vchain}. TX/min: ${jobUpdate.tpm}, Expected runtime: >${jobUpdate.duration_sec} seconds. Current runtime: ${Math.floor((jobUpdate.runtime || 0) / 1000)} seconds. 
All: ${JSON.stringify(jobUpdate)}`;
}

function createSlackMessageJobDone(jobUpdate) {
    return `*[${jobUpdate.summary.semantic_version||''}]* *_FINISHED Job [${jobUpdate.job_id}]_*
Status: *${jobUpdate.job_status}* vchain: *${jobUpdate.vchain}* runtime: *${Math.floor((jobUpdate.runtime || 0) / 1000)}* seconds. 
Total transactions: *${jobUpdate.summary.total_tx_count}* (of which *${jobUpdate.summary.err_tx_count}* returned with error). 
Total transactions duration: ${jobUpdate.summary.total_dur} ms
Service times (ms): AVG=*${jobUpdate.summary.avg_service_time_ms}* MEDIAN=*${jobUpdate.summary.median_service_time_ms}* P90=*${jobUpdate.summary.p90_service_time_ms}* P99=*${jobUpdate.summary.p99_service_time_ms}* MAX=*${jobUpdate.summary.max_service_time_ms}* STDDEV=*${jobUpdate.summary.stddev_service_time_ms}*
All: ${JSON.stringify(jobUpdate)}`;
}

function createSlackMessageJobError(jobUpdate) {
    jobUpdate = jobUpdate||{};
    jobUpdate.summary = jobUpdate.summary||{};

    return `*[${jobUpdate.summary.semantic_version||''}]* _[${jobUpdate.job_id||''}]_ *ERROR:* ${jobUpdate.error}`;
}

module.exports = {
    notifySlack: notifySlack,
    createSlackMessageJobRunning: createSlackMessageJobRunning,
    createSlackMessageJobDone: createSlackMessageJobDone,
    createSlackMessageJobError: createSlackMessageJobError,

};
