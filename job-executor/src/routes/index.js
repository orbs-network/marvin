'use strict';

const router = require('express').Router();
const {info} = require('../util');
const init = require('../init');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/shutdown', async (req, res, next) => {
    info(`Job executor pid=${process.pid} shutting down.`);
    res.json({status: 'OK'});
    await init.executorStopServer();
    info('Bye');
    process.exit(0);
});

module.exports = router;

