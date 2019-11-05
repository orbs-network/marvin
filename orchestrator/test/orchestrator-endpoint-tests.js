const {before, describe, after, it} = require('mocha');
const chai = require('chai');
const {expect, assert} = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-like'));
const nock = require('nock');
const app = require('../orchestrator');

const JOB_EXECUTOR_BASE_URL = 'http://127.0.0.1:4568';

describe('job executor jobs endpoint suite', () => {

    before(async () => {
    });

    it('should reply back with general status', async () => {
        return chai.request(app)
            .get('/status')
            .then(res => {
                assert(res.body.status && res.body.status.length > 0);
                assert(res.body.live_jobs === 0 || res.body.live_jobs > 0);
            });
    });

    it('should reply with status of starting the job /jobs/start', async () => {

        const jobExecutorMock = nock(JOB_EXECUTOR_BASE_URL)
            .log(console.log)
            .post('/job/123456/start')
            .reply(200, {id: '123ABC'});

        const startJobBody = {
            tpm: 5,
            duration_sec: 10,
        };
        const expectedRes = {
            status: 'PENDING',
            props: startJobBody
        };
        const res = await chai.request(app)
            .post('/jobs/start')
            .send(startJobBody);
        expect(res.body).like(expectedRes);
        assert(res.body.job_id && res.body.job_id.length > 0);

        setTimeout(() => {
            // Will throw an assertion error if meanwhile a "GET http://google.com" was
            // not performed.
            jobExecutorMock.done();
        }, 1000);

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
            "job_status": "DONE", "results": [], "runtime": 6946
        };
        return chai.request(app)
            .post('/jobs/1/update')
            .send(jobUpdate)
            .then(res => {
                console.log(res.body);
                expect(res.body.runtime).to.equal(jobUpdate.runtime);
                expect(res.body.status).to.equal('DONE');
            });

    });

    afterEach(() => {
        nock.cleanAll();
    });

    after(async () => {
        app.server.close();
    });
});
