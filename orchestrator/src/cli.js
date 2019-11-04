const {info} = require('./util');

function parseCommandLineArgs(argv) {
    const props = {
        runName: '',
        outputTable: '',
        clientConfig: '',
    };

    for (const k in argv) {
        if (argv[k].indexOf('-id=') !== -1) {
            props.job_id = argv[k].replace('-id=', '');
        }

        if (argv[k].indexOf('-port=') !== -1) {
            props.port = argv[k].replace('-port=', '');
        }

        if (argv[k].indexOf('-clientConfig=') !== -1) {
            props.client_config = argv[k].replace('-clientConfig=', '');
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
    parseCommandLineArgs,
    printUsage,
};
