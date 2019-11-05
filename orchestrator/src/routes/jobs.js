'use strict';

const express = require('express');
const router = express.Router();
const {listJobs} = require('../mysql');
const {info} = require('../util');
const {sendJob, shutdownExecutor} = require('../job-runner');
const {insertJobToDb} = require('../controller/jobs-ctrl');
const {notifySlack} = require('../slack');

/* GET users listing. */
router.get('/', (req, res) => {
    res.json(listJobs());
});

router.post('/start', async (req, res, next) => {
    const jobProps = req.body;
    // TODO Create job entry entry in MySQL and get an ID from an incrementing sequence
    jobProps.job_id = insertJobToDb(jobProps);
    info(`SENDING JOB TO EXECUTOR [ID=${jobProps.job_id}]: ${JSON.stringify(jobProps)}`);
    const jobStatus = await sendJob(jobProps);
    res.send(jobStatus);
});

/* GET users listing. */
router.get('/:id/status', (req, res, next) => {
    res.json({
        job_id: req.params.id,
        status: 'RUNNING',
        pct_done: 86,
    });
});

router.post('/:id/update', (req, res, next) => {
    const jobUpdate = req.body;
    info(`RECEIVED /jobs/${req.params.id}/update: status: ${jobUpdate.job_status} ${JSON.stringify(jobUpdate.results)}`);

    switch(jobUpdate.job_status) {
        case 'DONE':
            info(`Shutting down executor`);
            shutdownExecutor(); break;
    }

    // notifySlack(`Job: ${JSON.stringify(jobUpdate)}`);
    notifySlack(`Job ${jobUpdate.job_id} *${jobUpdate.status}*. Runtime: ${jobUpdate.runtime/1000} s. Results: ${JSON.stringify(jobUpdate.results||{})})`);
    res.json({
        job_id: req.params.id,
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