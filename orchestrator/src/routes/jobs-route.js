'use strict';

const express = require('express');
const router = express.Router();
const {listJobsFromDb, insertJobToDb, updateJobInDb} = require('../mysql');
const {info} = require('../util');
const {sendJob, shutdownExecutor} = require('../job-runner');
const {validateJobStart} = require('../controller/jobs-ctrl');
const {notifySlack, createSlackMessageJobRunning, createSlackMessageJobDone, createSlackMessageJobError} = require('../slack');

router.post('/start', async (req, res, next) => {
    const jobProps = req.body;
    // TODO Create job entry entry in MySQL and get an ID from an incrementing sequence

    const err = validateJobStart(jobProps);
    if (err) {
        notifySlack(createSlackMessageJobError(jobProps));
        res.send(jobProps).status(400);
    } else {
        try {
            jobProps.job_id = await insertJobToDb(jobProps);
            info(`SENDING JOB TO EXECUTOR [ID=${jobProps.job_id} VCHAIN=${jobProps.vchain}]: ${JSON.stringify(jobProps)}`);

            const sendJobResponse = await sendJob(jobProps);

            if (sendJobResponse.status === 'ERROR') {
                const err = `Error in job executor: ${sendJobResponse.error}`;
                jobProps.job_status = 'ERROR';
                jobProps.error = err;
                await updateJobInDb(jobProps);
                res.send(err).status(500);
            } else {
                res.send(sendJobResponse);
            }
        } catch (ex) {
            res.send(ex).status(500);
        }
    }
});

/* GET users listing. */
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
            notifySlack(createSlackMessageJobRunning(jobUpdate));
            break;

        case 'DONE':
            info(`Received DONE, shutting down executor`);
            jobUpdate.running = false;
            shutdownExecutor();
            await updateJobInDb(jobUpdate).catch(appendErr);
            notifySlack(createSlackMessageJobDone(jobUpdate));
            break;

        case 'ERROR':
            info(`Received ERROR, shutting down executor`);
            jobUpdate.running = false;
            shutdownExecutor();
            await updateJobInDb(jobUpdate).catch(appendErr);
            notifySlack(createSlackMessageJobError(jobUpdate));
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