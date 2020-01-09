'use strict';

const { describe, it } = require('mocha');
const { expect } = require('chai');
const {sanitizeErrorMessage} = require('../src/util');

describe('jobs service', () => {
    it('should remove port from ip:port combo', () => {

        const from1 = "failed sending http post: Post http://35.161.123.97/vchains/323142232/api/v1/send-transaction: read tcp 172.17.0.2:53928->35.161.123.97:80: read: connection reset by peer";
        const from2 = "failed sending http post: Post http://35.161.123.97/vchains/323142232/api/v1/send-transaction: read tcp 172.17.0.2:44110->35.161.123.97:80: read: connection reset by peer";
        const from3 = "failed sending http post: Post http://35.161.123.97/vchains/323142232/api/v1/send-transaction: read tcp 172.17.0.2:44120->35.161.123.97:30: read: connection reset by peer";
        const expected = "failed sending http post: Post http://35.161.123.97/vchains/323142232/api/v1/send-transaction: connection reset by peer";

        expect(sanitizeErrorMessage(from1)).to.equal(expected);
        expect(sanitizeErrorMessage(from2)).to.equal(expected);
        expect(sanitizeErrorMessage(from3)).to.equal(expected);
    });
});