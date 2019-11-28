'use strict';

const express = require('express');
const router = express.Router();
// const {listJobsFromDb, } = require('../mysql-knex');
const {insertJobToDb, updateJobInDb, insertEventToDb, listJobsFromDb} = require('../mysql2');
const {debug, info} = require('../util');
const {sendJob, shutdownExecutor} = require('../job-runner');
const {validateJobStart, updateStateFromPrometheus, jobToEvent} = require('../controller/jobs-ctrl');
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
    const err = validateJobStart(jobProps);
    if (err) {
        notifySlack(createSlackMessageJobError(jobProps));
        res.status(400).send(jobProps);
    } else {
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
            } else {
                res.send(sendJobResponse);
            }
        } catch (ex) {
            info(`Exception in /start: ${ex}`);
            res.status(500).json(ex);
        }
    }
});

/* GET users listing. */
router.get('/list', async (req, res, next) => {

    try {
        const list = await listJobsFromDb();
        res.json(list);
    } catch (ex) {
        res.status(500).send(ex);
    }
});


router.get('/:id/status', (req, res, next) => {
    res.json({
        job_id: req.params.id,
        status: 'RUNNING',
        pct_done: 86,
    });
});

router.post('/:id/update', async (req, res, next) => {
    const jobUpdate = req.body;
    info(`RECEIVED /jobs/${req.params.id}/update: status: ${jobUpdate.job_status} ${JSON.stringify(jobUpdate)}`);

    const appendErr = (ex) => {
        jobUpdate.error = jobUpdate.error || '';
        jobUpdate.error += ` ${ex}`;
    };

    switch (jobUpdate.job_status) {
        case 'RUNNING':
            jobUpdate.running = true;
            await updateJobInDb(jobUpdate).catch(appendErr);
            await updateStateFromPrometheus(jobUpdate, state).catch(appendErr);
            notifySlack(createSlackMessageJobRunning(jobUpdate, state));
            break;

        case 'DONE':
            jobUpdate.running = false;
            shutdownExecutor(jobUpdate);
            await updateJobInDb(jobUpdate).catch(appendErr);
            await updateStateFromPrometheus(jobUpdate, state).catch(appendErr);


            const event = jobToEvent(jobUpdate);
            info(`Will insert event: ${JSON.stringify(event)}`);
            await insertEventToDb(event).catch(appendErr);
            notifySlack(await createSlackMessageJobDone(jobUpdate, state));
            break;

        case 'ERROR':
            info(`Received ERROR, shutting down executor`);
            jobUpdate.running = false;
            shutdownExecutor();
            await updateJobInDb(jobUpdate).catch(appendErr);
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