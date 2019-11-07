'use strict';


const {state} = require('./src/executor-state');
const init = require('./src/init');

async function main() {

    // const {parseCommandLineArgs} = require('../orchestrator/src/cli');
    // const props = parseCommandLineArgs(process.argv);

    await init.bootstrap({}, state);
}

return main();



