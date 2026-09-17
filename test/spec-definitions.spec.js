// Smoke tests for the existing browser guard-specs in cardkit/spec/.
//
// These specs were written for a browser harness (darkdom guards + a real
// DOM). Under Node we drive them with a recording guard stub so the spec
// definitions themselves are verified: each card type watches the expected
// selector and registers the expected state/component keys. This keeps the
// specs wired into `npm test` without requiring a browser.
'use strict';

var path = require('path');
var expect = require('chai').expect;
var amd = require('./support/amd').createLoader();

// The guard specs call `$(selector, parent)` and pass the result to
// guard.watch; returning the selector string makes the calls assertable.
amd.define('dollar', [], function() {
    return function(sel) {
        return sel;
    };
});

amd.define('mo/lang', [], function() {
    return {
        merge: function() {
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

amd.define('darkdom', [], function() {
    return {
        getDarkByCustomId: function() {
            return [];
        },
        getDarkById: function() {
            return [];
        }
    };
});

amd.define('cardkit/ui', [], function() {
    return {
        component: {
            control: function() {},
            picker: function() {},
            ranger: function() {}
        },
        action: {
            updatePicker: function() {}
        }
    };
});

amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'error.js'),
    'cardkit/error'
);

// The page/list/form specs depend on the real helper module; load it with
// the stubs registered above.
amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'helper.js'),
    'cardkit/helper'
);

// Specs cross-reference each other (page -> box/list/mini/form,
// mini -> list) and the shared common/ modules. The source_* common
// modules re-export the oldspec common modules, so load oldspec first.
['scaffold', 'item'].forEach(function(name) {
    amd.loadFile(
        path.join(__dirname, '..', 'cardkit', 'oldspec', 'common', name + '.js'),
        'cardkit/oldspec/common/' + name
    );
});
['scaffold', 'source_scaffold', 'item', 'source_item'].forEach(function(name) {
    amd.loadFile(
        path.join(__dirname, '..', 'cardkit', 'spec', 'common', name + '.js'),
        'cardkit/spec/common/' + name
    );
});
['box', 'list', 'mini', 'form', 'page'].forEach(function(name) {
    amd.loadFile(
        path.join(__dirname, '..', 'cardkit', 'spec', name + '.js'),
        'cardkit/spec/' + name
    );
});

function loadSpec(name) {
    return amd.require('cardkit/spec/' + name);
}

function makeGuard() {
    var calls = {
        watch: [],
        state: [],
        component: [],
        forward: []
    };
    var guard = {
        watch: function(sel) {
            calls.watch.push(sel);
            return guard;
        },
        state: function(state) {
            calls.state.push(state);
            return guard;
        },
        component: function(component) {
            calls.component.push(component);
            return guard;
        },
        forward: function(events) {
            calls.forward.push(events);
            return guard;
        },
        source: function() {
            return guard;
        },
        _calls: calls
    };
    return guard;
}

describe('cardkit/spec (guard specs)', function() {

    it('box spec watches the box card and registers its states', function() {
        var spec = loadSpec('box');
        var guard = makeGuard();
        spec(guard, null);
        expect(guard._calls.watch[0]).to.equal('ck-card[type="box"]');
        expect(Object.keys(guard._calls.state[0])).to.have.members([
            'subtype', 'paperStyle', 'plainStyle', 'plainHdStyle', 'customClass'
        ]);
    });

    it('page spec watches the page card and registers its states', function() {
        var spec = loadSpec('page');
        var guard = makeGuard();
        spec(guard, null);
        expect(guard._calls.watch[0]).to.equal('ck-card[type="page"].unmount-page');
        expect(Object.keys(guard._calls.state[0])).to.have.members([
            'blankText', 'deck', 'isPageActive', 'isDeckActive',
            'currentDeck', 'fixedMinHeight', 'cardId'
        ]);
        expect(spec.SELECTOR).to.equal('ck-card[type="page"]');
    });

    it('list spec watches the list card and registers its states', function() {
        var spec = loadSpec('list');
        var guard = makeGuard();
        spec(guard, null);
        expect(guard._calls.watch[0]).to.equal('ck-card[type="list"]');
        expect(Object.keys(guard._calls.state[0])).to.have.members([
            'subtype', 'blankText', 'limit', 'col', 'paperStyle',
            'plainStyle', 'plainHdStyle', 'customClass'
        ]);
        expect(spec.initList).to.be.a('function');
    });

    it('mini spec watches the mini card and reuses the list spec', function() {
        var spec = loadSpec('mini');
        var guard = makeGuard();
        spec(guard, null);
        expect(guard._calls.watch[0]).to.equal('ck-card[type="mini"]');
        expect(guard._calls.state.length).to.be.above(0);
    });

    it('form spec watches the form card and registers its states', function() {
        var spec = loadSpec('form');
        var guard = makeGuard();
        spec(guard, null);
        expect(guard._calls.watch[0]).to.equal('ck-card[type="form"]');
        expect(Object.keys(guard._calls.state[0])).to.have.members([
            'subtype', 'blankText', 'plainHdStyle', 'customClass'
        ]);
        expect(spec.sourceItemSpec).to.be.a('function');
    });

});