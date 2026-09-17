// Unit tests for cardkit/error.js (CkError).
'use strict';

var path = require('path');
var expect = require('chai').expect;
var amd = require('./support/amd').createLoader();

var CkError = amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'error.js'),
    'cardkit/error'
);

describe('cardkit/error', function() {

    describe('CkError', function() {
        it('is an Error with a CkError name', function() {
            var err = new CkError('boom');
            expect(err).to.be.an.instanceof(Error);
            expect(err).to.be.an.instanceof(CkError);
            expect(err.name).to.equal('CkError');
            expect(err.message).to.equal('boom');
        });

        it('defaults the message to an empty string', function() {
            var err = new CkError();
            expect(err.message).to.equal('');
        });

        it('is throwable and catchable', function() {
            var caught;
            try {
                throw new CkError('invalid state transition');
            } catch (e) {
                caught = e;
            }
            expect(caught).to.be.an.instanceof(CkError);
            expect(caught.message).to.equal('invalid state transition');
        });
    });

    describe('CkError.warn', function() {
        var originalWarn;

        beforeEach(function() {
            originalWarn = console.warn;
        });

        afterEach(function() {
            console.warn = originalWarn;
        });

        it('logs a prefixed warning via console.warn', function() {
            var messages = [];
            console.warn = function(msg) {
                messages.push(msg);
            };
            CkError.warn('page not found');
            expect(messages).to.deep.equal(['[CardKit] page not found']);
        });
    });

});