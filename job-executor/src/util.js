'use strict';

const verbosity = process.env.VERBOSE === 'true';

function info() {
    if (verbosity) {
        console.log.apply(this, arguments);
    }
}

async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, 5000));
}

module.exports = {
    info, sleep
};