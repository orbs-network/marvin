'use strict';

const moment = require('moment');

const verbosity = process.env.VERBOSE === 'true';
const verbosityDebug = process.env.VERBOSE_DEBUG === 'true';


function info() {
    if (verbosity || verbosityDebug) {
        console.log.apply(this, arguments);
    }
}

function debug() {
    if (verbosityDebug) {
        console.log.apply(this, arguments);
    }
}


function logJson(json) {
    console.log(JSON.stringify(json));
}

function generateJobId() {
    const dateStr = moment().format('YYYYMMDD_HHmmss');
    const randomSuffix = zeroPad(Math.floor(Math.random() * 100), 3);
    return `${dateStr}_${randomSuffix}`;
}

function zeroPad(num, places) {
    return String(num).padStart(places, '0');
}

module.exports = {
    info,
    debug,
    logJson,
    generateJobId,
};