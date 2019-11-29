'use strict';

const router = require('express').Router();
const state = require('../orch-state');

/* GET users listing. */
router.get('/', (req, res) => {
    res.json(state);
});

module.exports = router;