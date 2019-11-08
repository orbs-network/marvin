'use strict';

const router = require('express').Router();
const {state} = require('../executor-state');


router.get('/', (req, res) => {

    res.json(
        {
            timestamp: new Date().toISOString(),
            state: state,
        }
    ).end();
});

module.exports = router;