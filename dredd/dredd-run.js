"use strict";

const {info} = require('./src/util');
const fs = require('fs');

// Config is optional - it will contain tolerated thresholds for passing a test, etc.
function passed({current, previous, config={}}) {
    if (!current) {
        return {
            analysis: {
                passed: false,
                reason: 'Empty results'
            }
        };
    }
    let jobAnalysis = Object.assign({}, current, {
        analysis: {
            passed: false,
            reason: `Returned with error: ${current.error}`
        }
    });
    if (current.error && current.error.length > 0) {
        jobAnalysis.analysis.reason = `Returned with error: ${current.error}`;
        return jobAnalysis;
    }
    if (!current.updates || current.updates.length === 0) {
        jobAnalysis.analysis.reason = `No updates`;
        return jobAnalysis;
    }
    const latestUpdate = current.updates[current.updates.length-1];

    jobAnalysis = Object.assign(jobAnalysis, latestUpdate);
    jobAnalysis.analysis.passed = true;
    jobAnalysis.analysis.reason = null;
    jobAnalysis.summary = latestUpdate.summary;
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