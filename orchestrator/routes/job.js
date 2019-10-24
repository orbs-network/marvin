const express = require('express');
const router = express.Router();

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