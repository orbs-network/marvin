'use strict';

const moment = require('moment');
const _ = require('lodash');
const { readPrometheus } = require('../prometheus');
const { info, debug } = require('../util');

async function updateStateFromPrometheus(job, state) {
    try {
        info(`updateStateFromPrometheus(): job=${JSON.stringify(job)}`);
        const startTime = toUtcISO(job.start_time);
        const endTime = toUtcISO(job.end_time);

        const heapAllocPromise = readPrometheus(state, startTime, endTime, 'Runtime_HeapAlloc_Bytes', job.vchain);
        const goroutinePromise = readPrometheus(state, startTime, endTime, 'Runtime_NumGoroutine_Number', job.vchain);

        const [rawAllocMem, rawGoroutines] = await Promise.all([heapAllocPromise, goroutinePromise]);

        const rawAllocMemRes = rawAllocMem.data.result;
        const rawGoroutinesRes = rawGoroutines.data.result;

        debug(`PROMETHEUS RAW_ALLOC_MEM=${JSON.stringify(rawAllocMemRes)}`);
        debug(`PROMETHEUS RAW_GOROUTINES=${JSON.stringify(rawGoroutinesRes)}`);

        debug(`PROMETHEUS RAW_ALLOC_MEM_NODE0=${JSON.stringify(rawAllocMemRes[0])}`);

        const maxAllocMem = maxOverAllNodes(rawAllocMemRes);
        const maxGoroutines = maxOverAllNodes(rawGoroutinesRes);

        const maxAllocMemNode0 = maxOverSpecificNode(rawAllocMemRes, 0);
        const maxGoroutinesNode0 = maxOverSpecificNode(rawGoroutinesRes, 0);

        info(`PROMETHEUS: MAX_ALLOC_MEM=${maxAllocMem}`);
        info(`PROMETHEUS: MAX_GOROUTINES=${maxGoroutines}`);
        info(`PROMETHEUS: MAX_ALLOC_MEM_NODE0=${maxAllocMemNode0}`);
        info(`PROMETHEUS: MAX_GOROUTINES_NODE0=${maxGoroutinesNode0}`);

        state.summary.max_alloc_mem = maxAllocMemNode0;
        state.summary.max_goroutines = maxGoroutinesNode0;

    } catch (ex) {
        info(`PROMETHEUS exception: ${ex}`);
        throw ex;
    }

}

function maxOverAllNodes(prometheusResponse) {
    const maxPerNode = _.map(prometheusResponse, resultPerNode => {
        const values = _.map(resultPerNode.values, pair => { return pair[1]; });
        return Math.max(...values);
    });
    return Math.max(...maxPerNode);
}

function maxOverSpecificNode(prometheusResponse, nodeIdx) {
    const nodeResults = prometheusResponse[nodeIdx];
    const values = _.map(nodeResults.values, pair => { return pair[1]; });
    return Math.max(...values);
}


function toUtcISO(time) {
    return moment(time || new Date()).utc().format();
}

module.exports = {
    updateStateFromPrometheus: updateStateFromPrometheus,
};