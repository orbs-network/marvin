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
    if (!jobProps || !jobProps.jobId || !jobProps.vchain || (jobProps.target_ips||[]).length===0 || !jobProps.tpm || !jobProps.duration_sec) {
        res.send(
            {
                timestamp: new Date().toISOString(),
                status: 'ERROR',
                message: 'Missing at least one of jobId, vchain, target_ips, tpm, duration_sec',
            }
        );
        return;
    }
    info(`/start/job with props: ${JSON.stringify(jobProps)}`);
    res.send(
        {
            timestamp: new Date().toISOString(),
            status: 'STARTING',
            jobId: jobProps.jobId,
            duration_sec: jobProps.duration_sec,
            tpm: jobProps.tpm,
        }
    );
    state.job_status = 'STARTING';
    state.jobId = jobProps.jobId; // This assumes a single job
    state.vchain = jobProps.vchain; // This assumes a single job
    state.target_ips = jobProps.target_ips;
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
        jobId: state.jobId,
        status: state.job_status,
        pct_done: state.pct_done
    }).end();
});

module.exports = router;
