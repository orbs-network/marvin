"use strict";

const {info} = require('./src/util');
const fetch = require('node-fetch');

function passed(res) {
    info(`Passed(): res=${JSON.stringify(res)}`);
    if (res && !res.error) {
        return {
            passed: true
        };
    }
    return {
        passed: false
    };
}

async function run() {

    const marvinUrl = process.env.MARVIN_ORCHESTRATOR_URL || 'ec2-34-222-245-15.us-west-2.compute.amazonaws.com:4567';

    process.argv.splice(0, 2);
    const jobId = process.argv[0];

    if (!jobId) {
        info("JobId not provided in command line.");
        info("Usage: <JobId>");
        process.exit(1);
    }
    try {
        const res = await readJobResults(jobId, marvinUrl);
        const analysis = passed(res);
        if (!analysis.passed) {
            info(`Test failed: ${JSON.stringify(analysis)}`);
            process.exit(10);
        }
    } catch (ex) {
        info(`Error: ${ex}`);
        process.exit(2);
    }
    info(`Test passed`);
}

async function readJobResults(jobId, marvinUrl) {
    const jobStatusUrl = `http://${marvinUrl}/jobs/${jobId}/status`;
    info(`Reading job status from URL: ${jobStatusUrl}`);
    return fetch(jobStatusUrl)
        .then(res => {
            info(`Got result: ${res}`);
            return res.json();
        });
}

module.exports = {
    passed: passed,
    run: run,
};