'use strict';

const moment = require('moment');
const _ = require('lodash');
const {readPrometheus} = require('../prometheus');
const {debug, info} = require('../util');

function validateJobStart(jobUpdate) {
    if (!jobUpdate) {
        return {
            error: 'Missing jobUpdate body'
        };
    }

    if (!jobUpdate.tpm) {
        jobUpdate.error = "Missing or zero tpm property";
        return jobUpdate;
    }

    if (!jobUpdate.vchain) {
        jobUpdate.error = "Missing vchain property";
        return jobUpdate;
    }

    if (!jobUpdate.target_ips) {
        jobUpdate.error = "Missing target_ips property";
        return jobUpdate;
    }

    // Limit to 300 tpm (5 tps) because of client limitations.
    // Once launching more than one client, can remove this limitation.
    // if (jobUpdate.tpm < 1 || jobUpdate.tpm > 300) {
    //     jobUpdate.error = "Supported tpm values are between 1 to 300";
    //     return jobUpdate;
    // }

    if (!jobUpdate.duration_sec) {
        jobUpdate.error = "Missing or zero duration_sec property";
        return jobUpdate;
    }

    jobUpdate.vchain = jobUpdate.vchain || '2013'; // default testnet vchain as of Nov 2019

    return null;
}

async function updateStateFromPrometheus(job, state) {
    try {
        // info(`updateStateFromPrometheus(): job=${JSON.stringify(job)}`);
        const startTime = toUtcISO(job.start_time);
        const endTime = toUtcISO(job.end_time);

        const heapAllocPromise = readPrometheus(state, startTime, endTime, 'Runtime_HeapAlloc_Bytes', job.vchain);
        const goroutinePromise = readPrometheus(state, startTime, endTime, 'Runtime_NumGoroutine_Number', job.vchain);

        const [rawAllocMem, rawGoroutines] = await Promise.all([heapAllocPromise, goroutinePromise]);

        // info(`PROMETHEUS rawAllocMem=${JSON.stringify(rawAllocMem)}`);
        // info(`PROMETHEUS rawGoroutines=${JSON.stringify(rawGoroutines)}`);

        const maxAllocMem = maxOverAllNodes(rawAllocMem);
        const maxGoroutines = maxOverAllNodes(rawGoroutines);

        // info(`PROMETHEUS: MAX_ALLOC_MEM=${maxAllocMem}, RAW=${JSON.stringify(rawAllocMem.data.result)}`);
        // info(`PROMETHEUS: MAX_GOROUTINES=${maxGoroutines}, RAW=${JSON.stringify(rawGoroutines.data.result)}`);

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
        const values = _.map(resultPerNode.values, pair => {
            return pair[1];
        });
        return Math.max(...values);
    });
    return Math.max(...maxPerNode);
}

function toUtcISO(time) {
    return moment(time || new Date()).utc().format();
}


function updateStateWithPrometheusResults(job, state, raw) {

}

function jobToEvent(job) {
    const newEvent = {
        // event_start: moment.utc(job.job_start).unix(),
        event_start: new Date(),
        event_end: new Date(),
        // event_end: moment.utc(job.job_end).unix(),
        vchain: job.vchain,
        description: 'Test',
        tag1: job.job_id,
        tag2: `${job.duration_sec}s @ ${job.tpm}tpm`,
        semantic_version: job.summary ? job.summary.semantic_version : 'NA',
        commit_hash: job.summary ? job.summary.commit_hash : 'NA',
    };
    // debug(`Converted ${JSON.stringify(job)} to event: ${JSON.stringify(newEvent)}`);
    return newEvent;
}

module.exports = {
    validateJobStart: validateJobStart,
    updateStateFromPrometheus: updateStateFromPrometheus,
    jobToEvent: jobToEvent,
};