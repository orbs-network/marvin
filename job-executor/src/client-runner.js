'use strict';

const {exec} = require('child_process');
const {info} = require('./util');

async function runClientContainers(instances, state) {

    info(`runClientContainers(): running ${instances} instances`);
    const clients = [];
    for (let i = 0; i < instances; i++) {
        clients.push({
            id: `${state.job_id}_${state.instance_counter++}`,
        });
    }

    const clientConfigPath = state.client_config || 'config/testnet-master-aws.json';

    await Promise.all(clients.map(async (client) => {
        try {
            let cmd;
            if (state.use_mock_client) {
                cmd = `./src/mock-client.sh ${client.id} ${state.client_timeout_sec} 2013 10 2`;
            } else {
                cmd = `docker run -t --rm endurance:client ./client ${clientConfigPath} ${client.id},${state.client_timeout_sec}`;
            }


            const clientProc = await exec(cmd, {cwd: '.', stdio: ['ignore', 'pipe', process.stderr]});
            if (!clientProc || !clientProc.stdout) {
                return {
                    name: client.id,
                    error: `Error running client with cmd: ${cmd}`
                };
            }
            ++state.live_clients;
            info(`Started client #${state.live_clients}, pid=${clientProc.pid}: ${cmd}`);
            clientProc.stdout.on('data', (data) => {
                try {
                    processClientOutput(JSON.parse(data || {}), state);
                } catch (ex) {
                    info(`Error parsing data from client, skipping. Ex=${ex}. Data=${data}`);
                }

            });

            clientProc.on('close', (code) => {
                --state.live_clients;
                info(`child proc ${clientProc.pid} exited with code ${code}. #live=${state.live_clients}`);
            });
        } catch (ex) {
            console.log('Failed to run client: ' + ex);
            return {
                name: client.id,
                error: ex,
            };
        }
    }));
}


function agg(state) {
    // TODO aggregate results and return a single object

    let totalTx = 0, errTx = 0, slowestTx = 0;
    let version = '';
    info(`agg(): #state.all_results=${state.all_results.length}`);
    for (let result of state.all_results) {
        info(`agg(): ${JSON.stringify(result)}`);
        totalTx += result.totalTransactions;
        errTx += result.errorTransactions;
        if (slowestTx < result.slowestTransactionMs) {
            slowestTx = result.slowestTransactionMs;
        }
        version = result.semanticVersion;
    }

    return {
        version: version,
        total_tx: totalTx,
        err_tx: errTx,
        max_service_time_ms: slowestTx,
    };
}


function processClientOutput(clientOutput, state) {
    clientOutput.transactions = clientOutput.transactions || [];
    state.all_results.push(clientOutput);
    state.summary.total_tx_count += clientOutput.totalTransactions;
    state.summary.err_tx_count += clientOutput.errorTransactions;
    const totalDurPerClient = clientOutput.transactions.map(tx => (tx.dur || 0)).reduce((acc, val) => acc + val, 0);
    state.summary.total_dur += totalDurPerClient;
    state.summary.version = clientOutput.semanticVersion;
    state.summary.version = '';
    state.summary.avg_service_time_ms = state.summary.total_tx_count>0 ? Math.ceil(state.summary.total_dur / state.summary.total_tx_count) : 0;
    state.summary.max_service_time_ms = Math.ceil(state.summary.max_service_time_ms||0);
    if (state.summary.slowestTransactionMs < clientOutput.slowestTransactionMs) {
        state.summary.slowestTransactionMs = clientOutput.slowestTransactionMs;
    }


    info(`Total duration of ${clientOutput.transactions.length} transactions: ${totalDurPerClient}`);

}

module.exports = {
    runClientContainers: runClientContainers,
};