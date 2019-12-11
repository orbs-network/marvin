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
    return { db: connection.db(db), connection };
}

// private property
let connection;
let bareConnection;

const connector = {
    async getConnection() {
        if (!connection) {
            const { db, connection: conn } = await connectToMongoDB();
            bareConnection = conn;
            connection = db;
        }
        return connection;
    },
    close() {
        if (bareConnection) {
            return bareConnection.close();
        }
    }
};

module.exports = connector;
