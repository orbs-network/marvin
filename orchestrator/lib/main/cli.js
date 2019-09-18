function parseCommandLineArgs(argv) {
    const props = {
        runName: '',
        outputTable: '',
        clientConfig: '',
    };

    for (k in argv) {
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

    return props;
}

module.exports = {
    parseCommandLineArgs,
};
