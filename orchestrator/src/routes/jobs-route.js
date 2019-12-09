'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');
// const {listJobsFromDb, } = require('../mysql-knex');
const {insertJobToDb, updateJobInDb, insertEventToDb, listJobsFromDb} = require('../mysql2');
const {debug, info, logJson} = require('../util');
const {sendJob, shutdownExecutor} = require('../job-runner');
const {processJobProps, updateStateFromPrometheus, jobToEvent} = require('../controller/jobs-ctrl');
const {notifySlack, createSlackMessageJobRunning, createSlackMessageJobDone, createSlackMessageJobError} = require('../slack');
const {state} = require('../orch-state');

/**
 * To start a job the following params at the moment are:
 *
 * {
	"vchain": 3016,
	"tpm": 60,
	"duration_sec": 3600,
	"client_timeout_sec": 120,
	"target_ips": ["35.161.123.97"]
    }
 *
 */
router.post('/start', async (req, res, next) => {
    const jobProps = req.body;
    // TODO Create job entry entry in MySQL and get an ID from an incrementing sequence

    info(`RECEIVED /jobs/start props=${JSON.stringify(jobProps)}`);
    const err = processJobProps(jobProps);
    if (err) {
        jobProps.error = err;
        logJson(jobProps);
        notifySlack(createSlackMessageJobError(jobProps));
        res.status(400).send(jobProps);
        return;
    }
    try {
        debug(`Calling insertJobToDb`);
        jobProps.job_id = await insertJobToDb(jobProps);
        debug(`Inserted job to DB, id=${jobProps.job_id}`);
        const sendJobResponse = await sendJob(jobProps);

        if (sendJobResponse.status === 'ERROR') {
            const err = `Error in job executor: ${sendJobResponse.error}`;
            jobProps.job_status = 'ERROR';
            jobProps.error = err;
            await updateJobInDb(jobProps);
            res.status(500).send(err);
            return;
        }

        res.send(sendJobResponse);

    } catch (ex) {
        info(`Exception in /start: ${ex}`);
        res.status(500).json(ex);
    }
});

/* GET users listing. */
router.get('/history', async (req, res, next) => {

    try {
        const list = await listJobsFromDb();
        res.json(list);
    } catch (ex) {
        res.status(500).send(ex);
    }
});

router.get('/status', async (req, res, next) => {

    try {
        res.json(state.jobs || {});
    } catch (ex) {
        res.status(500).send(ex);
    }
});

router.get('/:id/status', (req, res, next) => {
    state.jobs = state.jobs || {};
    try {
        res.json(state.jobs[req.params.id] || {});
    } catch (ex) {
        res.status(500).send(ex);
    }
});

router.post('/:id/update', async (req, res, next) => {
    const jobUpdate = req.body;
    info(`RECEIVED /jobs/${req.params.id}/update: status: ${jobUpdate.job_status} ${JSON.stringify(jobUpdate)}`);

    const appendErr = (ex) => {
        jobUpdate.error = jobUpdate.error || '';
        jobUpdate.error += ` ${ex}`;
    };

    let msg;
    switch (jobUpdate.job_status) {
        case 'RUNNING':
            jobUpdate.running = true;
            state.jobs[`${jobUpdate.job_id}`] = jobUpdate;
            await updateJobInDb(jobUpdate).catch(appendErr);
            await updateStateFromPrometheus(jobUpdate, state).catch(appendErr);
            msg = _.assign({}, jobUpdate, {summary: state.summary});
            logJson(msg);
            notifySlack(createSlackMessageJobRunning(jobUpdate, state));
            break;

        case 'DONE':
            jobUpdate.running = false;
            state.jobs[`${jobUpdate.job_id}`] = jobUpdate;
            shutdownExecutor(jobUpdate);
            await updateJobInDb(jobUpdate).catch(appendErr);
            await updateStateFromPrometheus(jobUpdate, state).catch(appendErr);


            const event = jobToEvent(jobUpdate);
            info(`Will insert event: ${JSON.stringify(event)}`);
            await insertEventToDb(event).catch(appendErr);
            msg = _.assign({}, jobUpdate, {summary: state.summary});
            logJson(msg);
            notifySlack(await createSlackMessageJobDone(jobUpdate, state));
            break;

        case 'ERROR':
            info(`Received ERROR, shutting down executor`);
            jobUpdate.running = false;
            state.jobs[`${jobUpdate.job_id}`] = jobUpdate;
            shutdownExecutor();
            await updateJobInDb(jobUpdate).catch(appendErr);
            msg = _.assign({}, jobUpdate, {summary: state.summary});
            logJson(msg);
            notifySlack(createSlackMessageJobError(jobUpdate, state));
    }

    res.json({
        job_id: req.params.id,
        error: jobUpdate.error,
        status: jobUpdate.job_status,
        runtime: jobUpdate.runtime
    });

    // TODO Update this in MySQL
});


router.post('/:id/stop', (req, res, next) => {

    // Stop the job

    res.json({
        job_id: req.params.id,
        status: 'STOPPING'
    });
});

module.exports = router;