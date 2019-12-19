'use strict';

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const helloWorld = {
    meta: {
        description: 'This is a very simple job description'
    },
    start(data, jobId) {
        console.log('hello world with', data, jobId);

        setTimeout(async () => {
            console.log('now pending!');
            fetch(`http://127.0.0.1:4567/jobs/${jobId}/update`, {
                method: 'POST',
                body: JSON.stringify({
                    status: "PENDING",
                    results: [],
                }),
                headers: { 'Content-Type': 'application/json' },
            });
        }, 2 * 1000);

        setTimeout(() => {
            console.log('now done!');
            fetch(`http://127.0.0.1:4567/jobs/${jobId}/update`, {
                method: 'POST',
                body: JSON.stringify({
                    status: "DONE",
                    results: [],
                    runtime: 6946
                }),
                headers: { 'Content-Type': 'application/json' },
            });
        }, 5 * 1000);

        return Promise.resolve({ ok: true, status: 'PENDING' });
    },
    update() {

    }
};

module.exports = helloWorld;