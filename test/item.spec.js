// Unit tests for cardkit/card/item.js.
//
// item.js is an AMD module whose template modules (cardkit/tpl/*) are generated
// at build time by grunt-furnace, so they are stubbed here. The darkdom stub
// captures the options passed to each component factory so the render logic
// can be exercised directly.
'use strict';

var path = require('path');
var expect = require('chai').expect;
var amd = require('./support/amd').createLoader();

var darkdomComponents = [];
var renderCalls = [];

function darkdomStub(opts) {
    var component = {
        _opts: opts,
        contain: function(parts) {
            component._contained = parts;
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
                renderCalls.push(data);
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

// Template modules are generated at build time; stub them all.
[
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

// The item module depends on the real helper module; load it with the
// stubs registered above.
amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'helper.js'),
    'cardkit/helper'
);

var itemModule = amd.loadFile(
    path.join(__dirname, '..', 'cardkit', 'card', 'item.js'),
    'cardkit/card/item'
);

describe('cardkit/card/item', function() {

    beforeEach(function() {
        darkdomComponents.length = 0;
        renderCalls.length = 0;
    });

    describe('component factories', function() {
        it('creates a unique title component', function() {
            itemModule.title();
            var component = darkdomComponents[darkdomComponents.length - 1];
            expect(component._opts.unique).to.equal(true);
            expect(component._opts.enableSource).to.equal(true);
        });

        it('creates a source-as-content desc component', function() {
            itemModule.desc();
            var component = darkdomComponents[darkdomComponents.length - 1];
            expect(component._opts.sourceAsContent).to.equal(true);
        });

        it('creates a link-aware titleLink component', function() {
            itemModule.titleLink();
            var component = darkdomComponents[darkdomComponents.length - 1];
            expect(component._opts.render).to.be.a('function');
        });
    });

    describe('item()', function() {
        it('contains every part except item itself', function() {
            var item = itemModule.item();
            expect(item._contained).to.include.keys(
                'title', 'titleLink', 'icon', 'desc', 'content', 'author'
            );
            expect(item._contained).to.not.include.keys('item');
        });

        it('prefers componentData over state for the item link', function() {
            itemModule.item();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var data = {
                state: { link: '/from-state', linkTarget: '_self' },
                component: { title: true },
                componentData: {
                    title: {
                        state: { link: '/from-component', linkTarget: '_blank', isAlone: false }
                    }
                },
                content: 'hello'
            };
            render(data);
            expect(data.itemLink).to.equal('/from-component');
            expect(data.itemLinkTarget).to.equal('_blank');
            // isItemLinkAlone is computed with `||`, so only truthy values
            // survive; a falsy componentData value does not override state.
            expect(data.isItemLinkAlone).to.equal(undefined);
            expect(data.itemContent).to.equal(true);
        });

        it('falls back to state when componentData has no link', function() {
            itemModule.item();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var data = {
                state: { link: '/from-state', linkTarget: '_self', isAlone: true },
                component: { title: true },
                componentData: { title: { state: {} } },
                content: 'hello'
            };
            render(data);
            expect(data.itemLink).to.equal('/from-state');
            expect(data.itemLinkTarget).to.equal('_self');
            expect(data.isItemLinkAlone).to.equal(true);
        });

        it('uses titleLink when present', function() {
            itemModule.item();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var titleLink = { state: { link: '/link', linkTarget: '_blank', isAlone: true } };
            var data = {
                state: {},
                component: { titleLink: titleLink },
                componentData: { titleLink: titleLink },
                content: 'hello'
            };
            render(data);
            expect(data.itemLink).to.equal(titleLink);
            expect(data.itemLinkTarget).to.equal('_blank');
            expect(data.isItemLinkAlone).to.equal(true);
        });

        it('uses content as itemContent when no title part exists', function() {
            itemModule.item();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var data = {
                state: {},
                component: {},
                componentData: {},
                content: 'plain content'
            };
            render(data);
            expect(data.itemContent).to.equal('plain content');
        });

        it('resolves author link and target from authorLink', function() {
            itemModule.item();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var authorLink = { state: { link: '/author', linkTarget: '_blank' } };
            var data = {
                state: {},
                component: { authorLink: authorLink },
                componentData: { authorLink: authorLink },
                content: 'x'
            };
            render(data);
            expect(data.authorLink).to.equal(authorLink);
            expect(data.authorLinkTarget).to.equal('_blank');
        });

        it('resolves author link from the author part when present', function() {
            itemModule.item();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var data = {
                state: {},
                component: { author: true },
                componentData: {
                    author: { state: { link: '/author-part' } }
                },
                content: 'x'
            };
            render(data);
            expect(data.authorLink).to.equal('/author-part');
        });

        it('passes the final data through to the item template', function() {
            itemModule.item();
            var render = darkdomComponents[darkdomComponents.length - 1]._opts.render;
            var data = {
                state: { link: '/a' },
                component: { title: true },
                componentData: { title: {} },
                content: 'hello'
            };
            render(data);
            expect(renderCalls).to.have.length(1);
            expect(renderCalls[0]).to.equal(data);
        });
    });

});