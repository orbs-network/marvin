'use strict';

const mysql = require('mysql2/promise');
const moment = require('moment');
const {state} = require('../src/orch-state');
const {generateJobId, info, isoToDate} = require('./util');

async function getConnection() {

    if (state.db_connection) {
        return state.db_connection;
    }

    return await mysql.createConnection({
        host: '127.0.0.1',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'marvin'
    })
        .then(res => {
            info(`[SQL] Connected`);
            state.db_connection = res;
            return res;
        })
        .catch(ex => {
            throw ex;
        });
}


async function insertJobToDb(jobProps) {
    let stmt;
    try {
        const connection = await getConnection();
        const jobId = generateJobId();
        stmt = `
INSERT INTO jobs 
(name, vchain, branch, status, running, job_start, job_end, 
expected_duration_sec, tx_per_minute, total_tx_count, err_tx_count, 
semantic_version, commit_hash, error, comment, results)
VALUES 
('${jobId}', 
'${jobProps.vchain}', 
NULL, 
'NOT_STARTED', 
0, 
'${sqlDateTime(new Date())}', 
NULL, 
${jobProps.duration_sec}, ${jobProps.tpm}, 
0, 0, NULL, NULL, NULL, NULL, NULL)
`;
        const res = await connection.execute(stmt);
        info(`[SQL] Returned from insert job. JobId=${jobId}. Res=${JSON.stringify(res)}`);
        return jobId;
    } catch (ex) {
        info(`[SQL] Error (insertJobToDb): ${ex}. Stmt=${stmt}`);
        throw ex;
    }

}

function sqlDateTime(date) {
    return moment.utc(date).format('YYYY-MM-DD HH:mm:ss');
}

/*
.insert({
            name: jobId,
            vchain: jobProps.vchain,
            status: 'NOT_STARTED',
            running: 0,
            job_start: knex.fn.now(),
            total_tx_count: 0,
            err_tx_count: 0,
            tx_per_minute: jobProps.tpm || 0.0,
            expected_duration_sec: jobProps.duration_sec || 0,
            tx_response_max: 0,
            tx_response_p99: 0,
            tx_response_p95: 0,
            tx_response_p90: 0,
            tx_response_median: 0,
            tx_response_avg: 0,
 */

async function insertEventToDb(event) {
    let stmt;
    try {
        const connection = await getConnection();
        stmt = `
INSERT INTO events 
(event_start, event_end, vchain, description, tag1, tag2, semantic_version, commit_hash)
VALUES ('${sqlDateTime(event.event_start)}', '${sqlDateTime(event.event_end)}', '${event.vchain}', '${event.description}', '${event.tag1}', '${event.tag2}', '${event.semantic_version}', '${event.commit_hash}')
`;
        const res = await connection.execute(stmt);
        info(`[SQL] Returned from insert event. Res=${JSON.stringify(res)}`);
    } catch (ex) {
        info(`[SQL] Error (insertEventToDb): ${ex}. Stmt=${stmt}`);
        throw ex;
    }
}

async function updateJobInDb(jobUpdate) {

    jobUpdate.summary = jobUpdate.summary || {};

    let stmt;
    try {
        const connection = await getConnection();
        stmt = `
UPDATE jobs
SET
    status = '${jobUpdate.job_status}',
    error = '${jobUpdate.error}',
    running = ${jobUpdate.running ? 1 : 0},
    expected_duration_sec = ${jobUpdate.duration_sec || 0},
    tx_per_minute = ${jobUpdate.tpm || 0.0},
    total_tx_count = ${jobUpdate.summary.total_tx_count || -1},
    err_tx_count = ${jobUpdate.summary.err_tx_count || -1},
    semantic_version = '${jobUpdate.summary.semantic_version || 'NA'}',
    commit_hash = '${jobUpdate.summary.commit_hash || 'NA'}',
    error = NULL,
    results = '${JSON.stringify(jobUpdate.summary)}'
WHERE
    name = '${jobUpdate.job_id}';
`;
        const res = await connection.execute(stmt);
        info(`[SQL] Returned from update job. Res=${JSON.stringify(res)}`);
    } catch (ex) {
        info(`[SQL] Error (updateJobInDb): ${ex}. Stmt=${stmt}`);
        throw ex;
    }
    /*
    const updateProps = {
        status: jobUpdate.job_status,
        error: jobUpdate.error,
        running: jobUpdate.running ? 1 : 0,
        total_tx_count: jobUpdate.summary.total_tx_count,
        err_tx_count: jobUpdate.summary.err_tx_count,
        tx_per_minute: jobUpdate.tpm || 0.0,
        expected_duration_sec: jobUpdate.duration_sec || 0,
        tx_response_stddev: jobUpdate.summary.stddev_service_time_ms || 0,
        tx_response_max: jobUpdate.summary.max_service_time_ms || 0,
        tx_response_p99: jobUpdate.summary.p99_service_time_ms || 0,
        tx_response_p95: jobUpdate.summary.p95_service_time_ms || 0,
        tx_response_p90: jobUpdate.summary.p90_service_time_ms || 0,
        tx_response_median: jobUpdate.summary.median_service_time_ms || 0,
        tx_response_avg: jobUpdate.summary.avg_service_time_ms || 0,
        semantic_version: jobUpdate.summary.semantic_version,
        commit_hash: jobUpdate.summary.commit_hash,
    };
     */
}

async function listJobsFromDb() {
    try {
        const connection = await getConnection();
        const stmt = `
SELECT * FROM jobs;
`;
        const res = await connection.execute(stmt);
        const jobsList = res[0]||[];
        info(`[SQL] Returned from list jobs. Found ${jobsList.length} jobs`);
        return jobsList;
    } catch (ex) {
        info(`[SQL] Error (listJobsFromDb): ${ex}`);
        return null;
    }

}

module.exports = {
    insertJobToDb: insertJobToDb,
    updateJobInDb: updateJobInDb,
    insertEventToDb: insertEventToDb,
    listJobsFromDb: listJobsFromDb,
};