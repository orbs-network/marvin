#!/usr/bin/env node

const {run} = require("../dredd-run");

const argv = require('yargs').argv;
if (argv.job_id && argv.job_id.length > 0) {
    run(argv.job_id);
} else {
    console.log("Usage: dredd --job_id <job_id>");
    process.exit(1);
}
