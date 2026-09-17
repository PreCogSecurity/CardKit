// Unit tests for cardkit/card/page.js.
//
// The page card depends on the box/list/mini/form cards and on the template
// modules generated at build time by grunt-furnace; all templates are stubbed.
'use strict';

var path = require('path');
var expect = require('chai').expect;
var amd = require('./support/amd').createLoader();

var darkdomComponents = [];

function darkdomStub(opts) {
    var component = {
        _opts: opts,
        // The real darkdom `contain` merges part factories into the
        // component; mirror that so multiple contain() calls accumulate.
        contain: function(parts) {
            component._contained = component._contained || {};
            Object.keys(parts).forEach(function(key) {
                component._contained[key] = parts[key];
            });
            return component;
        },
        response: function() {
            return component;
        },
        forward: function() {
            return component;
        }
    };
    darkdomComponents.push(component);
    return component;
}
darkdomStub.getDarkByCustomId = function() {
    return [];
};
darkdomStub.getDarkById = function() {
    return [];
};

amd.define('darkdom', [], function() {
    return darkdomStub;
});

amd.define('mo/lang/mix', [], function() {
    return {
        copy: function(obj) {
            var out = {};
            Object.keys(obj).forEach(function(key) {
                out[key] = obj[key];
            });
            return out;
        }
    };
});

amd.define('mo/template/micro', [], function() {
    return {
        convertTpl: function() {
            return function(data) {
                return '<div></div>';
            };
        }
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

amd.define('dollar', [], function() {
    return function() {
        return {
            text: function() {
                return '';
            },
            val: function() {
                return '';
            }
        };
    };
});

amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'error.js'),
    'cardkit/error'
);
amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'helper.js'),
    'cardkit/helper'
);

// Template modules are generated at build time; stub them all.
[
    'page', 'page/title', 'page/nav', 'page/banner', 'page/actionbar',
    'page/actionbar/action',
    'box', 'box/content', 'box/collect',
    'list', 'mini',
    'form', 'form/item', 'form/title', 'form/content',
    'scaffold/hd', 'scaffold/hd_opt', 'scaffold/ft', 'scaffold/hdwrap',
    'item', 'item/title', 'item/title_prefix', 'item/title_suffix',
    'item/title_tag', 'item/icon', 'item/desc', 'item/info', 'item/opt',
    'item/content', 'item/meta', 'item/author', 'item/author_prefix',
    'item/author_suffix', 'item/avatar', 'item/author_desc',
    'item/author_info', 'item/author_meta'
].forEach(function(tpl) {
    amd.define('cardkit/tpl/' + tpl, [], function() {
        return { template: 'tpl:' + tpl };
    });
});

// Load the card modules in dependency order.
amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'card', 'common', 'scaffold.js'),
    'cardkit/card/common/scaffold'
);
// Load the card modules in dependency order (list/mini depend on item).
['item', 'box', 'list', 'mini', 'form'].forEach(function(name) {
    amd.loadFile(
        path.join(__dirname, '..', 'cardkit', 'card', name + '.js'),
        'cardkit/card/' + name
    );
});
var pageModule = amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'card', 'page.js'),
    'cardkit/card/page'
);

describe('cardkit/card/page', function() {

    beforeEach(function() {
        darkdomComponents.length = 0;
    });

    describe('page()', function() {
        it('contains the page parts and the card components', function() {
            pageModule.page();
            var page = darkdomComponents[darkdomComponents.length - 1];
            expect(page._contained).to.include.keys(
                'title', 'nav', 'banner', 'actionbar', 'blank', 'footer',
                'box', 'list', 'mini', 'form'
            );
            expect(page._contained).to.not.include.keys('page');
        });

        it('throws a CkError when component data is missing', function() {
            pageModule.page();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var CkError = amd.require('cardkit/error');
            expect(function() {
                render({});
            }).to.throw(CkError, /missing component data/);
        });

        it('computes hasHeader and isBlank for the page template', function() {
            pageModule.page();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var data = {
                component: { title: true },
                content: '  '
            };
            render(data);
            expect(data.hasHeader).to.equal(true);
            expect(data.isBlank).to.equal(true);
        });

        it('reports no header when no header parts are present', function() {
            pageModule.page();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var data = {
                component: {},
                content: 'body'
            };
            render(data);
            expect(data.hasHeader).to.equal(false);
            expect(data.isBlank).to.equal(false);
        });
    });

});