const JOBS_COLLECTION_NAME = 'jobs';
const { generateJobId, info } = require('./../util');
const moment = require('moment');
const { ObjectID } = require('mongodb');

class PersistenceService {
    constructor({ connector = null }) {
        this.connector = connector;
    }

    async insertJob({ profile, meta }) {
        const db = await this.connector.getConnection();
        const collection = db.collection(JOBS_COLLECTION_NAME);
        const jobId = generateJobId();

        // tpm and duration sit within the meta data of the build
        // the fact it's like that is because we have other kind of profiles which don't deal with tpm nor have a time constraint.
        let result, err = null;

        try {
            result = await collection.insertOne({
                jobId,
                profile,
                status: 'NOT_STARTED',
                job_start: new Date(),
                running: 0,
                meta,
                updates: [],
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
            });
        } catch (e) {
            err = e;
        }

        return {
            result,
            err,
            jobId,
        };
    }

    async updateJob({ jobId, data }) {
        console.log(data);
        const db = await this.connector.getConnection();
        const collection = db.collection(JOBS_COLLECTION_NAME);

        let result, err = null;

        try {
            const job = await this.getJobById({ jobId });
            const { updates = [] } = job;
            const newUpdates = updates.concat(data);

            const updateItems = {
                updates: newUpdates,
                status: data.status,
            };
            if (data.end_time) {
                updateItems.job_end = moment(data.end_time).toDate();
            }

            result = await collection.updateOne({ _id: new ObjectID(job._id) }, {
                $set: updateItems
            });
        } catch (e) {
            err = e;
        };

        return {
            result,
            err,
            jobId,
        };
    }

    async getJobById({ jobId }) {
        const db = await this.connector.getConnection();
        const collection = db.collection(JOBS_COLLECTION_NAME);

        const result = await collection.find({ jobId }).sort({}).toArray();

        return (result.length === 1) ? result[0] : {};
    }

    async getActiveJobs(query) {
        const db = await this.connector.getConnection();
        const collection = db.collection(JOBS_COLLECTION_NAME);

        const result = await collection.find(query).sort({}).toArray();

        return { result };
    }
}

module.exports = {
    PersistenceService: PersistenceService,
};