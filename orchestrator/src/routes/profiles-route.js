'use strict';

const express = require('express');
const router = express.Router();

const availableProfiles = require('./../profiles');
const {JobsService} = require('./../services/jobs');

const s = new JobsService({availableProfiles});

router.get('/list', (_, res) => {
    res.json(s.listAvailableProfiles()).end();
});

module.exports = router;