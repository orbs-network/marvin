const {before, describe, after, it} = require('mocha');
const chai = require('chai');
const {expect} = require('chai');
chai.use(require('chai-http'));
const app = require('../index');

describe('job executor jobs endpoint suite', () => {

    before(async () => {
    });

    it('should reply back with general status', async () => {
        return chai.request(app)
            .get('/status')
            .then(res => {
                expect(res.body.status).to.equal('OK');
            });
    });

    it('should reply with status of starting the job /job/start', async () => {
        return chai.request(app)
            .post('/jobs/1/start')
            //.send({...}) // TODO add body
            .then(res => {
                expect(res.body.status).to.equal('STARTING');
                expect(res.body.job_id).to.equal(1);
            });
    });

    it('should reply with status of stopping the job /job/stop', async () => {
        return chai.request(app)
            .post('/jobs/1/stop') // TODO add body
            // .send({...})
            .then(res => {

                expect(res.body.status).to.equal('STOPPING');
                expect(res.body.job_id).to.equal(1);
            });
    });

    it('should reply back with a job info in case the job exists /jobs/1/status', async () => {
        return chai.request(app)
            .get('/jobs/1/status')
            .then(res => {

                console.log(res.body);
                expect(res.body.pct_done).to.equal(86);
                expect(res.body.job_id).to.equal(1);
            });
    });

    // TODO add test for non-existent job

    it('should reply back with a job id updated successfully/jobs/1/update', async () => {
        return chai.request(app)
            .post('/jobs/1/status') // TODO add body
            // .send({...})
            .then(res => {

                console.log(res.body);
                expect(res.body.pct_done).to.equal(86);
            });
    });
    after(async () => {
        await shutdown()
    });
});
