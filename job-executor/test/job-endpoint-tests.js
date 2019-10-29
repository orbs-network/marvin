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