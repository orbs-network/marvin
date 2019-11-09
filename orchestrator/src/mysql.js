'use strict';

const {generateJobName, info} = require('./util');

const knex = require('knex')({
    client: 'mysql2',
    version: '5.7',
    connection: {
        host: '127.0.0.1',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'marvin'
    },
    pool: {min: 0}, // See https://github.com/Vincit/objection.js/issues/534#issuecomment-343683129
});


async function insertJobToDb(jobProps) {

    const jobName = generateJobName();

    return knex('jobs')
        .insert({
            name: jobName,
            status: 'NOT_STARTED',
            running: 0,
            job_start: knex.fn.now(),
            total_tx_count: 0,
            err_tx_count: 0,
            tx_per_minute: 0,
            tx_response_max: 0,
            tx_response_p99: 0,
            tx_response_p95: 0,
            tx_response_median: 0,
            tx_response_avg: 0,

        })
        .then(res => {
            info(`Inserted new job ${jobName} to DB`);
            return jobName;
        });
}

async function updateJobInDb(jobUpdate) {

    const updateProps = {
        status: jobUpdate.job_status,
        running: jobUpdate.running ? 1 : 0,
        total_tx_count: jobUpdate.summary.total_tx_count,
        err_tx_count: jobUpdate.summary.err_tx_count,
        tx_per_minute: jobUpdate.tpm||0.0,
        expected_duration_sec: jobUpdate.duration_sec||0,
        tx_response_max: jobUpdate.summary.max_service_time_ms||0,
        tx_response_p99: jobUpdate.summary.p99_service_time_ms||0,
        tx_response_p95: jobUpdate.summary.p95_service_time_ms||0,
        tx_response_median: jobUpdate.summary.median_service_time_ms||0,
        tx_response_avg: jobUpdate.summary.avg_service_time_ms||0,
    };

    if (!jobUpdate.running) {
        updateProps.job_end = knex.fn.now();
    }

    return knex('jobs')
        .where({name: jobUpdate.job_id})
        .update({updateProps})
        .then(res => {
            info(`Updated job ${jobUpdate.job_id} in DB`);
            return jobUpdate.job_id;
        })
        .catch(ex => {
            throw `Error updating DB jobName=${jobUpdate.job_id} status=${jobUpdate.job_status} ex=${ex}`;
        });
}


function insertTransaction(data, tableName, record = {}) {
    const hash = (data.commitHash || '').slice(0, 10);
    const version = data.semanticVersion || '';

    return knex(tableName)
        .insert({
            durationMillis: record.durationMillis,
            txResult: record.txResult,
            rr_createdate: knex.fn.now(),
            rr_createdate_unix: Math.floor(Date.now() / 1000),
            blockHeight: record.blockHeight,
            txId: record.txId,
            papiUrl: record.papiUrl,
            vchain: data.vchain,
            commitHash: hash,
            version: version
        });
}

async function listJobsFromDb() {
    return knex.select().table('jobs');
}


module.exports = {
    knex,
    insertTransaction: insertTransaction,
    insertJobToDb: insertJobToDb,
    updateJobInDb: updateJobInDb,
    listJobsFromDb: listJobsFromDb,
};