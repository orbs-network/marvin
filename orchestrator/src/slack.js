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
    return `*_RUNNING Job [${jobUpdate.job_id}]_*
vchain: 2013. TX/min: ${jobUpdate.tpm}, Expected duration: >${jobUpdate.duration_sec} seconds. Current runtime: ${Math.floor((jobUpdate.runtime || 0) / 1000)} seconds. 
All: ${JSON.stringify(jobUpdate)}`;
}

function createSlackMessageJobDone(jobUpdate) {
    return `*_FINISHED Job [${jobUpdate.job_id}]_*
Status: *${jobUpdate.job_status}* vchain: 2013 version: _${jobUpdate.summary.version || 'NA'}_ runtime: *${Math.floor((jobUpdate.runtime || 0) / 1000)}* seconds. 
Total transactions: *${jobUpdate.summary.total_tx_count}* (of which *${jobUpdate.summary.err_tx_count}* returned with error). 
Total transactions duration: ${jobUpdate.total_dur} ms
Avg service time: *${jobUpdate.summary.avg_service_time_ms}* ms
Max service time: *${jobUpdate.summary.max_service_time_ms}* ms
All: ${JSON.stringify(jobUpdate)}`;
}

function createSlackMessageJobError(jobUpdate) {
    return `_[${jobUpdate.job_id}]_ *ERROR:* ${jobUpdate.error}`;
}

module.exports = {
    notifySlack: notifySlack,
    createSlackMessageJobRunning: createSlackMessageJobRunning,
    createSlackMessageJobDone: createSlackMessageJobDone,
    createSlackMessageJobError: createSlackMessageJobError,

};
