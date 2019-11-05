'use strict';


const {config} = require('./src/state');
const init = require('./src/init');

async function main() {

    // const {parseCommandLineArgs} = require('../orchestrator/src/cli');
    // const props = parseCommandLineArgs(process.argv);

    await init.bootstrap({}, config);
}

return main();



