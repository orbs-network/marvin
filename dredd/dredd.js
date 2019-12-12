"use strict";

function passed(res) {

    if (res.error && res.error.length>0) {
        return false;
    }

    return true;
}

module.exports = {
    passed: passed,
};