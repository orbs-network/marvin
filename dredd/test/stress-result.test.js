"use strict";

const {passed} = require('../dredd');


test('should return PASS', () => {
    const testResults = require('./passing-stress-test.json');
    const hasPassed = passed(testResults);
    expect(hasPassed).toStrictEqual({passed: true});
});

test('should return FAIL', () => {
    const testResults = require('./failing-stress-test.json');
    const hasPassed = passed(testResults);
    expect(hasPassed).toStrictEqual({passed: false});
});
