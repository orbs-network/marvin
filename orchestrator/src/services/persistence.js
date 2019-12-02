const JOBS_COLLECTION_NAME = 'jobs';
const { generateJobId, info } = require('./../util');
const moment = require('moment');

class PersistenceService {
    constructor({ connector = null }) {
        this.connector = connector;
    }

    async insertJob({ taskId, meta }) {
        const db = await this.connector.getConnection();
        const collection = db.collection(JOBS_COLLECTION_NAME);
        const jobId = generateJobId();

        // tpm and duration sit within the meta data of the build
        // the fact it's like that is because we have other kind of tasks which don't deal with tpm nor have a time constraint.
        let result, err;

        try {
            result = await collection.insertOne({
                jobId,
                taskId,
                status: 'NOT_STARTED',
                job_start: moment().format(),
                running: 0,
                meta,
                results: {
                    actual_tpm: 0,
                    actual_duration_sec: 0,
                    total_tx_count: 0,
                    err_tx_count: 0,
                    tx_response_max: 0,
                    tx_response_p99: 0,
                    tx_response_p95: 0,
                    tx_response_p90: 0,
                    tx_response_median: 0,
                    tx_response_avg: 0,
                },
            })
        } catch (e) {
            err = e;
        };

        return {
            result,
            err,
            jobId,
        };
    }

    async getActiveJobs({ taskId }) {
        const db = await this.connector.getConnection();
        const collection = db.collection(JOBS_COLLECTION_NAME);

        const result = await collection.find({ taskId }).sort({}).toArray();

        return { result };
    }
}

module.exports = {
    PersistenceService,
};