const {info} = require('../util');

class JobsService {
    constructor({ availableProfiles = {}, db = {} }) {
        this.availableProfiles = availableProfiles;
        this.db = db;
    }

    getProfiles() {
        return this.availableProfiles;
    }

    listAvailableProfiles() {
        const _this = this;
        return Object
            .keys(this.availableProfiles)
            .map(k => {
                return Object.assign({ id: k }, _this.availableProfiles[k].meta);
            });
    }

    getProfileByName(name) {
        const profiles = this.getProfiles();
        
        if (name in profiles) {
            return profiles[name];
        }
        return false;
    }

    /**
     * 
     * @param profile string
     * The identifier by which we can fire the relevant profile starting mechanism.
     * 
     * @param metadata object
     * 
     * The metadata can include stuff like: tpm, durationInSeconds, clientMaxTimeout, ip, etc..
     */
    async start({ profile, meta = {} }) {
        const p = this.getProfileByName(profile);
        if (!p) {
            throw `Could not find a profile with name: '${profile}'`;
        }

        // Document the job start into our persistence layer
        const { err, jobId } = await this.db.insertJob({ profile, meta });

        if (err) {
            return Promise.reject(err);
        }

        const result = await p.start(meta, jobId);

        return {
            jobId,
            result,
        };
    }

    async getProfileByJobId(jobId) {
        const result = await this.db.getJobById({ jobId });
        return this.getProfileByName(result.profile);
    }

    /**
     * 
     * @param jobId string
     * The identifier by which we can fire the relevant profile update mechanism.
     * 
     * @param metadata object
     * 
     * The metadata can include stuff like: tpm, durationInSeconds, clientMaxTimeout, ip, etc..
     */
    async update({ jobId, data = {} }) {
        console.log('inside update!', jobId);
        const p = await this.getProfileByJobId(jobId);
        if (!p) {
            return new Error(`Could not find a profile from jobId: '${jobId}'`);
        }

        // Document the job update into our persistence layer
        const { err } = await this.db.updateJob({ jobId, data });

        if (err) {
            return Promise.reject(err);
        }

        const result = await p.update(data, jobId);

        return {
            jobId,
            result,
        };
    }
}

module.exports = { JobsService };