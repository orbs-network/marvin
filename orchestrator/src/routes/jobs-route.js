'use strict';

const express = require('express');
const router = express.Router();
const { listJobsFromDb, insertJobToDb, updateJobInDb } = require('../mysql');
const { info } = require('../util');
const { sendJob, shutdownExecutor } = require('../job-runner');
const { validateJobStart, updateStateFromPrometheus } = require('../controller/jobs-ctrl');
const { notifySlack, createSlackMessageJobRunning, createSlackMessageJobDone, createSlackMessageJobError } = require('../slack');
const { state } = require('../orch-state');

const availableTasks = require('./../tasks');
const { JobsService } = require('./../services/jobs');
const { PersistenceService } = require('./../services/persistence');
const connector = require('./../connection');

const db = new PersistenceService({ connector });
const s = new JobsService({ availableTasks, db });

router.get('/list/tasks', (_, res) => {
    res.json(s.listAvailableTasks()).end();
});

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
router.post('/start/:taskId', async (req, res, next) => {
    const meta = req.body;

    if (!req.params.taskId) {
        res.status(400).send('Missing taskId in path (Example: /jobs/start/helloWorld)').end();
    }

    const err = validateJobStart(jobProps);

    // Let's skip validations for now as we're re-wiring for mongodb
    const result = await s.start({
        taskId: req.params.taskId,
        meta,
    });

    if (result.status) {
        res.status(result.status);
    }

    res.json(result).end();

    return;

    // TODO Create job entry entry in MySQL and get an ID from an incrementing sequence


    if (err) {
        notifySlack(createSlackMessageJobError(jobProps));
        res.send(jobProps).status(400);
    } else {
        try {
            
        } catch (ex) {
            res.send(ex).status(500);
        }
    }
});

router.get('/list/active/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { result } = await db.getActiveJobs({ taskId });
    res.json({ data: result }).end();
});

/* GET users listing */
router.get('/list', async (req, res, next) => {
    try {
        const list = await listJobsFromDb();
        res.json(list);
    } catch (ex) {
        res.send(ex).status(500);
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