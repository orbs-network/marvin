"use strict";

const {passed} = require('../dredd-run');


test('should return PASS when no/empty error property (REMOVE THIS TEST AFTER ADDING MORE SPECIFIC PASSING TESTS)', () => {
    const current = require('./pass');
    const jobAnalysis = passed({current});
    expect(jobAnalysis.vchain).toBeTruthy();
    expect(jobAnalysis.jobId).toBeTruthy();
    expect(jobAnalysis.summary).toBeTruthy();
    expect(jobAnalysis.analysis.passed).toEqual(true);

});