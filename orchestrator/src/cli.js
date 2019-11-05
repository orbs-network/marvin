'use strict';

const {info} = require('./util');

function parseCommandLineArgs(argv) {
    const props = {
        runName: '',
        outputTable: '',
        clientConfig: '',
    };

    for (let prop of argv) {
        if (prop.indexOf('-id=') !== -1) {
            props.job_id = prop.replace('-id=', '');
        }

        if (prop.indexOf('-port=') !== -1) {
            props.port = prop.replace('-port=', '');
        }

        if (prop.indexOf('-clientConfig=') !== -1) {
            props.client_config = prop.replace('-clientConfig=', '');
        }
    }
    info(`parseCommandLineArgs(): config=${JSON.stringify(props)}`);

    return props;
}

function printUsage() {
    console.log('Usage:');
    console.log('-run=<run_name> -out=<output_table> -clientConfig=<config_file>');
    console.log();
    console.log('Defaults: output_table=transactions, config_file=config/testnet-master-aws.json');
}

module.exports = {
    parseCommandLineArgs: parseCommandLineArgs,
    printUsage: printUsage,
};
