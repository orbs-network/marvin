"use strict";

const {info} = require('./src/util');
const fs = require('fs');

// Config is optional - it will contain tolerated thresholds for passing a test, etc.
function passed(jobResults, cfg = {}) {
    if (!jobResults) {
        return {
            passed: false,
            reason: 'Empty results'
        };
    }
    if (jobResults.error && jobResults.error.length > 0) {
        return {
            passed: false,
            reason: `Returned with error: ${jobResults.error}`
        };
    }
    if (!jobResults.updates || jobResults.updates.length === 0) {
        return {
            passed: false,
            reason: `No updates`
        };
    }
    return {
        passed: true
    };
}

async function run(jobResultsFilePath) {
    try {
        const res = await readJobResults(jobResultsFilePath);
        const analysis = passed(res);
        if (!analysis.passed) {
            info(`Test failed: ${JSON.stringify(analysis)}`);
            process.exit(10);
        }
    } catch (err) {
        info(`Error: ${err}`);
        process.exit(2);
    }
    info(`Test passed`);
}

async function readJobResults(jobResultsFilePath) {
    info(`Reading job status from path: ${jobResultsFilePath}`);
    return new Promise((resolve, reject) => {
        fs.readFile(jobResultsFilePath, (err, contents) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(contents));
        });
    });
}

module.exports = {
    passed: passed,
    run: run,
};