const express = require('express');
const router = express.Router();
const {listJobs} = require('../lib/main/mysql');

/* GET users listing. */
router.get('/', (req, res) => {
    res.json(listJobs());
});

router.get('/start', (req, res, next) => {

});

module.exports = router;