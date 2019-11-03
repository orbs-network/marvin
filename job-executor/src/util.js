const verbosity = process.env.VERBOSE === 'true';

function info() {
    if (verbosity) {
        console.log.apply(this, arguments)
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    info, sleep
};