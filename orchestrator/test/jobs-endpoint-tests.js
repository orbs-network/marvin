const {before, describe, after, it} = require('mocha');
const chai = require('chai');
const {expect, assert} = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-like'));
const app = require('../app');

describe('job executor jobs endpoint suite', () => {

    before(async () => {
    });

    it('should reply back with general status', async () => {
        return chai.request(app)
            .get('/status')
            .then(res => {
                assert(res.body.status && res.body.status.length > 0);
            });
    });

    it('should reply with status of starting the job /jobs/start', async () => {
        const startJobBody = {
            tpm: 5,
            duration_sec: 10,
        };
        const expectedRes = {
            status: 'PENDING',
            props: startJobBody
        };
        return chai.request(app)
            .post('/jobs/start')
            .send(startJobBody)
            .then(res => {
                expect(res.body).like(expectedRes);
                assert(res.body.job_id && res.body.job_id.length > 0);
            });
    });

    it('should reply with status of stopping the job /jobs/:id/stop', async () => {
        return chai.request(app)
            .post('/jobs/1/stop') // TODO add body
            // .send({...})
            .then(res => {

                expect(res.body.status).to.equal('STOPPING');
                expect(res.body.job_id).to.equal('1');
            });
    });

    it('should reply back with a job info in case the job exists /jobs/:id/status', async () => {
        return chai.request(app)
            .get('/jobs/1/status')
            .then(res => {
                console.log(res.body);
                expect(res.body.status).to.equal('RUNNING');
                expect(res.body.pct_done).to.equal(86);
                expect(res.body.job_id).to.equal('1');
            });
    });

    // TODO add test for non-existent job

    it('should reply back with a job id updated successfully /jobs/:id/update', async () => {
        const jobUpdate = {
            "job_status": "COMPLETED", "results": [], "runtime_ms": 6946
        };
        return chai.request(app)
            .post('/jobs/1/update')
            .send(jobUpdate)
            .then(res => {
                console.log(res.body);
                expect(res.body.runtime_ms).to.equal(jobUpdate.runtime_ms);
                expect(res.body.status).to.equal('COMPLETED');
            });

    });
    after(async () => {
        app.server.close();
    });
});
