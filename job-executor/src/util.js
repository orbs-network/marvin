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

// FROM: "failed sending http post: Post http://35.161.123.97/vchains/323142232/api/v1/send-transaction: read tcp 172.17.0.2:53928->35.161.123.97:80: read: connection reset by peer"
// TO: "failed sending http post: Post http://35.161.123.97/vchains/323142232/api/v1/send-transaction: connection reset by peer"
// That is, remove this part: "read tcp 172.17.0.2:53928->35.161.123.97:80: read: "
function sanitizeErrorMessage(str) {
    const RE = /read tcp .+ read: /;
    return str.replace(RE, '');
}

module.exports = {
    info, debug, sleep, sanitizeErrorMessage
};