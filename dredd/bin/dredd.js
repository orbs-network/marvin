#!/usr/bin/env node

const {run} = require("../dredd-run");

const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('run', 'Run analysis on job results')
    .example('$0 run --job_status JOB_STATUS_FILE_PATH', 'Analyze JOB_STATUS_FILE_PATH')
    .alias('j', 'job_status')
    .nargs('j', 1)
    .describe('j', 'Analyze Job')
    .demandOption(['j'])
    .help('h')
    .alias('h', 'help').argv;

if (argv.job_status && argv.job_status.length > 0) {
    run(argv.job_status);
} else {
    console.log("Usage: dredd --job_status <job_status_file_path>");
    process.exit(1);
}
