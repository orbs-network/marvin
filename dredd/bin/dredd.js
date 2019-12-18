#!/usr/bin/env node

const {run} = require("../dredd-run");

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('run', 'Run analysis on job results')
    .example('$0 run --job_id JOB_ID', 'Analyze JOB_ID')
    .alias('j', 'job_id')
    .nargs('j', 1)
    .describe('j', 'Analyze Job')
    .demandOption(['j'])
    .help('h')
    .alias('h', 'help').argv;

if (argv.job_id && argv.job_id.length > 0) {
    run(argv.job_id);
} else {
    console.log("Usage: dredd --job_id <job_id>");
    process.exit(1);
}
