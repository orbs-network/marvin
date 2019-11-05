'use strict';

const {describe, it} = require('mocha');
const chai = require('chai');
const {expect, assert} = require('chai');
const {createSlackMessage} = require('../src/controller/jobs-ctrl');

describe('reporters test suite', () => {

    it('should reply back with general status', () => {

        const jobUpdate = {
            totalTransactions: 123,
            errorTransactions: 7,
            slowestTransactionMs: 431,
            runtime: 2334,

        };

        const actual = createSlackMessage(jobUpdate);
        console.log(actual);

    });

});