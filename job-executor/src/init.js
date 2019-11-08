'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');

const {info} = require('./util');
const indexRouter = require('./routes/index-route');
const jobRouter = require('./routes/job-route');
const statusRouter = require('./routes/executor-status-route');

const DEFAULT_PARENT_HOST = '127.0.0.1';
const DEFAULT_PARENT_PORT = 4567;
const DEFAULT_PORT = 4568;

let isUp = false;

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/status', statusRouter);
app.use('/job', jobRouter);


const server = http.createServer(app);
app.server = server; // for shutdown in testing



async function bootstrap(props, state) {
    info('bootstrap()');
    if (isUp) {
        return;
    }
    const port = props.port ? props.port : DEFAULT_PORT;
    const parentHost = props.parent_host ? props.parent_host : DEFAULT_PARENT_HOST;
    const parentPort = props.parent_port ? props.parent_port : DEFAULT_PARENT_PORT;
    isUp = true;
    state.port = port;
    state.parent_base_url = `${parentHost}:${parentPort}`;
    // state.client_config = props.client_config; // Given in /job/start
    // state.job_id = props.job_id;
    await app.server.listen(port);
    info(`Listening on port ${port}`);
}

async function executorStopServer() {
    info('In shutdown()');
    return new Promise((res, rej) => {
        app.server.close(err => {
            if (!err) {
                info('Server closed');
                res();
            }
            else {
                rej(err);
                info('Server not closed');
            }
        });
    });
}

module.exports.app = app;
module.exports.bootstrap = bootstrap;
module.exports.executorStopServer = executorStopServer;
