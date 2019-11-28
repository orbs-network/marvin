'use strict';

const verbosity = process.env.VERBOSE === 'true';
const verbosityDebug = process.env.VERBOSE_DEBUG === 'true';

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

async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, 5000));
}

module.exports = {
    info, debug, sleep
};