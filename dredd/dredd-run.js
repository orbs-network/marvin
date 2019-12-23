"use strict";

const {info} = require('./src/util');
const fs = require('fs');

// Config is optional - it will contain tolerated thresholds for passing a test, etc.
function passed(jobResults, cfg = {}) {
    if (!jobResults) {
        return {
            analysis: {
                passed: false,
                reason: 'Empty results'
            }
        };
    }
    if (jobResults.error && jobResults.error.length > 0) {
        const jobAnalysis = Object.assign({}, jobResults, {
            analysis: {
                passed: false,
                reason: `Returned with error: ${jobResults.error}`
            }
        });
        return jobAnalysis;
    }
    if (!jobResults.updates || jobResults.updates.length === 0) {
        const jobAnalysis = Object.assign({}, jobResults, {
            analysis: {
                passed: false,
                reason: `No updates`
            }
        });
        return jobAnalysis;
    }
    const jobAnalysis = Object.assign({}, jobResults, {
        analysis: {
            passed: true
        }
    });
    return jobAnalysis;
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