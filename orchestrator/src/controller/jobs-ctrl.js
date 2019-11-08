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

    if (!jobUpdate.duration_sec) {
        jobUpdate.error = "Missing or zero duration_sec property";
        return jobUpdate;
    }

    return null;
}

module.exports = {

    validateJobStart: validateJobStart,
};