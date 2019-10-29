const express = require('express');
const router = express.Router();
const {listJobs} = require('../mysql');

/* GET users listing. */
router.get('/', (req, res) => {
    res.json(listJobs());
});

router.get('/start', (req, res, next) => {

});

/* GET users listing. */
router.get('/:id/status', (req, res, next) => {
    res.json({
        job_id: req.params.id,
        status: 'RUNNING'
    });
});

router.get('/:id/stop', (req, res, next) => {

    // Stop the job

    res.json({
        job_id: req.params.id,
        status: 'STOPPED'
    });
});

module.exports = router;