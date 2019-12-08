'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jobsRouter = require('./src/routes/jobs-route');
const statusRouter = require('./src/routes/status-route');
const { init, info } = require('./src/util');

const port = 4567;
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/jobs', jobsRouter);
app.use('/status', statusRouter);
app.use('/', (_, res) => res.status(404).send('Not found'));

app.server = app.listen(port, () => info(`Orchestrator listening on port ${port}!`));

init();

module.exports = app;