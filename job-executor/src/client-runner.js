const {exec} = require('child-process-promise');
const {info} = require('./util');
const {state} = require('./state');
const {sendJobStopped} = ('./comm');

const defaultLoadSteps = [
    {
        displayName: '10 tps',
        endurance: 2 // amount of containers to startup for this step
    },
    {
        displayName: '20 tps',
        endurance: 3
    },
    {
        displayName: '30 tps',
        endurance: 4
    },
    {
        displayName: '40 tps',
        endurance: 5
    },
    {
        displayName: '50 tps',
        endurance: 10
    }
];

/**
 *
 * This is the main loop which runs endlessly performing the setup load step
 */
async function runUntilStopped({steps = defaultLoadSteps, config = {}}) {
    let reverseSteps = Array.from(steps);
    reverseSteps.reverse();
    info('Started');

    do {
        for (let k in steps) {
            await executeJob(steps[k], config);
        }

        for (let k in reverseSteps) {
            await executeJob(reverseSteps[k], config);
        }

        info('finished an endurance loop!');
        info('');

        await cleanUpPrevClientRuns();
        await new Promise((resolve) => {
            setTimeout(resolve, 10 * 1000)
        })
    } while (!state.should_stop);
    info('Stopped');
    sendJobStopped()
}

async function executeJob(currentStep, config) {
    info('Running endurance step: ', currentStep.displayName);
    let results = await runClientContainers({
        instances: currentStep.endurance,
        config
    });
    info('Finished endurance step, preparing to save results to MySQL');

    await Promise.all(results.map(result => {
        if (result.exitCode === 0) {
            return callJobStopWithResult(result.stdout, config)
        } else {
            info('WARN: Could not store batch results because of an error', result.stderr)
        }
    }));
    await new Promise((resolve) => {
        setTimeout(resolve, 5 * 1000)
    })
}

async function callJobStopWithResult(result) {
    // HTTP POST to orchestrator with URL /jobs/:id/stop and BODY=result
}


async function runClientContainers({
                                       instances = 1,
                                       config
                                   }) {
    const clients = [];
    for (let i = 0; i < instances; i++) {
        clients.push({
            id: i,
        })
    }

    const clientConfigPath = config.clientConfig || 'config/testnet-master-aws.json';

    const clientsResults = await Promise.all(clients.map(async (o) => {
        info('Running client container');
        try {
            const result = await exec(`docker run endurance:client ./client ${clientConfigPath} IDO,5`);
            // const result = await exec(`../client/client ${clientConfigPath} IDO,5`);
            info('Returned from client container with exit code ' + result.childProcess.exitCode);
            return {
                id: o.id,
                exitCode: result.childProcess.exitCode,
                stderr: result.stderr,
                stdout: result.stdout,
            }
        } catch (ex) {
            console.log('Failed to run client: ' + ex);
            throw ex
        }
    }));

    return clientsResults
}

function cleanUpPrevClientRuns() {
    return exec("(docker ps -a | grep endurance:client | awk '{print $1}' || echo :) | xargs docker rm -fv")
}

module.exports = {
    runUntilStopped,
};