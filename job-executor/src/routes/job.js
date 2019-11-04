const express = require('express');
const router = express.Router();
const {state} = require('../state');
const {info} = require('../util');
const {startJob} = require('../controller/job-ctrl');

router.post('/start', (req, res, next) => {
   const jobProps = req.body;
   if (!jobProps || !jobProps.job_id) {
       res.send({status: 'ERROR', message: 'Missing job_id'});
       return;
   }
   info(`/start/job with props: ${JSON.stringify(jobProps)}`);
   res.send({status: 'STARTING', job_id: jobProps.job_id});
   state.job_status = 'STARTING';
   state.job_id = jobProps.job_id; // This assumes a single job
   state.client_timeout_sec = jobProps.client_timeout_sec || 3;
   state.job_timeout_sec = jobProps.job_timeout_sec || 10;
   startJob(jobProps);
});

router.get('/stop', (req, res, next) => {

    // Stop the job

    res.json({
        status: 'STOPPING'
    }).end();
});

router.get('/status', (req, res, next) => {

    res.json({
        job_id: state.job_id,
        status: state.job_status,
        pct_done: state.pct_done
    }).end();
});

module.exports = router;
