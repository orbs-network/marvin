const express = require('express');
const router = express.Router();
const {listJobs} = require('../mysql');
const {info} = require('../util');
const {runJob} = require('../job-runner');
const {insertJobToDb} = require('../controller/jobs-ctrl');


/* GET users listing. */
router.get('/', (req, res) => {
    res.json(listJobs());
});

router.post('/start', async (req, res, next) => {
    const jobProps = req.body;
    // TODO Create job entry entry in MySQL and get an ID from an incrementing sequence
    jobProps.job_id = insertJobToDb(jobProps);
    info(`STARTING JOB [${jobProps.job_id}]: ${JSON.stringify(jobProps)}`);
    const jobStatus = await runJob(jobProps);
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
    info(`RECEIVED /jobs/${req.params.id}/update: ${JSON.stringify(jobUpdate)}`);
    res.json({
        job_id: req.params.id,
        status: jobUpdate.job_status,
        runtime_ms: jobUpdate.runtime_ms
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