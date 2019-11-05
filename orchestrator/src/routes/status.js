'use strict';

const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
    res.json(
        {
            status: 'OK',
            live_jobs: 0,
        }
    );
});

module.exports = router;