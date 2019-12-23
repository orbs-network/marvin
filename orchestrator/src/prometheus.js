'use strict';

const rp = require('request-promise-native');
const {debug} = require('./util');

async function readPrometheus(state, startTimeISO, endTimeISO, metric, vchain) {

    const STEP_SEC=10;

    if (!startTimeISO || !endTimeISO) {
        throw "readPrometheus(): startTime or endTime are empty";
    }
    const queryUrl = `${state.prometheus_url}/api/v1/query_range?query=${metric}{vcid="${vchain}"}&start=${startTimeISO}&end=${endTimeISO}&step=${STEP_SEC}s`;
    debug(`PROMETHEUS calling URL: ${queryUrl}`);

    const options = {
        method: 'GET',
        timeout: 5000,
        uri: queryUrl,
        json: true,
    };

    return rp(options);
    // .then(res => {
    //     info(`PROMETHEUS response (HTTP ${res.status}): ${JSON.stringify(res)}`);
    //     if (res.status !== 200) {
    //         throw res.error || 'Unknown Prometheus error';
    //     }
    //     return res;
    // })
    // .catch(ex => {
    //     throw `PROMETHEUS Error: ${ex}`;
    // });
}

module.exports = {
    readPrometheus: readPrometheus,
};