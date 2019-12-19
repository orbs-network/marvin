'use strict';

const router = require('express').Router();
const state = require('../orch-state');
const { PersistenceService } = require('./../services/persistence');
const connector = require('./../connection');

/* GET users listing. */
router.get('/', async (req, res) => {
    let connOk = false;
    let connError = '';
    try {
        await connector.getConnection();
        connOk = true;
    } catch(err) {
        connOk = false;
        connError = err;
    }
    state.db = state.db || {};
    state.db.connOk = connOk;
    state.db.connError = connError;

    res.json(state);
});

module.exports = router;