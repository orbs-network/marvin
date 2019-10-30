const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
    res.json({status: 'OK'});
});

module.exports = router;