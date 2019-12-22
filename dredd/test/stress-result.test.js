"use strict";

const {passed} = require('../dredd-run');


test('should return PASS when no/empty error property (REMOVE THIS TEST AFTER ADDING MORE SPECIFIC PASSING TESTS)', () => {
    const testResults = require('./pass');
    const hasPassed = passed(testResults);
    expect(hasPassed.passed).toEqual(true);
});

test('should return FAIL when error property is not empty', () => {
    const testResults = require('./fail-has-error-prop');
    const hasPassed = passed(testResults);
    expect(hasPassed.passed).toEqual(false);
});

test('should return FAIL when no updates', () => {
    const testResults = require('./fail-empty-updates');
    const hasPassed = passed(testResults);
    expect(hasPassed.passed).toEqual(false);
});
