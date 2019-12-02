const { describe, after, it, before } = require('mocha');
const { dockerComposeTool, getAddressForService } = require('docker-compose-mocha');
const path = require('path');
const chai = require('chai');
const { expect } = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-like'));

const pathToCompose = path.join(__dirname, 'docker-compose.yml');
let app, close;

const envName = dockerComposeTool(before, after, pathToCompose, {});

// Should fail at the moment. will be worked on soon.
describe('job executor jobs endpoint suite', () => {
    after(() => {
        console.log('closing http server..');
        return close();
    });

    before((done) => {
        getAddressForService(envName, pathToCompose, 'db', 27017)
            .then((result) => {
                console.log('db is up at ', result); // => '0.0.0.0:36589'
                process.env.DB_PORT = result.split(':')[1];
                console.log('starting the orchestrator process');
                const bootstrap = require('./../../orchestrator');
                app = bootstrap.app;
                close = bootstrap.close;
                done();
            });
    });

    it('should reply back with general status', () => {
        return chai.request(app)
            .get('/status')
            .then(res => {
                const { state } = res.body;
                expect(state.status.length).to.be.greaterThan(0);
                expect(state.live_jobs).to.be.equal(0);
            });
    });

    it('should list the available ta', async () => {
        const result = await chai.request(app)
            .get('/jobs/list/tasks');

        expect(result.body.length).to.be.greaterThan(0);
    });

    it('should start the hello-world job', async () => {
        const res = await chai.request(app).post('/jobs/start/helloWorld');

        expect(res.body).to.eql({
            ok: true,
            status: 'PENDING'
        });

        const resList = await chai.request(app).get('/jobs/list/active/helloWorld');
        expect(resList.body.data.length).to.be.greaterThan(0);
    });

    it.only('should reply with status of stopping the job /jobs/:id/stop', async () => {
        return chai.request(app)
            .post('/jobs/1/stop')
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
});
