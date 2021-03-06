'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jobsRouter = require('./src/routes/jobs-route');
const statusRouter = require('./src/routes/status-route');
const profilesRouter = require('./src/routes/profiles-route');
const { config } = require('./src/orchestrator-config');
const connector = require('./src/connection');

if (!process.env.SLACK_MARVIN_NOTIFICATIONS_KEY || process.env.SLACK_MARVIN_NOTIFICATIONS_KEY.length === 0) {
    console.log(`Environment variable SLACK_MARVIN_NOTIFICATIONS_KEY must be set! Skipping reports to Slack`);
} else {
    console.log(`Set Slack URL to ${config.slack_url}`);
    config.slack_url = `https://hooks.slack.com/services/${process.env.SLACK_MARVIN_NOTIFICATIONS_KEY}`;
}

const port = 4567;
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/jobs', jobsRouter);
app.use('/status', statusRouter);
app.use('/profiles', profilesRouter);
app.use('/', (_, res) => res.status(404).send('Not found'));

app.post('/api/github/events', (req, res) => {
    console.log('incoming webhook from github:');
    console.log(req.body);
    console.log('---------------------')
    res.json({ ok: true }).end();
});

const server = app.listen(port, () => console.log(`Orchestrator listening on port ${port}, pid=${process.pid}!`));

module.exports = {
    app,
    server,
    close() {
        server.close(() => {
            console.log('http server closed');
            console.log(connector.close());
            console.log('connection to mongodb closed');
        })
    }
};