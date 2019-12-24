"use strict";

const {passed} = require('../dredd-run');

const cases = [
    [
        'should return PASS when no/empty error property (REMOVE THIS TEST AFTER ADDING MORE SPECIFIC PASSING TESTS)',
        './pass',
        true
    ],
];
// How to do table testing in jest??
// See https://jestjs.io/blog/2018/05/29/jest-23-blazing-fast-delightful-testing#jest-each

test.each(cases)('%s', (name, current, shouldPass) => {
    const jobResult = require(current);
    const jobAnalysis = passed({current: jobResult});
    expect(jobAnalysis.analysis.passed).toEqual(shouldPass);
});

// test('should return PASS when no/empty error property (REMOVE THIS TEST AFTER ADDING MORE SPECIFIC PASSING TESTS)', () => {
//     const current = require('./pass');
//     const jobAnalysis = passed({current});
//     expect(jobAnalysis.analysis.passed).toEqual(true);
// });
//
// test('should return FAIL when error property is not empty', () => {
//     const testResults = require('./fail-has-error-prop');
//     const jobAnalysis = passed(testResults);
//     expect(jobAnalysis.analysis.passed).toEqual(false);
// });
//
// test('should return FAIL when no updates', () => {
//     const testResults = require('./fail-empty-updates');
//     const jobAnalysis = passed(testResults);
//     expect(jobAnalysis.analysis.passed).toEqual(false);
// });
