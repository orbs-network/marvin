const router = require('express').Router();

router.get('/', (req, res, next) => {

    res.json(
        {
            timestamp: new Date().toISOString(),
            status: 'OK'
        }
    ).end();
});

module.exports = router;