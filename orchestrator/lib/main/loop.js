const mysql = require('mysql');
const { exec } = require('child-process-promise')
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'marvin'
});
const verbosity = process.env.VERBOSE === 'true'

function info() {
    if (verbosity) {
        console.log.apply(this, arguments)
    }
}

info('Connecting to MySQL')
connection.connect();
info('Connected to MySQL!')

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
            await executeStep(steps[k])
        }

        for (let k in reverseSteps) {
            await executeStep(reverseSteps[k])
        }

        info('finished an endurance loop!')
        info('')

        await cleanUpPrevClientRuns()
        await new Promise((resolve) => { setTimeout(resolve, 10 * 1000) })
    } while (true);
}

async function executeStep(currentStep) {
    info('Running endurance step: ', currentStep.displayName)
    let results = await runClientContainers({ instances: currentStep.endurance })
    info('Finished endurance step, preparing to save results to MySQL')

    await Promise.all(results.map(result => {
        if (result.exitCode === 0) {
            return storeBatchOutputs(result.stdout)
        } else {
            info('WARN: Could not store batch results because of an error', result.stderr)
        }
    }))
    await new Promise((resolve) => { setTimeout(resolve, 5 * 1000) })
}

async function storeBatchOutputs(dataAsString) {
    const data = JSON.parse(dataAsString)

    await Promise.all(data.transactions.map(tx => {
        return insertTransaction(tx, connection)
    }))
}

async function runClientContainers({ instances = 1 }) {
    const clients = []
    for (let i = 0; i < instances; i++) {
        clients.push({
            id: i,
        })
    }

    const clientsResults = await Promise.all(clients.map(async (o) => {
        const result = await exec('docker run endurance:client ./client config/testnet-aws.json IDO,5')

        return {
            id: o.id,
            exitCode: result.childProcess.exitCode,
            stderr: result.stderr,
            stdout: result.stdout,
        }
    }))

    return clientsResults
}

function cleanUpPrevClientRuns() {
    return exec("(docker ps -a | grep endurance:client | awk '{print $1}' || echo :) | xargs docker rm -fv")
}

process.on('exit', () => {
    info('Closing the connection to MySQL');
    connection.end();
})

module.exports = {
    enduranceLoop,
}

