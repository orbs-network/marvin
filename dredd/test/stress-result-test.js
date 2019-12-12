"use strict";

const {describe, it} = require('mocha');
const {expect} = require('chai');
const {passed} = require('../dredd');

describe('dredd', () => {

    it('should return PASS', () => {
        const testResults = require('./passing-stress-test.json');
        const hasPassed = passed(testResults);
        expect(hasPassed).to.be.true;
    });

    it('should return FAIL', () => {
        const testResults = require('./failing-stress-test.json');
        const hasPassed = passed(testResults);
        expect(hasPassed).to.be.false;
    });

});