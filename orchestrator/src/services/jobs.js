class JobsService {
    constructor({ availableTasks = {}, db = {} }) {
        this.availableTasks = availableTasks;
        this.db = db;
    }

    getTasks() {
        return this.availableTasks;
    }

    listAvailableTasks() {
        const _this = this;
        return Object
            .keys(this.availableTasks)
            .map(k => {
                return Object.assign({ id: k }, _this.availableTasks[k].meta);
            });
    }

    getTaskById(id) {
        const tasks = this.getTasks();
        if (id in tasks) {
            return tasks[id];
        }
        return false;
    }

    /**
     * 
     * @param taskId string
     * The identifier by which we can fire the relevant task starting mechanism.
     * 
     * @param metadata object
     * 
     * The metadata can include stuff like: tpm, durationInSeconds, clientMaxTimeout, ip, etc..
     */
    async start({ taskId, meta = {} }) {
        const task = this.getTaskById(taskId);
        if (task === false) {
            return new Error(`Could not find a task with Id: '${taskId}'`);
        }

        // Document the job start into our persistence layer
        const { err, jobId } = this.db.insertJob({ taskId, meta });

        if (err !== null) {
            return Promise.reject(err);
        }

        const result = await task.start(meta, jobId);
        return result;
    }
}

module.exports = { JobsService };