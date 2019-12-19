'use strict';

const {info} = require('../util');
const {sendJob, shutdownExecutor} = require('../job-runner');
const {notifySlack, createSlackMessageJobRunning, createSlackMessageJobDone, createSlackMessageJobError} = require('../slack');
const {state} = require('../orch-state');

const transferFrenzy = {
    meta: {
        description: "Transfer money using benchmark token to a range of accounts"
    },
    load_properties: {
        tpm: 60,
        duration_sec: 10,
    },
    validate(data) {
        let errors = [], ok = true;

        if (!data) {
            errors.push('Missing JSON body');
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
            errors.push("Missing or zero duration_sec property");
        }

        if (errors.length > 0) {
            ok = false;
        }

        return {ok, errors};
    },
    async start(data, jobId) {

        Object.assign(data, this.load_properties);
        const response = Object.assign({}, data);

        const validationResult = this.validate(data);
        if (!validationResult.ok) {
            throw validationResult;
        }

        info(`SENDING JOB TO EXECUTOR [ID=${jobId} VCHAIN=${data.vchain}]: ${JSON.stringify(data)}`);

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
        // const appendErr = (ex) => {
        //     jobUpdate.error = jobUpdate.error || '';
        //     jobUpdate.error += ` ${ex}`;
        // };

        switch (data.status) {
            case 'RUNNING':
                //await updateStateFromPrometheus(jobUpdate, state).catch(appendErr);
                notifySlack(createSlackMessageJobRunning(data, state));
                break;

            case 'DONE':
                shutdownExecutor(data);

                //await updateStateFromPrometheus(data, state).catch(appendErr);
                notifySlack(await createSlackMessageJobDone(data, state));
                break;

            case 'ERROR':
                info(`Received ERROR, shutting down executor`);
                shutdownExecutor();
                notifySlack(createSlackMessageJobError(data, state));
        }

        return {
            ok: true
        };
    }
};

module.exports = transferFrenzy;