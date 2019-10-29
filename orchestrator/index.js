const { knex } = require('./src/mysql');
const {
    parseCommandLineArgs,
    printUsage
} = require('../job-executor/src/cli');
const {
    runJobExecutor
} = require('./src/job-runner');
const express = require('express');
const bodyParser = require('body-parser');
const jobsRouter = require('./src/routes/jobs');
const props = parseCommandLineArgs(process.argv);
const {
    info
} = require('./src/util');

// if (props.runName.length === 0) {
//     console.log('Cannot start endurance test without a run name');
//     printUsage();
//     process.exit(999)
// }

const port = 4567;
const app = express();
//app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/jobs', jobsRouter);
app.use('/', (req, res) => res.status(404).send('Not found'));

//app.listen(port, () => console.log(`Orchestrator listening on port ${port}!`));

info('Going to start loop');

runJobExecutor({
    config: props
});