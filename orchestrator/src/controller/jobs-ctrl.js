'use strict';

const {generateJobId} = require('../util');

function insertJobToDb(jobProps) {

    // TODO DB Stuff

    return generateJobId();
}

function createSlackMessage(jobUpdate) {
    return `Completed stress test on vchain 2013 on testnet in *${jobUpdate.runtime}* ms. Key metrics: test sent *${jobUpdate.totalTransactions}* transactions with max response time of *${jobUpdate.slowestTransactionMs}* ms`
}


module.exports = {
    insertJobToDb: insertJobToDb,
    createSlackMessage: createSlackMessage,
};