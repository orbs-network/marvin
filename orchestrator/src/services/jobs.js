class JobsService {
    constructor({ availableJobs = {}, db = {} }) {
        this.availableJobs = availableJobs;
    }

    getJobs() {
        return this.availableJobs;
    }

    listAvailableJobs() {
        const _this = this;
        return Object
            .keys(this.availableJobs)
            .map(k => {
                return Object.assign({ id: k }, _this.availableJobs[k].meta);
            });
    }

    getJobById(id) {
        const jobs = this.getJobs();
        if (id in jobs) {
            return jobs[id];
        }
        return false;
    }

    /**
     * 
     * @param jobId string
     * The identifier by which we can fire the relevant job starting mechanism.
     * 
     * @param metadata object
     * 
     * The metadata can include stuff like: tpm, durationInSeconds, clientMaxTimeout, ip, etc..
     */
    async start({ jobId, metadata = {} }) {
        const job = this.getJobById(jobId);
        if (job === false) {
            return new Error(`Could not find a job '${jobId}'`);
        }
        const result = await job.start(metadata);
        return result;
    }
}

module.exports = { JobsService };