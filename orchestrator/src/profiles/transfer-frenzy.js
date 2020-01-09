'use strict';

const {info} = require('../util');
const {sendJob, shutdownExecutor} = require('../job-runner');
const {updateStateFromPrometheus} = require('../controller/jobs-ctrl');
const {state} = require('../orch-state');

const transferFrenzy = {
    meta: {
        description: "Transfer money using benchmark token to a range of accounts"
    },
    load_properties: {
        tpm: 18000,
        duration_sec: 3600,
        client_timeout_sec: 600,
    },
    validate(data) {
        let errors = [], ok = true;

        if (!data) {
            errors.push('Missing JSON body');
        }

        for (let prop of Object.keys(this.load_properties)) {
            data[prop] = data[prop] || this.load_properties[prop];
        }

        if (!data.tpm) {
            errors.push("Missing or zero tpm property");
        }

        if (!data.vchain) {
            errors.push("Missing vchain property");
        }

        if (!data.target_ips) {
            errors.push("Missing target_ips property");
        }

        if (!data.duration_sec) {
            errors.push("Missing duration_sec property");
        }

        if (errors.length > 0) {
            ok = false;
        }

        return {ok, errors};
    },
    async start(data, jobId) {
        const response = Object.assign({}, data);

        const validationResult = this.validate(data);
        if (!validationResult.ok) {
            throw validationResult;
        }

        const sendJobResponse = await sendJob(Object.assign({}, data, {jobId}));

        if (sendJobResponse.status === 'ERROR') {
            const err = `Error in job executor: ${sendJobResponse.error}`;
            response.status = 'ERROR';
            response.error = err;
        } else {
            response.executor = sendJobResponse;
            response.status = 'RUNNING';
        }

        return response;
    },
    async update(data) {
        const appendErr = (ex) => {
            data.error = data.error || '';
            data.error += ` ${ex}`;
        };

        switch (data.status) {
            case 'RUNNING':
                await updateStateFromPrometheus(data, state).catch(appendErr);
                // notifySlack(createSlackMessageJobRunning(data, state));
                break;

            case 'DONE':
                shutdownExecutor(data);

                await updateStateFromPrometheus(data, state).catch(appendErr);
                // notifySlack(await createSlackMessageJobDone(data, state));
                break;

            case 'ERROR':
                info(`Received ERROR, shutting down executor`);
                shutdownExecutor();
            // notifySlack(createSlackMessageJobError(data, state));
        }

        return {
            ok: true
        };
    }
};

module.exports = transferFrenzy;