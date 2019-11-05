'use strict';

const {info} = require('./util');
const knex = require('knex')({
    client: 'mysql2',
    version: '5.7',
    connection: {
        host: '127.0.0.1',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'marvin'
    },
    pool: { min: 0 }, // See https://github.com/Vincit/objection.js/issues/534#issuecomment-343683129
});

function insertTransaction(record = {}, data, tableName) {
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

async function listJobs() {

    const rows = knex.select().table('jobs');
    console.log(rows);
}


module.exports = {
    knex,
    insertTransaction,
    listJobs
};