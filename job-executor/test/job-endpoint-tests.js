const {before, describe, after, it} = require('mocha');
const chai = require('chai');
const {expect, assert} = require('chai');
chai.use(require('chai-http'));
// const {bootstrap, shutdown} = require('../src/app');
const nock = require('nock');
const app = require('../executor');

describe('job executor jobs endpoint suite', () => {
    before(async () => {

        nock.disableNetConnect();
        nock.enableNetConnect('127.0.0.1');

        // console.log(bootstrap);
        // app = await bootstrap();
    });

    it('should reply back with general status', async () => {
        return chai.request(app)
            .get('/status')
            .then(res => {
                expect(res.body.status).to.equal('OK');
            });
    });


    it('should reply with status of starting the job /job/start', async () => {
        const serverMock = nock('http://127.0.0.1:4567')
            .log(console.log)
            .post('/jobs/20191030_094500/update')
            .reply(200, {id: '123ABC'});

        const startJobBody = {
            job_id: '20191030_094500',
            tpm: 5,
            duration_sec: 10,
            client_timeout_sec: 0, // should not linger in the mock client
            job_timeout_sec: 0, // should not linger in the job
            use_mock_client: true,
        };
        console.error('active mocks: %j', serverMock.activeMocks());
        res = await chai.request(app)
            .post('/job/start')
            .send(startJobBody);
        expect(res.body.status).to.equal('STARTING');
        expect(res.body.job_id).to.equal('20191030_094500');

        setTimeout(() => {
            // Will throw an assertion error if meanwhile a "GET http://google.com" was
            // not performed.
            serverMock.done();
        }, 1000);
    });

    it('should reply with status of stopping the job /job/stop', async () => {
        return chai.request(app)
            .get('/job/stop')
            .then(res => {
                expect(res.body.status).to.equal('STOPPING');
            });
    });

    it('should reply back with a job info in case the job exists /job/status', async () => {
        return chai.request(app)
            .get('/job/status')
            .then(res => {
                assert(res.body.status && res.body.status.length > 0);
                expect(res.body.pct_done).to.equal(86);
            });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    after(async () => {
        // app.server.close();
    })
});