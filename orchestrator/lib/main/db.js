const mysql = require('mysql2/promise');
const { info } = require('./util');

var connection;

async function getConnection() {

    info('Trying to get DB connection');
    if (connection) {
        info('Returning existing DB connection');
        return connection;
    }

    connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: 'marvin'
    });

    console.log('Connecting to MySQL')
    connection.connect();
    console.log('Connected to MySQL!')

    return connection

}


module.exports = {
    getConnection
};