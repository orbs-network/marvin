const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const {parseCommandLineArgs} = require('../orchestrator/src/cli');
const {info} = require('./src/util');
const {config} = require('./src/state');

const DEFAULT_PARENT_HOST = '127.0.0.1';
const DEFAULT_PARENT_PORT = 4567;
const DEFAULT_PORT = 4568;

const indexRouter = require('./src/routes');
const jobRouter = require('./src/routes/job');
const statusRouter = require('./src/routes/status');

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

async function bootstrap(props) {
    info('bootstrap()');
    if (isUp) {
        return app;
    }
    const port = props.port ? props.port : DEFAULT_PORT;
    const parentHost = props.parent_host ? props.parent_host : DEFAULT_PARENT_HOST;
    const parentPort = props.parent_port ? props.parent_port : DEFAULT_PARENT_PORT;
    isUp = true;
    config.port = port;
    config.parent_base_url = `${parentHost}:${parentPort}`;
    // config.client_config = props.client_config; // Given in /job/start
    // state.job_id = props.job_id;
    await server.listen(port);
    info(`Listening on port ${port}`);
}

async function shutdown() {
    info('Shutdown()');
    server.close((err) => {
        if (!err) {
            return true;
        }
        info(err);
        return err;
    })
}

async function main() {
    const props = parseCommandLineArgs(process.argv);
    await bootstrap(props);
}

module.exports = app;

return main();