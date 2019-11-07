'use strict';

const rp = require('request-promise-native');
const {runClientContainers} = require('../client-runner');
const {info, sleep} = require('../util');
const {config} = require('../executor-state');

async function startJob(state) {
    return runJobAndWaitForCompletion(state);
}

const defaultLoadSteps = [
    {
        displayName: '10 tps',
        instances: 1 // amount of containers to startup for this step
    },
    {
        displayName: '20 tps',
        instances: 2
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
async function runJobAndWaitForCompletion(state) {
    state.job_status = 'RUNNING';
    state.job_runtime = 0;
    await updateParentWithJob(state);
    const steps = calculateSteps(state);

    let reverseSteps = Array.from(steps);
    reverseSteps.reverse();
    info(`runJob() Started: setting job duration to ${state.duration_sec * 1000} ms. State=${JSON.stringify(state)}`);

    const startTime = new Date();


    while (!state.should_stop) {
        let totalClients = 0;
        info(`Iteration starts. Should_stop=${state.should_stop} Steps=${JSON.stringify(steps)}`);
        for (let step of steps) {
            totalClients += step.instances;
            await runClientContainers(step.instances, state);
        }

        for (let step of reverseSteps) {
            totalClients += step.instances;
            await runClientContainers(step.instances, state);
        }

        info(`Started ${totalClients} clients in this iteration`);

        const now = new Date();
        if (now - startTime > state.duration_sec * 1000) {
            info(`LAST ITERATION`);
            state.should_stop = true;
        } else {
            info(`Passed ${now - startTime} ms, should only end after ${state.duration_sec * 1000} ms`);
        }
        state.job_runtime = now - startTime;
        await updateParentWithJob(state);
        info(`Wait for client completion before next iteration. #live=${state.live_clients}`);
        await waitForAllClientsCompletion(state, 2000);
    }

    const endTime = new Date();

    await waitForAllClientsCompletion(state, 2000);
    info(`--- All clients finished in ${endTime - startTime} ms`);
    state.job_status = 'DONE';
    state.job_runtime = endTime - startTime;
    const aggregatedResults = agg(state);
    info(`Summary: ${JSON.stringify(state.summary)}`);
    await updateParentWithJob(state);
    info(`Sent update to orchestrator`);
    // await updateParentWithJob(state, aggregatedResults);
}

async function waitForAllClientsCompletion(state, pollingIntervalMs) {
    while (state.live_clients > 0) {
        info(`Sleeping because #live=${state.live_clients}`);
        await sleep(pollingIntervalMs);
    }
}


async function updateParentWithJob(currentState, res) {
    // HTTP POST to orchestrator with URL /jobs/:id/stop and BODY=result
    const uri = `http://${currentState.parent_base_url}/jobs/${currentState.job_id}/update`;
    const body = {
        job_id: currentState.job_id,
        job_status: currentState.job_status,
        live_clients: currentState.live_clients,
        runtime: currentState.job_runtime,
        duration_sec: currentState.duration_sec,
        tpm: currentState.tpm,
        results: res || {},
    };
    const options = {
        method: 'POST',
        uri: uri,
        body: body,
        json: true,
    };
    info(`HTTP POST to ${uri} with body: ${JSON.stringify(body)}`);
    return rp(options)
        .catch(err => {
            info(`Error sending to orchestrator, ignoring: ${err}`);
        });

}

function calculateSteps(state) {
    info(`calculateSteps(): tpm=${state.tpm}, duration_sec=${state.duration_sec}`);
    return defaultLoadSteps;
}


module.exports = {
    startJob: startJob,
};

