"use strict";

const {info} = require('./src/util');
const fetch = require('node-fetch');

function passed(res) {
    return !(res.error && res.error.length > 0);
}

run();

async function run() {

    if (!process.env.MARVIN_ORCHESTRATOR_URL) {
        info("Environment variable MARVIN_ORCHESTRATOR_URL is undefined");
        process.exit(1);
    }
    process.argv.splice(0, 2);
    const jobId = process.argv[0];

    if (!jobId) {
        info("JobId not provided in command line.");
        info("Usage: <JobId>");
        process.exit(1);
    }
    try {
        const res = await readJobResults(jobId, process.env.MARVIN_ORCHESTRATOR_URL);
        const analysis = passed(res);
        if (!analysis.passed) {
            info(`Test failed: ${JSON.stringify(analysis)}`);
            process.exit(10);
        }
    } catch (ex) {
        info(`Error in readJobResults(): ${ex}`);
        process.exit(2);
    }
    info(`Test passed`);
}

async function readJobResults(jobId, marvinUrl) {
    const jobStatusUrl = `${marvinUrl}/jobs/${jobId}/status`;
    fetch(jobStatusUrl)
        .then(res => {
            return res.json();
        });
}

module.exports = {
    passed: passed,
};