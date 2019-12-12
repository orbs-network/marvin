"use strict";

const {
    describe,
    it
} = require('mocha');
const {
    expect
} = require('chai');


describe('dredd', () => {

    it('should return PASS', () => {
        const testResults = require('./passing-stress-test.json');
        const hasPassed = analyze(testResults);
        expect(hasPassed).to.be.true;
    });

    it('should return FAIL', () => {
        const testResults = require('./failing-stress-test.json');
        const hasPassed = analyze(testResults);
        expect(hasPassed).to.be.false;
    });

});