'use strict';


const {state} = require('./src/executor-state');
const init = require('./src/init');
const {debug} = require('./src/util');

function parseCommandLineArgs(args) {
    debug(`args: ${args}`);
    if (args.length < 1) {
        console.log('Usage: {LISTENER_PORT}');
        process.exit(1);
    }
    return {
        port: parseInt(args[0]),
    };
}

async function main() {
    process.argv.splice(0, 2);
    const props = parseCommandLineArgs(process.argv);
    await init.bootstrap(props, state);
}

return main();



