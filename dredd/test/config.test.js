"use strict";

const {passed} = require('../dredd-run');


test('should return PASS when no/empty error property (REMOVE THIS TEST AFTER ADDING MORE SPECIFIC PASSING TESTS)', () => {
    const current = require('./pass');
    const config = require('./config');
    const jobAnalysis = passed({current, config});
    expect(jobAnalysis.analysis.passed).toEqual(true);

});