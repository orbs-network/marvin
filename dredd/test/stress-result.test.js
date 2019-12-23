"use strict";

const {passed} = require('../dredd-run');


test('should return PASS when no/empty error property (REMOVE THIS TEST AFTER ADDING MORE SPECIFIC PASSING TESTS)', () => {
    const testResults = require('./pass');
    const jobAnalysis = passed(testResults, {});
    expect(jobAnalysis.analysis.passed).toEqual(true);
});

test('should return FAIL when error property is not empty', () => {
    const testResults = require('./fail-has-error-prop');
    const jobAnalysis = passed(testResults);
    expect(jobAnalysis.analysis.passed).toEqual(false);
});

test('should return FAIL when no updates', () => {
    const testResults = require('./fail-empty-updates');
    const jobAnalysis = passed(testResults);
    expect(jobAnalysis.analysis.passed).toEqual(false);
});
