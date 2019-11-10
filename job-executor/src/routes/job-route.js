'use strict';

const express = require('express');
const router = express.Router();
const {state} = require('../executor-state');
const {info} = require('../util');
const {startJob} = require('../controller/job-ctrl');

router.post('/start', (req, res, next) => {

    if (state.job_status !== 'NOT_STARTED') {
        res.send(`Cannot start job, current status is ${state.job_status}`)
            .status(400);
        return;
    }

    const jobProps = req.body;
    if (!jobProps || !jobProps.job_id || !jobProps.tpm || !jobProps.duration_sec) {
        res.send(
            {
                timestamp: new Date().toISOString(),
                status: 'ERROR',
                message: 'Missing at least one of job_id, tpm, duration_sec',
            }
        );
        return;
    }
    info(`/start/job with props: ${JSON.stringify(jobProps)}`);
    res.send(
        {
            timestamp: new Date().toISOString(),
            status: 'STARTING',
            job_id: jobProps.job_id,
            duration_sec: jobProps.duration_sec,
            tpm: jobProps.tpm,
        }
    );
    state.job_status = 'STARTING';
    state.job_id = jobProps.job_id; // This assumes a single job
    state.client_timeout_sec = jobProps.client_timeout_sec || 10;
    state.duration_sec = jobProps.duration_sec;
    state.tpm = jobProps.tpm;
    startJob(state);
});

router.get('/stop', (req, res, next) => {

    // Stop the job

    res.json({
        timestamp: new Date().toISOString(),
        status: 'STOPPING'
    }).end();
});

router.get('/status', (req, res, next) => {

    res.json({
        timestamp: new Date().toISOString(),
        job_id: state.job_id,
        status: state.job_status,
        pct_done: state.pct_done
    }).end();
});

module.exports = router;
