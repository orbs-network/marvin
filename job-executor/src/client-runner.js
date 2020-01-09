'use strict';

const {exec} = require('child_process');
const {info, debug} = require('./util');
const {all_tx} = require('./executor-state');
const _ = require('lodash');

async function startClientContainers(step, state) {

    debug(`startClientContainers(): running step: ${step.display_name}`);
    const clients = [];
    for (let i = 0; i < step.instances; i++) {
        clients.push({
            id: `${state.jobId}_${state.instance_counter++}`,
        });
    }

    const remainingDurationSec = calcClientTimeout(state.duration_sec, state.client_timeout_sec, state.start_time);
    const targetIpsStr = (state.target_ips||[]).join('|');
    if (!targetIpsStr || targetIpsStr.length === 0) {
        throw "state.target_ips was not specified";
    }

    await Promise.all(clients.map(async (client) => {
        try {
            const clientStdouts = [];
            let cmd;
            if (state.use_mock_client) {
                cmd = `./src/mock-client.sh ${client.id} ${remainingDurationSec} ${state.vchain} 10 2`;
            } else {
                const clientProps = `${state.vchain},${targetIpsStr} ${client.id},${remainingDurationSec},${step.tpm}`;
                cmd = `docker run -t --rm endurance:client ./client ${clientProps}`;
            }
            state.client_cmd = cmd;


            const clientProc = await exec(cmd, {cwd: '.', stdio: ['ignore', 'pipe', process.stderr]});
            if (!clientProc || !clientProc.stdout) {
                return {
                    name: client.id,
                    error: `Error running client with cmd: ${cmd}`
                };
            }
            state.live_clients++;
            info(`Started client #${state.live_clients}, pid=${clientProc.pid}: ${cmd}`);
            clientProc.stdout.on('data', (data) => {
                try {
                    clientStdouts.push(data);
                    // processClientOutput(JSON.parse(data || {}), state);
                } catch (ex) {
                    info(`Error parsing data from client, skipping. Ex=${ex}. Data=${data}`);
                }

            });

            clientProc.on('close', (code) => {
                state.live_clients--;
                info(`Closing client. Stdout has ${clientStdouts.length} parts`);
                const data = clientStdouts.join('');
                processClientOutput(JSON.parse(data || {}), state);
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

function calcClientTimeout(durationSec, clientTimeoutSec, startTime) {
    const now = new Date();
    const remainingDuration = Math.floor((durationSec*1000 - (now-startTime))/1000);
    const clientTimeout = Math.min(remainingDuration, clientTimeoutSec);
    debug(`calcClientTimeout(): duration_sec=${durationSec} start_time=${startTime}, client_timeout=${clientTimeout}`);
    return clientTimeout;
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


// TODO: Refactor to a reducer and write tests

function processClientOutput(clientOutput, state) {
    console.log(JSON.stringify(clientOutput));
    clientOutput.transactions = clientOutput.transactions || [];
    clientOutput.txResultTypes = clientOutput.txResultTypes || {};
    _.forEach(clientOutput.txDurations, dur => { all_tx.hdr.recordValue(dur); });
    state.summary.total_tx_count += clientOutput.totalTransactions;
    state.summary.err_tx_count += clientOutput.errorTransactions;
    _.forEach(clientOutput.txResultTypes, (v,k) => {
        const idx = state.summary.tx_result_types.findIndex(x => x.name === k);
        if (idx === -1) {
            state.summary.tx_result_types.push({name: k, count: v});
        } else {
            state.summary.tx_result_types[idx].count += v;
        }
    });
    // state.summary.tx_result_types = clientOutput.txResultTypes;
    const totalDurPerClient = _.reduce(clientOutput.txDurations, (acc, val) => acc + val, 0);
    state.summary.total_dur += totalDurPerClient;
    state.summary.semantic_version = clientOutput.semanticVersion;
    state.summary.commit_hash = clientOutput.commitHash;
    state.summary.avg_service_time_ms = Math.floor(all_tx.hdr.getMean()||0);
    state.summary.median_service_time_ms = all_tx.hdr.getValueAtPercentile(50);
    state.summary.p90_service_time_ms = all_tx.hdr.getValueAtPercentile(90);
    state.summary.p95_service_time_ms = all_tx.hdr.getValueAtPercentile(95);
    state.summary.p99_service_time_ms = all_tx.hdr.getValueAtPercentile(99);
    state.summary.max_service_time_ms = all_tx.hdr.maxValue;
    state.summary.stddev_service_time_ms = Math.floor(all_tx.hdr.getStdDeviation()||0);
    state.summary.total_count = all_tx.hdr.getTotalCount();

    info(`Client completed, total duration of ${clientOutput.transactions.length} transactions: ${totalDurPerClient}`);

}

module.exports = {
    startClientContainers: startClientContainers,
};