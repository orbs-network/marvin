'use strict';

const router = require('express').Router();
const {state, all_tx} = require('../executor-state');


router.get('/', (req, res) => {

    all_tx.hdr.recordValue(12);
    all_tx.hdr.recordValue(123);
    all_tx.hdr.recordValue(1234);


    res.json(
        {
            timestamp: new Date().toISOString(),
            state: state,
            min: all_tx.hdr.minNonZeroValue,
            max: all_tx.hdr.maxValue,
            avg: all_tx.hdr.getMean(),
            p90: all_tx.hdr.getValueAtPercentile(90),
        }
    ).end();
});

module.exports = router;