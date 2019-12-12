'use strict';

const express = require('express');
const router = express.Router();
const { info, logJson } = require('../util');

const availableProfiles = require('./../profiles');
const { JobsService } = require('./../services/jobs');
const { PersistenceService } = require('./../services/persistence');
const connector = require('./../connection');

const db = new PersistenceService({ connector });
const s = new JobsService({ availableProfiles, db });

router.get('/list/profiles', (_, res) => {
    res.json(s.listAvailableProfiles()).end();
});

/**
 * To start a job the following params at the moment are:
 * 
 * {
	"vchain": 3016,
	"tpm": 60,
	"duration_sec": 3600,
	"client_timeout_sec": 120,
	"target_ips": ["35.161.123.97"]
    }
 * 
 */
router.post('/start/:profile', async (req, res) => {
    const meta = req.body;
    let result;

    if (!req.params.profile) {
        res
            .status(400)
            .send('Missing profile name in path (Example: /jobs/start/helloWorld)')
            .end();
        return;
    }

    try {
        result = await s.start({
            profile: req.params.profile,
            meta,
        });

        res.json(result).end();
    } catch (err) {
        console.log(err);
        res.status(500).json(err).end();
    }

    return;
});

router.get('/list/active/:profile', async (req, res) => {
    const { profile } = req.params;
    const { result } = await db.getActiveJobs({ profile });
    res.json({ data: result }).end();
});

/* get all jobs from all profiles types and with all statuses */
router.get('/list', async (_, res) => {
    const { result } = await db.getActiveJobs({});
    res.json({ data: result }).end();
});

router.get('/:id/status', async (req, res) => {
    const result = await db.getJobById({ jobId: req.params.id });
    res.json(result).end();
});

router.post('/:id/update', async (req, res) => {
    const { id: jobId } = req.params;
    const data = req.body;

    if (!jobId) {
        res
            .status(400)
            .send('Missing jobId in path (Example: /jobs/123/update)')
            .end();
        return;
    }

    info(`RECEIVED /jobs/${req.params.id}/update: status: ${data.status} ${JSON.stringify(data)}`);
    const msg = _.assign({}, data/*, { summary: state.summary }*/);
    logJson(msg);

    let result;

    try {
        result = await s.update({
            jobId,
            data,
        });

        res.json(result).end();
    } catch (err) {
        console.log(err);
        res.status(500).json(err).end();
    }
});


router.post('/:id/stop', (req, res, next) => {

    // Stop the job

    res.json({
        job_id: req.params.id,
        status: 'STOPPING'
    });
});

module.exports = router;