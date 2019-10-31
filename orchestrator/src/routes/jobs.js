const express = require('express');
const router = express.Router();
const {listJobs} = require('../mysql');
const {info} = require('../util');
const {runJob} = require('../job-runner');


/* GET users listing. */
router.get('/', (req, res) => {
    res.json(listJobs());
});

router.post('/start', (req, res, next) => {
    const jobProps = req.body;
    info('STARTING JOB: ' + JSON.stringify(jobProps));
    const jobStatus = runJob(jobProps);
    res.send(jobStatus);
});

/* GET users listing. */
router.get('/:id/status', (req, res, next) => {
    res.json({
        job_id: req.params.id,
        status: 'RUNNING'
    });
});

router.post('/:id/update', (req, res, next) => {
    const jobUpdate = req.body;
    res.json({
        job_id: req.params.id,
        status: jobUpdate.job_status,
        runtime_ms: jobUpdate.runtime_ms
    });
});

router.post('/:id/stop', (req, res, next) => {

    // Stop the job

    res.json({
        job_id: req.params.id,
        status: 'STOPPED'
    });
});

module.exports = router;