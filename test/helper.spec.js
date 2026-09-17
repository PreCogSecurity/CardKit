// Unit tests for cardkit/helper.js.
//
// helper.js is an AMD module that depends on browser libraries (dollar,
// darkdom, mo/lang, cardkit/ui). Those are replaced with focused stubs so the
// module's pure logic can be exercised under Node.
'use strict';

var path = require('path');
var expect = require('chai').expect;
var amd = require('./support/amd').createLoader();

var dollarBehavior = {
    text: 'label-text',
    val: 'label-val'
};

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

amd.define('dollar', [], function() {
    return function() {
        return {
            text: function() {
                return dollarBehavior.text;
            },
            val: function() {
                return dollarBehavior.val;
            }
        };
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

var helper = amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'helper.js'),
    'cardkit/helper'
);

describe('cardkit/helper', function() {

    function makeSpy() {
        var calls = [];
        return {
            forward: function(map) {
                calls.push(map);
                return this;
            },
            calls: calls
        };
    }

    describe('readState', function() {
        it('reads a state value from data', function() {
            expect(helper.readState({ state: { link: '/a' } }, 'link'))
                .to.equal('/a');
        });

        it('returns undefined for missing data or state', function() {
            expect(helper.readState(null, 'link')).to.equal(null);
            expect(helper.readState({}, 'link')).to.equal(undefined);
            expect(helper.readState({ state: {} }, 'link')).to.equal(undefined);
        });
    });

    describe('readSource', function() {
        it('prefixes the source data attribute with a dot', function() {
            expect(helper.readSource({
                data: function() {
                    return 'source-list';
                }
            })).to.equal('.source-list');
        });

        it('returns undefined when no source is set', function() {
            expect(helper.readSource({
                data: function() {
                    return undefined;
                }
            })).to.equal(undefined);
        });
    });

    describe('readLabel', function() {
        it('reads text from the node referenced by the label data', function() {
            var node = {
                data: function() {
                    return 'span.ck-label';
                },
                find: function() {
                    return [{ tagName: 'SPAN' }];
                }
            };
            expect(helper.readLabel(node)).to.equal('label-text');
        });

        it('falls back to the node itself when no label is set', function() {
            var node = {
                data: function() {
                    return undefined;
                }
            };
            expect(helper.readLabel(node)).to.equal('label-text');
        });

        it('falls back to val when text is empty', function() {
            dollarBehavior.text = '';
            dollarBehavior.val = 'input-val';
            try {
                expect(helper.readLabel({ data: function() { return undefined; } }))
                    .to.equal('input-val');
            } finally {
                dollarBehavior.text = 'label-text';
                dollarBehavior.val = 'label-val';
            }
        });
    });

    describe('readClass', function() {
        it('drops ckd- prefixed classes', function() {
            var node = {
                0: { className: 'ckd-item ckd-title foo bar' }
            };
            expect(helper.readClass(node)).to.equal('foo bar');
        });

        it('returns an empty string for ckd-only classes', function() {
            var node = {
                0: { className: 'ckd-item' }
            };
            expect(helper.readClass(node)).to.equal('');
        });
    });

    describe('isBlank', function() {
        it('treats empty, whitespace-only and null content as blank', function() {
            expect(helper.isBlank('')).to.equal(true);
            expect(helper.isBlank('   \n\t ')).to.equal(true);
            expect(helper.isBlank(null)).to.equal(true);
            expect(helper.isBlank(undefined)).to.equal(true);
        });

        it('treats non-whitespace content as non-blank', function() {
            expect(helper.isBlank('hello')).to.equal(false);
            expect(helper.isBlank('  x  ')).to.equal(false);
        });
    });

    describe('event forwarding registration', function() {
        it('forwardStateEvents registers control/picker/ranger events', function() {
            var component = makeSpy();
            helper.forwardStateEvents(component);
            expect(component.calls).to.have.length(1);
            expect(component.calls[0]).to.include.keys(
                'control:enable *',
                'picker:change *',
                'ranger:changed *'
            );
        });

        it('applyStateEvents registers the apply handlers', function() {
            var guard = makeSpy();
            helper.applyStateEvents(guard);
            expect(guard.calls).to.have.length(1);
            expect(guard.calls[0]).to.include.keys(
                'control:enable',
                'control:disable',
                'picker:change'
            );
        });

        it('forwardActionEvents registers top action events', function() {
            var component = makeSpy();
            helper.forwardActionEvents(component);
            expect(component.calls).to.have.length(1);
            expect(component.calls[0]).to.include.keys(
                'control:enable .ck-top-act > *',
                'actionView:confirm .ck-top-overflow'
            );
        });

        it('applyActionEvents registers the top action handlers', function() {
            var guard = makeSpy();
            helper.applyActionEvents(guard);
            expect(guard.calls).to.have.length(1);
            expect(guard.calls[0]).to.include.keys(
                'topOverflow:confirm',
                'topControl:enable',
                'topControl:disable'
            );
        });

        it('forwardInputEvents registers select/input/textarea changes', function() {
            var component = makeSpy();
            helper.forwardInputEvents(component);
            expect(component.calls).to.have.length(1);
            expect(component.calls[0]).to.include.keys(
                'change select',
                'change input',
                'change textarea'
            );
        });

        it('applyInputEvents registers the input handlers', function() {
            var guard = makeSpy();
            helper.applyInputEvents(guard);
            expect(guard.calls).to.have.length(1);
            expect(guard.calls[0]).to.include.keys(
                'select:change',
                'input:change'
            );
        });
    });

    describe('find_dark handlers', function() {
        var originalWarn;

        beforeEach(function() {
            originalWarn = console.warn;
        });

        afterEach(function() {
            console.warn = originalWarn;
        });

        it('warns when an event id has no registered dark component', function() {
            var guard = makeSpy();
            helper.applyStateEvents(guard);
            var handler = guard.calls[0]['control:enable'];
            var messages = [];
            console.warn = function(msg) {
                messages.push(msg);
            };
            handler({ target: { id: 'ghost-id' } }, { updateDarkDOM: function() {} });
            expect(messages).to.have.length(1);
            expect(messages[0]).to.match(/no dark component registered for id "ghost-id"/);
        });

        it('does not warn when the event target has no id', function() {
            var guard = makeSpy();
            helper.applyStateEvents(guard);
            var handler = guard.calls[0]['control:enable'];
            var messages = [];
            console.warn = function(msg) {
                messages.push(msg);
            };
            handler({ target: {} }, { updateDarkDOM: function() {} });
            expect(messages).to.have.length(0);
        });
    });

});