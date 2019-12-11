'use strict';

const moment = require('moment');
const _ = require('lodash');
const { readPrometheus } = require('../prometheus');
const { info } = require('../util');

async function updateStateFromPrometheus(job, state) {
    try {
        info(`updateStateFromPrometheus(): job=${JSON.stringify(job)}`);
        const startTime = toUtcISO(job.start_time);
        const endTime = toUtcISO(job.end_time);

        const heapAllocPromise = readPrometheus(state, startTime, endTime, 'Runtime_HeapAlloc_Bytes', job.vchain);
        const goroutinePromise = readPrometheus(state, startTime, endTime, 'Runtime_NumGoroutine_Number', job.vchain);

        const [rawAllocMem, rawGoroutines] = await Promise.all([heapAllocPromise, goroutinePromise]);

        info(`PROMETHEUS rawAllocMem=${JSON.stringify(rawAllocMem)}`);
        info(`PROMETHEUS rawGoroutines=${JSON.stringify(rawGoroutines)}`);

        const maxAllocMem = maxOverAllNodes(rawAllocMem);
        const maxGoroutines = maxOverAllNodes(rawGoroutines);

        info(`PROMETHEUS: MAX_ALLOC_MEM=${maxAllocMem}, RAW=${JSON.stringify(rawAllocMem.data.result)}`);
        info(`PROMETHEUS: MAX_GOROUTINES=${maxGoroutines}, RAW=${JSON.stringify(rawGoroutines.data.result)}`);

        state.summary.max_alloc_mem = maxAllocMem;
        state.summary.max_goroutines = maxGoroutines;

        // updateStateWithPrometheusResults(job, state, raw);
    } catch (ex) {
        info(`PROMETHEUS exception: ${ex}`);
        throw ex;
    }

}

function maxOverAllNodes(prometheusResponse) {
    const maxPerNode = _.map(prometheusResponse.data.result, resultPerNode => {
        const values = _.map(resultPerNode.values, pair => { return pair[1]; });
        return Math.max(...values);
    });
    return Math.max(...maxPerNode);
}

function toUtcISO(time) {
    return moment(time || new Date()).utc().format();
}

function updateStateWithPrometheusResults(job, state, raw) {

}

module.exports = {
    updateStateFromPrometheus: updateStateFromPrometheus,
};