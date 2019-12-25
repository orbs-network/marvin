"use strict";

const _ = require('lodash');
const {info} = require('./src/util');
const fs = require('fs');

// Config is optional - it will contain tolerated thresholds for passing a test, etc.
function passed({current, previous = null, config = null}) {
    if (!current) {
        return {
            analysis: {
                passed: false,
                reason: 'Empty results'
            }
        };
    }

    let jobAnalysis = Object.assign({}, current, {analysis: {}});

    if (current.error && current.error.length > 0) {
        jobAnalysis.analysis.reason = `Returned with error: ${current.error}`;
        return jobAnalysis;
    }

    if (!current.updates || current.updates.length === 0) {
        jobAnalysis.analysis.reason = `No updates`;
        return jobAnalysis;
    }

    const latestUpdate = current.updates[current.updates.length - 1];

    jobAnalysis = Object.assign(jobAnalysis, latestUpdate);
    jobAnalysis.analysis.passed = true;
    jobAnalysis.analysis.reason = null;
    jobAnalysis.summary = latestUpdate.summary;

    compareAgainstPrevious(jobAnalysis, previous, config);
    if (!jobAnalysis.analysis.passed) {
        return jobAnalysis;
    }

    compareAgainstConfig(jobAnalysis, config);

    return jobAnalysis;
}

// If previous is null, do nothing here
function compareAgainstPrevious(jobAnalysis, previous, config) {
}

function compareAgainstConfig(jobAnalysis, config) {
    const results = jobAnalysis.summary;
    const errors = [];
    if (!config) {
        return;
    }
    _.forEach(config.ranges, metric => {
        if (metric.max !== undefined && results[metric.name] > metric.max) {
            errors.push(`Metric ${metric.name} is ${results[metric.name]}, higher than max ${metric.max}`);
        }
        if (metric.min !== undefined && results[metric.name] < metric.min) {
            errors.push(`Metric ${metric.name} is ${results[metric.name]}, lower than min ${metric.min}`);
        }
    });

    if (errors.length > 0){
        const errStr = errors.join(',');
        jobAnalysis.analysis.passed = false;
        jobAnalysis.analysis.reason = errStr;
    }
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