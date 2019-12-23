"use strict";

const {passed} = require('../dredd-run');


test('should return PASS when no/empty error property (REMOVE THIS TEST AFTER ADDING MORE SPECIFIC PASSING TESTS)', () => {
    const testResults = require('./pass');
    const jobAnalysis = passed(testResults, {});
    expect(jobAnalysis.analysis.passed).toEqual(true);

});