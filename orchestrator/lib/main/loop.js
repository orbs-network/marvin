const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'marvin'
});

console.log('Connecting to MySQL')
connection.connect();
console.log('Connected to MySQL!')

const mockData = require('./data.json')
const { insertTransaction } = require('./mysql')

const defaultLoadSteps = [
    {
        displayName: '10 tps',
        endurance: 1 // amount of containers to startup for this step
    },
    {
        displayName: '20 tps',
        endurance: 2
    },
    {
        displayName: '30 tps',
        endurance: 3
    },
    {
        displayName: '40 tps',
        endurance: 4
    },
    {
        displayName: '50 tps',
        endurance: 5
    }
];

/**
 * 
 * This is the main loop which runs endlessly performing the setup load step
 */
async function enduranceLoop({ steps = defaultLoadSteps }) {
    let reverseSteps = Array.from(steps)
    reverseSteps.reverse()

    do {
        for (let k in steps) {
            let currentStep = steps[k]
            console.log('Running endurance step: ', currentStep.displayName)
            await storeBatchOutputs(JSON.stringify(mockData))
        }

        for (let k in reverseSteps) {
            let currentStep = reverseSteps[k]
            console.log('Running endurance step: ', currentStep.displayName)
        }

        console.log('finished an endurance loop!')
        console.log('')

        await new Promise((resolve) => { setTimeout(resolve, 10 * 1000) })
    } while (true);
}

async function storeBatchOutputs(dataAsString) {
    const data = JSON.parse(dataAsString)

    await Promise.all(data.transactions.map(tx => {
        console.log(tx)
        return insertTransaction(tx, connection)
    }))
}

process.on('exit', () => {
    console.log('Closing the connection to MySQL');
    connection.end();
})

module.exports = {
    enduranceLoop,
}

