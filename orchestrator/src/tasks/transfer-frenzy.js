const { info } = require('../../src/util');

const transferFrenzy = {
    meta: {
        description: "Transfer money using benchmark token to a range of accounts"
    },
    validate(data) {
        if (!jobUpdate) {
            return {
                error: 'Missing jobUpdate body'
            };
        }

        if (!jobUpdate.tpm) {
            jobUpdate.error = "Missing or zero tpm property";
            return jobUpdate;
        }

        if (!jobUpdate.vchain) {
            jobUpdate.error = "Missing vchain property";
            return jobUpdate;
        }

        if (!jobUpdate.target_ips) {
            jobUpdate.error = "Missing target_ips property";
            return jobUpdate;
        }

        // Limit to 300 tpm (5 tps) because of client limitations.
        // Once launching more than one client, can remove this limitation.
        // if (jobUpdate.tpm < 1 || jobUpdate.tpm > 300) {
        //     jobUpdate.error = "Supported tpm values are between 1 to 300";
        //     return jobUpdate;
        // }

        if (!jobUpdate.duration_sec) {
            jobUpdate.error = "Missing or zero duration_sec property";
            return jobUpdate;
        }

        jobUpdate.vchain = jobUpdate.vchain || '2013'; // default testnet vchain as of Nov 2019

        return null;
    },
    start(data) {
        info(`SENDING JOB TO EXECUTOR [ID=${jobProps.job_id} VCHAIN=${jobProps.vchain}]: ${JSON.stringify(jobProps)}`);
        const sendJobResponse = await sendJob(jobProps);

        if (sendJobResponse.status === 'ERROR') {
            const err = `Error in job executor: ${sendJobResponse.error}`;
            jobProps.job_status = 'ERROR';
            jobProps.error = err;
            await updateJobInDb(jobProps);
            res.send(err).status(500);
        } else {
            res.send(sendJobResponse);
        }
    }
};

module.exports = transferFrenzy;