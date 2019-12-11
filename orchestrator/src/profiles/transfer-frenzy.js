const { info } = require('../../src/util');
const { sendJob, shutdownExecutor } = require('../../src/job-runner');

const transferFrenzy = {
    meta: {
        description: "Transfer money using benchmark token to a range of accounts"
    },
    validate(data) {
        let errors = [], ok = true;

        if (!data) {
            errors.push(new Error('Missing JSON body'));
        }

        if (!data.tpm) {
            errors.push(new Error("Missing or zero tpm property"));
        }

        if (!data.vchain) {
            errors.push(new Error("Missing vchain property"));
        }

        if (!data.target_ips) {
            errors.push(new Error("Missing target_ips property"));
        }

        if (!data.duration_sec) {
            errors.push(new Error("Missing or zero duration_sec property"));
        }

        if (errors.length > 0) {
            ok = false;
        }

        return { ok, errors, status: 400 };
    },
    async start(data, jobId) {
        const validationResult = this.validate(data);
        if (!validationResult.ok) {
            return validationResult;
        }

        info(`SENDING JOB TO EXECUTOR [ID=${jobId} VCHAIN=${data.vchain}]: ${JSON.stringify(data)}`);
        const sendJobResponse = await sendJob(data);

        if (sendJobResponse.status === 'ERROR') {
            const err = `Error in job executor: ${sendJobResponse.error}`;
            jobProps.job_status = 'ERROR';
            jobProps.error = err;
            //await updateJobInDb(jobProps);
            res.send(err).status(500);
        } else {
            res.send(sendJobResponse);
        }
    }
};

module.exports = transferFrenzy;