const { describe, it } = require('mocha');
const { expect } = require('chai');
const nock = require('nock');
const metricsFixture = require('./fixtures/metrics');

const { getCommitFromMetricsURL, getCommiterUsernameByCommitHash, getSlackUsernameForGithubUser } = require('./../../src/github');
nock('http://1.2.3.4')
    .get('/metrics')
    .reply(200, metricsFixture);

describe('github common functions', () => {
    it('should get the commit from the metrics URL correctly', async () => {
        const result = await getCommitFromMetricsURL('http://1.2.3.4/metrics');
        expect(result).to.equal('7f32cc2d1d664988b677c6601b99282ec5f73f00');
    });

    it('should get the github committer login handle correctly', async () => {
        const githubLogin = await getCommiterUsernameByCommitHash('7f32cc2d1d664988b677c6601b99282ec5f73f00');
        expect(githubLogin).to.equal('noambergIL');
    });

    it('should provide a correct mention username for slack for orbs core members', () => {
        expect(getSlackUsernameForGithubUser('itamararjuan')).to.equal('Itamar');
    });
});
