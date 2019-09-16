function parseCommandLineArgs(argv) {
    const props = {
        runName: ''
    };

    for (k in argv) {
        if (argv[k].indexOf('-run=') !== -1) {
            props.runName = argv[k].replace('-run=', '');
        }
    }

    return props;
}

module.exports = {
    parseCommandLineArgs,
};
