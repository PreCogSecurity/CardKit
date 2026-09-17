// Unit tests for cardkit.js (the top-level CardKit API).
//
// cardkit.js is a browser AMD module that touches `document`, `location` and
// `window` at module scope, so those globals are stubbed before the module is
// loaded. All browser-only dependencies (mo/*, dollar, darkdom, ...) are
// replaced with focused stubs.
'use strict';

var path = require('path');
var expect = require('chai').expect;
var amd = require('./support/amd').createLoader();

var originalDocument = global.document;
var originalLocation = global.location;
var originalWindow = global.window;

// The module factory touches `document` at load time, so the browser globals
// must be in place before the file is evaluated.
global.document = { body: {} };
global.location = { href: '', replace: function() {} };
global.window = {
    scrollTo: function() {},
    innerWidth: 0,
    innerHeight: 0
};

// `$` returns an empty collection: `[0]` is undefined and `is()` is false.
function dollarStub() {
    return {
        0: undefined,
        is: function() {
            return false;
        },
        addClass: function() {
            return this;
        },
        removeClass: function() {
            return this;
        }
    };
}

amd.define('mo/lang', [], function() {
    return {
        config: function() {
            var out = {};
            Array.prototype.forEach.call(arguments, function(src) {
                if (!src) {
                    return;
                }
                Object.keys(src).forEach(function(key) {
                    out[key] = src[key];
                });
            });
            return out;
        },
        each: function(obj, fn, ctx) {
            Object.keys(obj).forEach(function(key) {
                fn.call(ctx, obj[key], key);
            });
        },
        mix: function(target) {
            Array.prototype.slice.call(arguments, 1).forEach(function(src) {
                if (!src) {
                    return;
                }
                Object.keys(src).forEach(function(key) {
                    target[key] = src[key];
                });
            });
            return target;
        }
    };
});

amd.define('dollar', [], function() {
    return dollarStub;
});

amd.define('mo/mainloop', [], function() {
    return {
        addTween: function() {
            return { run: function() {} };
        }
    };
});

amd.define('cardkit/spec', [], function() {
    return {
        page: [function() {}, { page: function() { return {}; } }]
    };
});

amd.define('cardkit/oldspec', [], function() {
    return {
        page: [function() {}, { page: function() { return {}; } }]
    };
});

amd.define('cardkit/ui', [], function() {
    return {
        init: function() {},
        action: {
            openLink: function() {}
        },
        component: {
            modalCard: {
                event: {
                    on: function() {
                        return this;
                    }
                }
            }
        }
    };
});

amd.define('cardkit/supports', [], function() {
    return {
        webview: false,
        noBugWhenFixed: true
    };
});

amd.define('cardkit/bus', [], function() {
    return {
        on: function() {},
        resolve: function() {}
    };
});

amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'error.js'),
    'cardkit/error'
);

var cardkit = amd.loadFile(
    path.join(__dirname, '..', 'cardkit.js'),
    'cardkit'
);

describe('cardkit', function() {

    after(function() {
        global.document = originalDocument;
        global.location = originalLocation;
        global.window = originalWindow;
    });

    describe('init', function() {
        it('initializes the page spec and view without throwing', function() {
            expect(function() {
                cardkit.init({});
            }).to.not.throw();
        });
    });

    describe('openPage', function() {
        var originalWarn;

        beforeEach(function() {
            originalWarn = console.warn;
        });

        afterEach(function() {
            console.warn = originalWarn;
        });

        it('warns and returns false when the page does not exist', function() {
            cardkit.init({});
            var messages = [];
            console.warn = function(msg) {
                messages.push(msg);
            };
            var result = cardkit.openPage('no-such-page');
            expect(result).to.equal(false);
            expect(messages).to.have.length(1);
            expect(messages[0]).to.match(/page not found for "no-such-page"/);
        });
    });

});