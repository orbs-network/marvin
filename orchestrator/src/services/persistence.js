const JOBS_COLLECTION_NAME = 'jobs';

class PersistenceService {
    constructor({ connector = null }) {
        this.connector = connector;
    }

    async getActiveJobs() {
        const db = await this.connector.getConnection();
        const collection = db.collection(JOBS_COLLECTION_NAME);

        const result = await collection.find({}).sort({}).toArray();

        return { result };
    }
}

module.exports = {
    PersistenceService,
};