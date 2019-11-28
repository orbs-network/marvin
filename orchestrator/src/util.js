'use strict';

const moment = require('moment');
const {config} = require('./orchestrator-config');
const verbosity = process.env.VERBOSE === 'true';
const verbosityDebug = process.env.VERBOSE_DEBUG === 'true';

function init() {
    if (!process.env.SLACK_MARVIN_NOTIFICATIONS_KEY || process.env.SLACK_MARVIN_NOTIFICATIONS_KEY.length === 0) {
        info(`Environment variable SLACK_MARVIN_NOTIFICATIONS_KEY must be set!`);
        process.exit(1);
    }
    config.slack_url = `https://hooks.slack.com/services/${process.env.SLACK_MARVIN_NOTIFICATIONS_KEY}`;
    config.executor_host = `127.0.0.1`;
    config.executor_base_port = 4568;
    info(`Set Slack URL to ${config.slack_url}`);
}


function debug(s) {
    if (verbosityDebug) {
        console.log(s);
    }
}

function info(s) {
    if (verbosity || verbosityDebug) {
        console.log(s);
    }
}

function generateJobId() {
    const dateStr = moment.utc().format('YYYYMMDD_HHmmss');
    const randomSuffix = zeroPad(Math.floor(Math.random() * 100), 3);
    return `${dateStr}_${randomSuffix}`;
}

function isoToDate(iso) {
    return moment(iso);
}


function zeroPad(num, places) {
    return String(num).padStart(places, '0');
}

module.exports = {
    debug: debug,
    init: init,
    info: info,
    generateJobId: generateJobId,
    isoToDate: isoToDate,
};