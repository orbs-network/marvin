const { describe, it } = require('mocha');
const { expect } = require('chai');
const { JobsService } = require('./../../src/services/jobs');
let s;

describe('jobs service', () => {
    before(() => {
        const availableJobs = {
            simpleTest: {
                meta: {
                    description: 'Some descriptive explanation'
                },
                start() {
                    return Promise.resolve({ ok: true, started: true, id: 'simpleTest' });
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

        s = new JobsService({ availableJobs });
    });

    it('should list available jobs', () => {
        const jobs = s.listAvailableJobs();
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
        const result = await s.start({ jobId: 'simpleTest' });
        expect(typeof result).to.equal('object');
        expect(result.ok).to.equal(true);
        expect(result).to.eql({ ok: true, started: true, id: 'simpleTest' });
    });
});