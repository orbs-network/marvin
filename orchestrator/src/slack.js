'use strict';

const execSync = require('child_process').execSync;
const { config } = require('./orchestrator-config');
const { info } = require('./util');
const { getCommiterUsernameByCommitHash, getSlackUsernameForGithubUser } = require('./github');

// Read a url from the environment variables
function notifySlack(message) {
    if (config.slack_url.length === 0) {
        info('Skipping reporting to Slack since no Slack URL was provided');
        info(message);
        return;
    }

    const baseCommand = `curl -s -X POST --data-urlencode "payload={\\"text\\": \\"${message}\\"}" ${config.slack_url}`;
    try {
        execSync(baseCommand);
    } catch (ex) {
        info(`Failed to notify Slack: ${ex}`);
    }
}

function createSlackMessageJobRunning(jobUpdate, state) {
    const startTime = jobUpdate.start_time || '1h';
    const endTime = jobUpdate.end_time || 'now';
    return `*--------------------------------------------------------------------------*
*RUNNING* for *${Math.floor((jobUpdate.runtime || 0) / 1000)}* of ${jobUpdate.duration_sec} seconds, on vchain ${jobUpdate.vchain} with ${jobUpdate.tpm} tx/min.
*--------------------------------------------------------------------------*
Sent *${jobUpdate.summary.total_tx_count}* transactions with *${jobUpdate.summary.err_tx_count}* errors. ${jobUpdate.summary.tx_result_types}
Service times (ms): AVG=*${jobUpdate.summary.avg_service_time_ms}* MEDIAN=*${jobUpdate.summary.median_service_time_ms}* P90=*${jobUpdate.summary.p90_service_time_ms}* P99=*${jobUpdate.summary.p99_service_time_ms}* MAX=*${jobUpdate.summary.max_service_time_ms}* STDDEV=*${jobUpdate.summary.stddev_service_time_ms}*
MaxAllocMem: ${state.summary.max_alloc_mem} bytes, MaxGoroutines: ${state.summary.max_goroutines}
Errors: ${jobUpdate.error || 'none'}
<http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:3000/d/a-3pW-3mk/testnet-results?orgId=1&from=${startTime}&to=${endTime}&var-vchain=${jobUpdate.vchain}&var-validator=All|Grafana> | _Job ID: [${jobUpdate.job_id || 'NA'}] Version: ${jobUpdate.summary.semantic_version || 'NA'} Hash: ${jobUpdate.summary.commit_hash || 'NA'}_`;

    // All: ${JSON.stringify(jobUpdate)}`;
}

async function createSlackMessageJobDone(jobUpdate, state) {
    const startTime = jobUpdate.start_time || '1h';
    const endTime = jobUpdate.end_time || 'now';

    const committer = await getCommiterUsernameByCommitHash(jobUpdate.summary.commit_hash);
    const slackUsername = getSlackUsernameForGithubUser(committer);

    return `*--------------------------------------------------------------------------*
*DONE* running after *${Math.floor((jobUpdate.runtime || 0) / 1000)}* seconds on vchain ${jobUpdate.vchain} with ${jobUpdate.tpm} tx/min.
*--------------------------------------------------------------------------*
Sent *${jobUpdate.summary.total_tx_count}* transactions with *${jobUpdate.summary.err_tx_count}* errors. ${jobUpdate.summary.tx_result_types}
Service times (ms): AVG=*${jobUpdate.summary.avg_service_time_ms}* MEDIAN=*${jobUpdate.summary.median_service_time_ms}* P90=*${jobUpdate.summary.p90_service_time_ms}* P99=*${jobUpdate.summary.p99_service_time_ms}* MAX=*${jobUpdate.summary.max_service_time_ms}* STDDEV=*${jobUpdate.summary.stddev_service_time_ms}*
MaxAllocMem: ${state.summary.max_alloc_mem} bytes, MaxGoroutines: ${state.summary.max_goroutines}
Errors: ${jobUpdate.error || 'none'}
<http://ec2-34-222-245-15.us-west-2.compute.amazonaws.com:3000/d/a-3pW-3mk/testnet-results?orgId=1&from=${startTime}&to=${endTime}&var-vchain=${jobUpdate.vchain}&var-validator=All|Grafana> | _Job ID: [${jobUpdate.job_id || 'NA'}] Version: ${jobUpdate.summary.semantic_version || 'NA'} Hash: ${jobUpdate.summary.commit_hash || 'NA'}_
Marvin build triggered by <@${slackUsername}>
`;
    // All: ${JSON.stringify(jobUpdate)}`;
}

function createSlackMessageJobError(jobUpdate, state) {
    jobUpdate = jobUpdate || {};
    jobUpdate.summary = jobUpdate.summary || {};

    return `*[${jobUpdate.summary.semantic_version || ''}]* _[${jobUpdate.job_id || ''}]_ *ERROR:* ${jobUpdate.error}`;
}

module.exports = {
    notifySlack: notifySlack,
    createSlackMessageJobRunning: createSlackMessageJobRunning,
    createSlackMessageJobDone: createSlackMessageJobDone,
    createSlackMessageJobError: createSlackMessageJobError,

};
