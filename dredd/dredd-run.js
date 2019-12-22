"use strict";

const {info} = require('./src/util');
const fs = require('fs');

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