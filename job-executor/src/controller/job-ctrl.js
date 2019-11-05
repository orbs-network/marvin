'use strict';

const rp = require('request-promise-native');
const {runClientContainers} = require('../client-runner');
const {info, sleep} = require('../util');
const {config, state} = require('../state');

async function startJob(jobProps) {
    return runJobAndWaitForCompletion({jobConfig: jobProps});
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
async function runJobAndWaitForCompletion({steps = defaultLoadSteps, jobConfig = {}}) {
    state.job_status = 'RUNNING';
    state.job_runtime = 0;
    await updateParentWithJob(state);
    let reverseSteps = Array.from(steps);
    reverseSteps.reverse();
    info(`runJob() Started: setting job timeout to ${jobConfig.job_timeout_sec * 1000} ms. State=${JSON.stringify(state)}`);
    let allResults = [];

    const startTime = new Date();

    let totalClients = 0;
    while (!state.should_stop) {
        info(`Iteration starts. Should_stop=${state.should_stop} Steps=${JSON.stringify(steps)}`);
        for (let step of steps) {
            info(`Running runClientContainers`);
            totalClients += step.endurance;
            await runClientContainers(allResults, {
                instances: step.endurance, config: jobConfig
            });
        }

        for (let step of reverseSteps) {
            totalClients += step.endurance;
            await runClientContainers(allResults, {
                instances: step.endurance,
                config: jobConfig,
            });
        }

        info(`Finished starting clients`);

        const now = new Date();
        if (now - startTime > jobConfig.job_timeout_sec * 1000) {
            info(`LAST ITERATION`);
            state.should_stop = true;
        } else {
            info(`Passed ${now - startTime} ms, should only end after ${jobConfig.job_timeout_sec * 1000} ms`);
        }
        state.job_runtime = now - startTime;
        await waitForAllClientsCompletion(500);
    }

    const endTime = new Date();

    await waitForAllClientsCompletion(500);
    info(`--- All clients finished in ${endTime - startTime} ms`);
    state.job_status = 'DONE';
    state.job_runtime = endTime - startTime;
    const aggregatedResults = agg(allResults);
    await updateParentWithJob(state, allResults);
    info(`Sent update to orchestrator`);
    // await updateParentWithJob(state, aggregatedResults);
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
    for (let result of resultsArr) {
        info(`agg(): ${JSON.stringify(result)}`);
        totalTx += result.totalTransactions;
        errTx += result.errorTransactions;
        if (slowestTx < result.slowestTransactionMs) {
            slowestTx = result.slowestTransactionMs;
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
        job_status: currentState.job_status,
        runtime: currentState.job_runtime,
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
            info(`Error sending to orch: ${err}`);
        });

}


module.exports = {
    startJob: startJob,
};

