
const {runJob} = require('../client-runner');

function startJob(jobProps) {
    runJob({jobConfig: jobProps});
}

module.exports = {
    startJob,
};