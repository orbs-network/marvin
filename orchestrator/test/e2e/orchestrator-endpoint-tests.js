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

    it('should list the available profiles', async () => {
        const result = await chai.request(app)
            .get('/profiles/list');

        expect(result.body.length).to.be.greaterThan(0);
    });

    it('should start a job with profile called hello-world ', async () => {
        const res = await chai.request(app).post('/jobs/start/helloWorld');

        expect(res.body.result).to.eql({
            ok: true,
            status: 'PENDING'
        });
        expect(res.body).to.have.any.keys(['jobId']);

        const { jobId } = res.body;

        const resList = await chai.request(app).get('/jobs/list/active/helloWorld');
        expect(resList.body.data.length).to.be.greaterThan(0);
        expect(resList.body.data[0].jobId).to.equal(jobId);
    });

    it('should reply back with a job info in case the job exists /jobs/:id/status', async () => {
        const res = await chai.request(app).post('/jobs/start/helloWorld')
            .send({ gitBranch: 'some-branch' });
        const { jobId } = res.body;

        // Check that the job exists in the db and is in status 'NOT_STARTED'
        let result = await chai.request(app).get(`/jobs/${jobId}/status`);
        expect(result.body.status).to.equal('NOT_STARTED');
        expect(result.body.jobId).to.equal(jobId);
        expect(result.body.meta).to.have.any.keys(['gitBranch']);
        expect(result.body.meta.gitBranch).to.equal('some-branch');

        // We now wait for 2 seconds and want to see the state of the job change
        // in the db to 'PENDING'
        await new Promise((r) => { setTimeout(r, 4 * 1000) });

        result = await chai.request(app).get(`/jobs/${jobId}/status`);
        expect(result.body.status).to.equal('PENDING');
        expect(result.body.jobId).to.equal(jobId);

        // We now wait for 5 seconds and want to see the state of the job change
        // in the db to 'DONE'
        await new Promise((r) => { setTimeout(r, 10 * 1000) });

        result = await chai.request(app).get(`/jobs/${jobId}/status`);
        expect(result.body.status).to.equal('DONE');
        expect(result.body.jobId).to.equal(jobId);
    });

    it('should filter jobs of a certain branch when using /jobs/list/helloWorld/branch/:branch', async () => {
        const res = await chai.request(app).post('/jobs/start/helloWorld')
            .send({ gitBranch: 'some-branch' });

        expect(res.ok).to.equal(true);
        const { jobId } = res.body;

        const resMaster = await chai.request(app).post('/jobs/start/helloWorld')
            .send({ gitBranch: 'master' });

        expect(resMaster.ok).to.equal(true);
        const { jobId: jobIdMaster } = resMaster.body;

        const resList = await chai.request(app).get('/jobs/list/active/helloWorld');
        // The value of this expecation should be reduced to 2 when testing with .only
        expect(resList.body.data.length).to.equal(4);

        const resByBranchMasterList = await chai.request(app).get('/jobs/list/all/helloWorld/branch/master');
        expect(resByBranchMasterList.ok).to.equal(true);
    
        expect(resByBranchMasterList.body.data.length).to.equal(1);
        expect(resByBranchMasterList.body.data[0].jobId).to.equal(jobIdMaster);

        const resByBranchSomeBranchList = await chai.request(app).get('/jobs/list/all/helloWorld/branch/some-branch');
        console.log(resByBranchSomeBranchList.body.data);
        expect(resByBranchSomeBranchList.ok).to.equal(true);
        expect(resByBranchSomeBranchList.body.data.length).to.equal(2);
        expect(resByBranchSomeBranchList.body.data[0].jobId).to.equal(jobId);

        // We now wait for 5 seconds and want to see the state of the job change
        // in the db to 'DONE'
        await new Promise((r) => { setTimeout(r, 10 * 1000) });
    });
});
