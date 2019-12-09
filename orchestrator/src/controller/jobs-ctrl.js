'use strict';

const moment = require('moment');
const _ = require('lodash');
const {readPrometheus} = require('../prometheus');
const {debug, info} = require('../util');
const {profiles} = require('../orchestrator-config');

function processJobProps(job) {
    if (!job) {
        return {
            error: 'Missing job body'
        };
    }

    // Profile overrides tpm and duration_sec
    if (job.profile) {
        if (!profiles[job.profile]) {
            return {
                error: `Job profile ${job.profile} not found in config`
            };
        }
        job.tpm = profiles[job.profile].tpm;
        job.duration_sec = profiles[job.profile].duration_sec;
    }

    if (!job.tpm) {
        job.error = "Missing or zero tpm property (perhaps missing 'profile' property)";
        return job;
    }

    if (!job.duration_sec) {
        job.error = "Missing or zero duration_sec property (perhaps missing 'profile' property)";
        return job;
    }

    if (!job.vchain) {
        job.error = "Missing vchain property";
        return job;
    }

    if (!job.target_ips) {
        job.error = "Missing target_ips property";
        return job;
    }

    if (job.target_ips.length < 1) {
        job.error = "target_ips property does not contain any IPs";
        return job;
    }


    job.vchain = job.vchain || '2013'; // default testnet vchain as of Nov 2019

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
    processJobProps: processJobProps,
    updateStateFromPrometheus: updateStateFromPrometheus,
    jobToEvent: jobToEvent,
};