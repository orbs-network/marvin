const {info} = require('./util');

function parseCommandLineArgs(argv) {
    const props = {
        runName: '',
        outputTable: '',
        clientConfig: '',
    };

    for (const k in argv) {
        if (argv[k].indexOf('-run=') !== -1) {
            props.runName = argv[k].replace('-run=', '');
        }

        if (argv[k].indexOf('-out=') !== -1) {
            props.outputTable = argv[k].replace('-out=', '');
        }

        if (argv[k].indexOf('-clientConfig=') !== -1) {
            props.clientConfig = argv[k].replace('-clientConfig=', '');
        }
    }
    info('config=' + props.clientConfig);

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
