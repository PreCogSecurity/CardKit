// Minimal AMD loader used to exercise CardKit's AMD modules under Node.
//
// CardKit modules are written as anonymous `define([...], function(...){...})`
// or `define(function(require){...})` modules that were designed to run in a
// browser (via ozjs/requirejs). This shim evaluates those files in-process so
// their pure logic can be unit tested with mocha. Browser-only dependencies
// (dollar, darkdom, mo/*, ...) are registered as stubs by each spec file
// before the real module is loaded.
'use strict';

var fs = require('fs');
var path = require('path');

function createLoader() {
    var registry = {};
    var cache = {};

    // Resolve a (possibly relative) module id against the id of the
    // module that requires it, mirroring AMD's id resolution rules.
    function normalize(baseId, id) {
        if (id.charAt(0) !== '.') {
            return id;
        }
        var parts = baseId.split('/');
        parts.pop();
        id.split('/').forEach(function(seg) {
            if (seg === '.' || seg === '') {
                return;
            }
            if (seg === '..') {
                parts.pop();
            } else {
                parts.push(seg);
            }
        });
        return parts.join('/');
    }

    function define(id, deps, factory) {
        if (typeof deps === 'function') {
            factory = deps;
            deps = [];
        }
        registry[id] = {
            deps: deps,
            factory: factory
        };
    }

    function require(id) {
        if (cache[id]) {
            return cache[id].exports;
        }
        var mod = registry[id];
        if (!mod) {
            throw new Error('AMD module not registered: ' + id);
        }
        var instance = {
            id: id,
            exports: {}
        };
        cache[id] = instance;
        var args;
        if (mod.deps.length === 0 && mod.factory.length > 0) {
            // CJS-style factory: define(function(require){ ... })
            args = [function(dep) {
                return require(normalize(id, dep));
            }];
        } else {
            args = mod.deps.map(function(dep) {
                return require(normalize(id, dep));
            });
        }
        var result = mod.factory.apply(null, args);
        if (result !== undefined) {
            instance.exports = result;
        }
        return instance.exports;
    }

    // Evaluate a CardKit source file and return its module exports.
    function loadFile(filePath, id) {
        var code = fs.readFileSync(filePath, 'utf8');
        var fn = new Function('define', code);
        fn(function(first, second, third) {
            if (typeof first === 'string') {
                // Named define: define('id', deps, factory)
                define(first, second, third);
            } else {
                // Anonymous define: define(deps, factory) — the loader
                // assigns the module id from the file path.
                define(id, first, second);
            }
        });
        return require(id);
    }

    return {
        define: define,
        require: require,
        loadFile: loadFile,
        normalize: normalize
    };
}

module.exports = {
    createLoader: createLoader
};