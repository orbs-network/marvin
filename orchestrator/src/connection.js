'use strict';

const { promisify } = require('bluebird');
const { MongoClient } = require('mongodb');

/**
 * Connects to a MongoDB server
 * (Private method)
 */
async function connectToMongoDB() {
    const e = process.env;
    const host = e.DB_HOST || 'localhost';
    const port = e.DB_PORT || '27017';
    const user = e.DB_USER || '';
    const pass = e.DB_PASS || '';
    const userpassColon = (user === '' && pass === '') ? '' : ':';
    const db = e.DB_NAME || 'marvin';
    const auth = (pass.length > 0) ? '@' : '';

    if (process.env.NODE_ENV === 'production') {
        var url = `mongodb://${user}${userpassColon}${pass}${auth}${host}:${port}/${db}?authSource=admin`;
    } else {
        var url = `mongodb://${host}:${port}/${db}`;
    }

    console.log('connecting to mongodb..');
    console.log('using connection string:', url);
    const connection = await promisify(MongoClient.connect)(url, { useUnifiedTopology: true });
    console.log('Connected correctly to server');
    return connection.db(db);
}

// private property
let connection;

const connector = {
    async getConnection() {
        if (!connection) {
            connection = await connectToMongoDB();
        }
        return connection;
    }
};

module.exports = connector;
