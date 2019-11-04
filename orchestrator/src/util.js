const verbosity = process.env.VERBOSE === 'true';

function info() {
    if (verbosity) {
        console.log.apply(this, arguments)
    }
}

function generateJobId() {
    const dateStr = new Date().toISOString();
    const randomSuffix = zeroPad(Math.floor(Math.random() * 100), 3);
    return `${dateStr}_${randomSuffix}`;
}

function zeroPad(num, places) {
    return String(num).padStart(places, '0')
}

module.exports = {
    info: info,
    generateJobId: generateJobId,
};