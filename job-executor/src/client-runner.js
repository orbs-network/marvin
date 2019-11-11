'use strict';

const {exec} = require('child_process');
const {info} = require('./util');
const {all_tx} = require('./executor-state');
const _ = require('lodash');

async function startClientContainers(step, state) {

    info(`startClientContainers(): running step: ${step.display_name}`);
    const clients = [];
    for (let i = 0; i < step.instances; i++) {
        clients.push({
            id: `${state.job_id}_${state.instance_counter++}`,
        });
    }

    const clientConfigPath = state.client_config || 'config/testnet-master-aws.json';

    await Promise.all(clients.map(async (client) => {
        try {
            let cmd;
            if (state.use_mock_client) {
                cmd = `./src/mock-client.sh ${client.id} ${state.client_timeout_sec} ${state.vchain} 10 2`;
            } else {
                cmd = `docker run -t --rm endurance:client ./client ${clientConfigPath} ${client.id},${state.client_timeout_sec},${step.tpm}`;
            }


            const clientProc = await exec(cmd, {cwd: '.', stdio: ['ignore', 'pipe', process.stderr]});
            if (!clientProc || !clientProc.stdout) {
                return {
                    name: client.id,
                    error: `Error running client with cmd: ${cmd}`
                };
            }
            state.live_clients++;
            // info(`Started client #${state.live_clients}, pid=${clientProc.pid}: ${cmd}`);
            clientProc.stdout.on('data', (data) => {
                try {
                    processClientOutput(JSON.parse(data || {}), state);
                } catch (ex) {
                    info(`Error parsing data from client, skipping. Ex=${ex}. Data=${data}`);
                }

            });

            clientProc.on('close', (code) => {
                state.live_clients--;
                // info(`child proc ${clientProc.pid} exited with code ${code}. #live=${state.live_clients}`);
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


// function agg(state) {
//     // TODO aggregate results and return a single object
//
//     let totalTx = 0, errTx = 0, slowestTx = 0;
//     let version = '';
//     info(`agg(): #state.all_results=${state.all_results.length}`);
//     for (let result of state.all_results) {
//         info(`agg(): ${JSON.stringify(result)}`);
//         totalTx += result.totalTransactions;
//         errTx += result.errorTransactions;
//         if (slowestTx < result.slowestTransactionMs) {
//             slowestTx = result.slowestTransactionMs;
//         }
//         version = result.semanticVersion;
//     }
//
//     return {
//         version: version,
//         total_tx: totalTx,
//         err_tx: errTx,
//         max_service_time_ms: slowestTx,
//     };
// }


function processClientOutput(clientOutput, state) {
    clientOutput.transactions = clientOutput.transactions || [];
    const clientTxDurations = _.map(clientOutput.transactions, tx => (tx.dur || 0));
    all_tx.tx_durations = _.concat(all_tx.tx_durations, clientTxDurations||[]);
    _.forEach(clientTxDurations||[], dur => all_tx.hdr.recordValue(dur));
    // info(`TX_DURATIONS (${all_tx.tx_durations.length}): ${JSON.stringify(all_tx.tx_durations)}`);
    state.summary.total_tx_count += clientOutput.totalTransactions;
    state.summary.err_tx_count += clientOutput.errorTransactions;
    const totalDurPerClient = _.reduce(clientTxDurations, (acc, val) => acc + val, 0);
    state.summary.total_dur += totalDurPerClient;
    state.summary.semantic_version = clientOutput.semanticVersion;
    state.summary.commit_hash = clientOutput.commitHash;
    state.summary.median_service_time_ms = all_tx.hdr.getValueAtPercentile(50);
    state.summary.p90_service_time_ms = all_tx.hdr.getValueAtPercentile(90);
    state.summary.p95_service_time_ms = all_tx.hdr.getValueAtPercentile(95);
    state.summary.p99_service_time_ms = all_tx.hdr.getValueAtPercentile(99);
    state.summary.avg_service_time_ms = all_tx.hdr.getMean();
    state.summary.max_service_time_ms = all_tx.hdr.maxValue;

    info(`Client completed, total duration of ${clientOutput.transactions.length} transactions: ${totalDurPerClient}`);

}

module.exports = {
    startClientContainers: startClientContainers,
};