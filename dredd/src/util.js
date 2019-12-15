'use strict';

const verbosity = process.env.VERBOSE === 'true';

function info() {
    if (verbosity) {
        console.log.apply(this, arguments);
    }
}

module.exports = {
    info: info,
};