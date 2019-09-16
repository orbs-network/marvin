const { parseCommandLineArgs } = require('./lib/main/cli')
const { enduranceLoop } = require('./lib/main/loop')

const props = parseCommandLineArgs(process.argv)

if (props.runName.length === 0) {
    console.log('Cannot start endurance test without a run name')
    process.exit(999)
}

enduranceLoop({})