const rp = require('request-promise-native');
const {runClientContainers} = require('../client-runner');
const {info, sleep} = require('../util');
const {config, state} = require('../state');

async function startJob(jobProps) {
    await runJob({jobConfig: jobProps});
}

const defaultLoadSteps = [
    {
        displayName: '10 tps',
        endurance: 1 // amount of containers to startup for this step
    },
    {
        displayName: '20 tps',
        endurance: 2
    },
    // {
    //     displayName: '30 tps',
    //     endurance: 4
    // },
    // {
    //     displayName: '40 tps',
    //     endurance: 5
    // },
    // {
    //     displayName: '50 tps',
    //     endurance: 10
    // }
];


/**
 *
 * This is the main loop which runs endlessly performing the setup load step
 */
async function runJob({steps = defaultLoadSteps, jobConfig = {}}) {
    state.job_status = 'RUNNING';
    await updateParentWithJob(state);
    let reverseSteps = Array.from(steps);
    reverseSteps.reverse();
    info(`runJob() Started: setting job timeout to ${jobConfig.job_timeout_sec * 1000} ms. State=${JSON.stringify(state)}`);
    let allResults = [];

    const startTime = new Date();

    let totalClients = 0;
    while (!state.should_stop) {
        info(`Iteration starts. Should_stop=${state.should_stop} Steps=${JSON.stringify(steps)}`);
        for (let k in steps) {
            info(`Running runClientContainers`);
            totalClients += steps[k].endurance;
            await runClientContainers(allResults, {
                instances: steps[k].endurance, config: jobConfig
            });
        }

        for (let k in reverseSteps) {
            totalClients += reverseSteps[k].endurance;
            await runClientContainers(allResults, {
                instances: reverseSteps[k].endurance, config: jobConfig
            });
        }

        info(`Finished starting clients`);

        const now = new Date();
        if (now - startTime > jobConfig.job_timeout_sec * 1000) {
            info(`SHOULD STOP`);
            state.should_stop = true;
        } else {
            info(`SHOULD NOT STOP - passed ${now - startTime} ms but run should end after ${jobConfig.job_timeout_sec * 1000} ms`);
        }
        await waitForAllClientsCompletion(500);
    }

    const endTime = new Date();

    await waitForAllClientsCompletion(500);
    info(`--- All clients finished in ${endTime - startTime} ms`);
    state.job_status = 'COMPLETED';
    const aggregatedResults = agg(allResults);
    await updateParentWithJob(state, aggregatedResults);
}

async function waitForAllClientsCompletion(pollingIntervalMs) {
    while (state.live_clients > 0) {
        info(`Sleeping because #live=${state.live_clients}`);
        await sleep(pollingIntervalMs);
    }
}

function agg(resultsArr) {
    // TODO aggregate results and return a single object

    let totalTx = 0, errTx = 0, slowestTx = 0;
    // transactions[i].durationMillis
    for (let key in resultsArr) {
        info(`agg(): ${JSON.stringify(resultsArr[key])}`);
        totalTx += resultsArr[key]['totalTransactions'];
        errTx += resultsArr[key]['errorTransactions'];
        if (slowestTx < resultsArr[key]['slowestTransactionMs']) {
            slowestTx = resultsArr[key]['slowestTransactionMs']
        }
    }

    const aggregated = {
        total_tx: totalTx,
        err_tx: errTx,
        max_service_time_ms: slowestTx,
    };

    return aggregated;
}

async function updateParentWithJob(currentState, aggregatedResults) {
    // HTTP POST to orchestrator with URL /jobs/:id/stop and BODY=result
    const uri = `http://${config.parent_base_url}/jobs/${currentState.job_id}/update`;
    const body = {
        job_id: currentState.job_id,
        status: currentState.job_status,
        results: aggregatedResults,
    };
    const options = {
        method: 'POST',
        uri: uri,
        body: body,
        json: true,
    };
    info(`HTTP POST to ${uri} with body: ${JSON.stringify(body)}`);
    return rp(options)
        .then(res => {

        })
        .catch(err => {
            info(`Error sending to orch: ${err}`)
        });

}


module.exports = {
    startJob: startJob,
};

