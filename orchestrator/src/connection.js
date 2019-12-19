'use strict';

const {promisify} = require('bluebird');
const {MongoClient} = require('mongodb');
const {info} = require('./util');

/**
 * Connects to a MongoDB server
 * (Private method)
 */
async function connectToMongoDB() {
    const timeoutMillis = 5000;
    const e = process.env;
    const host = e.DB_HOST || 'localhost';
    const port = e.DB_PORT || '27017';
    const user = e.DB_USER || '';
    const pass = e.DB_PASS || '';
    const userpassColon = (user === '' && pass === '') ? '' : ':';
    const db = e.DB_NAME || 'marvin';
    const auth = (pass.length > 0) ? '@' : '';

    let url;
    if (process.env.NODE_ENV === 'production') {
        url = `mongodb://${user}${userpassColon}${pass}${auth}${host}:${port}/${db}?authSource=admin`;
    } else {
        url = `mongodb://${host}:${port}/${db}`;
    }

    info('Connecting to MongoDB with connection string:', url);
    const connectionOptions = {
        connectTimeoutMS: timeoutMillis,
        useUnifiedTopology: true,
    };
    try {
        const connection = await promisify(MongoClient.connect)(url, connectionOptions);
        info('Connected to DB');
        return {db: connection.db(db), connection};
    } catch (err) {
        info('Failed to connect to DB', err);
        throw err;
    }
}

// private property
let connection;
let bareConnection;

const connector = {
    async getConnection() {
        if (!connection) {
            const {db, connection: conn} = await connectToMongoDB();
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
