const {exec, execSync} = require('child_process');
const {info} = require('./util');
const {state} = require('./state');

async function runClientContainers(allResults, {instances = 1, config}) {
    info(`runClientContainers(): running ${instances} instances`);
    const clients = [];
    for (let i = 0; i < instances; i++) {
        clients.push({
            id: `${config.job_id}_${state.instance_counter++}`,
        })
    }

    const clientConfigPath = config.client_config || 'config/testnet-master-aws.json';

    await Promise.all(clients.map(async (client) => {
        try {
            let cmd;
            if (config.use_mock_client) { // TODO Could be nicer
                cmd = `./src/mock-client.sh ${client.id} ${config.client_timeout_sec} 2013 10 2`
            } else {
                cmd = `docker run -t --rm endurance:client ./client ${clientConfigPath} ${client.id},${config.client_timeout_sec}`;
            }



            const clientProc = await exec(cmd, {cwd: '.', stdio: ['ignore', 'pipe', process.stderr]});
            if (!clientProc || !clientProc.stdout) {
                throw `Error running client with cmd: ${cmd}`;
            }
            ++state.live_clients;
            info(`Started client #${state.live_clients}, pid=${clientProc.pid}: ${cmd}`);
            clientProc.stdout.on('data', (data) => {
                info(`STDOUT from ${client.id}: ${data}`);
                try{
                    const jsonData = JSON.parse(data);
                    info(`jsonData=${JSON.stringify(jsonData)}`);
                    allResults.push(jsonData);

                } catch(ex) {
                    info(`Error parsing data, skipping. Data=${data}`);
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
            }
        }
    }));
}

module.exports = {
    runClientContainers: runClientContainers,
};