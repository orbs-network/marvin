'use strict';

const {generateJobId} = require('../util');

function insertJobToDb(jobProps) {

    // TODO DB Stuff

    return generateJobId();
}

module.exports = {
    insertJobToDb: insertJobToDb,
};