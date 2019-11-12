'use strict';



function validateJobStart(jobUpdate) {
    if (!jobUpdate) {
        return {
            error: 'Missing jobUpdate body'
        };
    }

    if (!jobUpdate.tpm) {
        jobUpdate.error = "Missing or zero tpm property";
        return jobUpdate;
    }
    // Limit to 300 tpm (5 tps) because of client limitations.
    // Once launching more than one client, can remove this limitation.
    if (jobUpdate.tpm<1 || jobUpdate.tpm>300) {
        jobUpdate.error = "Supported tpm values are between 1 to 300";
        return jobUpdate;
    }

    if (!jobUpdate.duration_sec) {
        jobUpdate.error = "Missing or zero duration_sec property";
        return jobUpdate;
    }

    jobUpdate.vchain = jobUpdate.vchain || '2013'; // default testnet vchain as of Nov 2019

    return null;
}

module.exports = {

    validateJobStart: validateJobStart,
};