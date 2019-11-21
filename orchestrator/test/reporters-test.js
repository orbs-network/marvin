'use strict';

const { describe, it } = require('mocha');
const chai = require('chai');
const { expect, assert } = require('chai');
const { createSlackMessageJobDone } = require('../src/slack');

describe('reporters test suite', () => {
    it.skip('should reply back with general status', () => {
        const jobUpdate = {
            summary: {
                total_tx_count: 439,
            },
            results: {
                total_tx: 124,
                err_tx: 7,
                max_service_time_ms: 431,
            },
            version: '0.0.1-abcdefg',
            job_id: 'TEST_JOB',
            runtime: 2334,
            status: 'DONE',
        };

        const actual = await createSlackMessageJobDone(jobUpdate);
    });

});