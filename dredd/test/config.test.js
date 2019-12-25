"use strict";

const {passed} = require('../dredd-run');


test('should fail on metric > configured max, and pass on metric <= configured max', () => {

    const config = {
        "ranges": [
            {"name": "p99_service_time_ms", "max": 200 }
        ]
    };

    const results = {
        "profile": "stress",
        "jobId": "1234567890",
        "updates": [
            {
                "summary": {
                    "p99_service_time_ms": 201
                }
            }
        ]
    };

    expect(passed({current: results, config}).analysis.passed).toEqual(false);
    results.updates[0].summary.p99_service_time_ms = 200;
    expect(passed({current: results, config}).analysis.passed).toEqual(true);
});

