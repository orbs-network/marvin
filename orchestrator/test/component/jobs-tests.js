const { describe, it } = require('mocha');
const { expect } = require('chai');
const { JobsService } = require('./../../src/services/jobs');
let s;

describe('jobs service', () => {
    before(() => {
        const availableProfiles = {
            simpleTest: {
                meta: {
                    description: 'Some descriptive explanation'
                },
                start() {
                    return Promise.resolve({ ok: true, started: true, id: 'simpleJob' });
                }
            },
            yetAnotherTest: {
                meta: {
                    description: 'Some descriptive explanation for this test as well'
                },
                start() {
                    return Promise.resolve({ ok: true });
                }
            }
        };

        s = new JobsService({ availableProfiles });
    });

    it('should list available profiles', () => {
        const jobs = s.listAvailableProfiles();
        expect(typeof jobs).to.equal('object');
        expect(jobs).to.eql([
            {
                id: 'simpleTest',
                description: 'Some descriptive explanation'
            },
            {
                id: 'yetAnotherTest',
                description: 'Some descriptive explanation for this test as well'
            }
        ]);
    });

    it('should start a job', async () => {
        const p = s.getProfileByName('simpleTest');
        const result = await p.start({ jobId: 'simpleJob' });
        expect(typeof result).to.equal('object');
        expect(result.ok).to.equal(true);
        expect(result).to.eql({ ok: true, started: true, id: 'simpleJob' });
    });
});