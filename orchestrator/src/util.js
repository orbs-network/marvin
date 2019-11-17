'use strict';

const {config} = require('./orchestrator-config');
const verbosity = process.env.VERBOSE === 'true';

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

function info() {
    if (verbosity) {
        console.log.apply(this, arguments);
    }
}

function generateJobName() {
    const dateStr = new Date().toISOString();
    const randomSuffix = zeroPad(Math.floor(Math.random() * 100), 3);
    return `${dateStr}_${randomSuffix}`;
}

function zeroPad(num, places) {
    return String(num).padStart(places, '0');
}

module.exports = {
    init: init,
    info: info,
    generateJobName: generateJobName,
};