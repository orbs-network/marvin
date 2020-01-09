'use strict';

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

async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, 5000));
}

module.exports = {
    info, debug, sleep
};