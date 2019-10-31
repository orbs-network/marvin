const {exec, execSync} = require('child_process');
const {info} = require('./util');
const {state, config} = require('./state');
const {sendJobStopped} = ('./comm');

const rp = require('request-promise-native');

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
async function runJob({steps = defaultLoadSteps, jobConfig = {}}) {
    jobConfig.job_timeout_sec = 5;
    let reverseSteps = Array.from(steps);
    reverseSteps.reverse();
    info(`runJob() Started: setting job timeout to ${jobConfig.job_timeout_sec * 1000} ms. State=${JSON.stringify(state)}`);
    let allResults = [];

    const startTime = new Date();
    state.job_status = 'RUNNING';
    while (!state.should_stop) {
        info(`Iteration starts. Should_stop=${state.should_stop} Steps=${JSON.stringify(steps)}`);
        for (let k in steps) {
            info(`Running runClientContainers`);
            const clientResults = await runClientContainers({
                instances: steps[k].endurance, config: jobConfig
            });
            allResults.concat(clientResults);
        }

        for (let k in reverseSteps) {
            const clientResults = await runClientContainers({
                instances: reverseSteps[k].endurance, config: jobConfig
            });
            allResults.concat(clientResults);
        }

        info('Starting docker container cleanup..');
        await cleanUpPrevClientRuns();
        info(`Finished iteration of ${JSON.stringify(steps)} steps, waiting for cleanup`);

        if (new Date() - startTime > jobConfig.job_timeout_sec*1000) {
            info(`SHOULD STOP`);
            state.should_stop = true;
        }

        // await new Promise((resolve) => {
        //     setTimeout(resolve, 10 * 1000)
        // })
    }
    const endTime = new Date();
    state.job_status = 'COMPLETED';
    info('Job finished, informing Orchestrator');

    const aggregatedResults = agg(allResults);

    const jobResult = {
        job_id: jobConfig.id,
        job_status: state.job_status,
        results: aggregatedResults,
        runtime_ms: endTime - startTime,
    };

    await updateParentWithJob(jobResult);
}

function agg(resultsArr) {
    // TODO aggregate results and return a single object
    return resultsArr;
}

async function updateParentWithJob(results) {
    // HTTP POST to orchestrator with URL /jobs/:id/stop and BODY=result
    const uri = `${config.parent_base_url}/jobs/${state.job_id}/update`;
    const options = {
        method: 'POST',
        uri: uri,
        body: results,
        json: true,
    };
    info(`HTTP POST to ${uri} with body: ${JSON.stringify(results)}`);
    return rp(options);
}


async function runClientContainers({instances = 1, config}) {
    info(`runClientContainers(): running ${instances} instances`);
    const clients = [];
    for (let i = 0; i < instances; i++) {
        clients.push({
            id: `${config.job_id}_${state.instance_counter++}`,
        })
    }

    const clientConfigPath = config.client_config || 'config/testnet-master-aws.json';

    const clientResults = [];
    await Promise.all(clients.map(async (client) => {
        try {
            const cmd = `docker run -t --rm endurance:client ./client ${clientConfigPath} ${client.id},${config.client_timeout_sec}`;

            const clientProc = await exec(cmd, {stdio: ['ignore', 'pipe', process.stderr]});
            info(`Started client container pid=${clientProc.pid}: ${cmd}`);
            clientProc.stdout.on('data', (data) => {
                info(`STDOUT ${client.id}: ${data}`);
                try{
                    const jsonData = JSON.parse(data);
                    clientResults.push(jsonData);
                } catch(ex) {
                    info(`Error parsing data, skipping. Data=${data}`);
                }

            });

            clientProc.on('close', (code) => {
                info(`child proc ${clientProc.pid} exited with code ${code}`);
            });

            // const result = await exec(`../client/client ${clientConfigPath} IDO,5`);
            // info(`Returned from client container with result: ${JSON.stringify(result)}`);
            // return {
            //     id: o.id,
            //     exitCode: result.childProcess.exitCode,
            //     stderr: result.stderr,
            //     stdout: result.stdout,
            // }
        } catch (ex) {
            console.log('Failed to run client: ' + ex);
            throw ex
        }
    }));

    // if (result.childProcess.exitCode != 0) {
    //     return {
    //         status: 'ERROR',
    //         message: result.childProcess.stderr,
    //     }
    // }

    return clientResults;
}

function agg(results) {
    return results;
}

function cleanUpPrevClientRuns() {
    try {
        execSync("(docker ps -a | grep endurance:client | grep Exited | awk '{print $1}' || echo :) | xargs docker rm -fv");
    } catch(ex) {
        info(`Error cleaning client containers: ${ex}`);
    }
}

module.exports = {
    runJob: runJob,
};