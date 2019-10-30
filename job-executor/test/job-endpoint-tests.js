const {before, describe, after, it} = require('mocha');
const chai = require('chai');
const {expect} = require('chai');
chai.use(require('chai-http'));
// const {bootstrap, shutdown} = require('../src/app');
const app = require('../src/app');

describe('job executor jobs endpoint suite', () => {

    before(async () => {
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
        const startJobBody = {
            job_id: '20191030_094500',
            tpm: 5,
            duration_sec: 10,
        };
        return chai.request(app)
            .post('/job/start')
            .send(startJobBody)
            .then(res => {
                expect(res.body.status).to.equal('STARTING');
                expect(res.body.job_id).to.equal('20191030_094500');
            });
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
                expect(res.body.pct_done).to.equal(86);
            });
    });

    after(async () => {
        // app.server.close();
    })
});