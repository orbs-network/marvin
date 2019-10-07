const {
    parseCommandLineArgs,
    printUsage
} = require('./lib/main/cli');
const {
    enduranceLoop
} = require('./lib/main/loop');
const express = require('express');
var bodyParser = require('body-parser');
const jobsRouter = require('./routes/jobs')
const jobRouter = require('./routes/job')
const props = parseCommandLineArgs(process.argv);

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

app.use('/job', jobRouter);
app.use('/jobs', jobsRouter);
app.use('/', (req, res) => res.status(404).send('Not found'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


function dbInit() {

}

//enduranceLoop({ config: props });