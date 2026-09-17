<!---
layout: intro
title: CardKit
-->

# CardKit (v2)

CardKit is a mobile UI library provides a series of building blocks to help you build mobile web apps quickly and simply, or transfer entire website to mobile-first web app for touch devices.

CardKit building blocks are all _use-html-as-configure-style_ (like Custom Elements, directive...) components built on [DarkDOM](https://github.com/dexteryy/DarkDOM) and [Moui](https://github.com/dexteryy/moui).

## Architecture

CardKit is written as AMD modules (ozjs/requirejs-style) and built with grunt.

* `cardkit.js` — the top-level API: `init()`, `openPage()`, `component()`, `render()`, page/deck management and the hash-based navigation glue.
* `cardkit/card/` — the DarkDOM component factories: `page`, `box`, `list`, `mini`, `form`, `item` and the shared `common/scaffold`. Each factory returns a DarkDOM component configured with a render function and its contained parts.
* `cardkit/spec/` — guard specs that wire each card type to its DOM selector, states and events; `cardkit/spec.js` maps spec names to `[guard, component]` pairs.
* `cardkit/helper.js` — shared helpers (state/source/label/class readers, event forwarding, blank detection) used by the card render functions.
* `cardkit/error.js` — `CkError`, the typed error used for invalid state transitions (`throw`) and for surfacing silent failure paths (`CkError.warn`).
* `cardkit/ui.js` — the UI action/component registry (controls, pickers, rangers, modal card) mixed into the top-level API.
* `tpl/cardkit/` — the HTML templates, compiled to AMD modules under `cardkit/tpl/` at build time by grunt-furnace.
* `scss/` — the Sass sources, compiled to `dist/css/` by compass.

The build pipeline (`grunt`) dispatches the bower vendor dependencies into `build/vendor/`, compiles templates and Sass, bundles with ozma and minifies into `dist/`.

## Usages and Examples

* [Components Gallery App](http://dexteryy.github.io/cardkit-demo-gallery)
* [To-do App](https://github.com/dexteryy/cardkit-demo-todoapp)
* [Custom DarkDOM Components](https://github.com/dexteryy/cardkit-demo-darkdom)

## References

* Presentation in QCon Beijing 2014 (in Chinese): [slides + transcript](http://www.douban.com/note/347692465/)

### In the Real World

![douban apps](http://dexteryy.github.io/cardkit-demo-gallery/screenshot/doubanapp.png)

## Installation

Install via bower:

```
bower install cardkit
```

Or download directly:

* Packaged version without dependencies  
  [cardkit.js](https://github.com/dexteryy/CardKit/blob/master/dist/cardkit.js)  
  [cardkit.min.js](https://github.com/dexteryy/CardKit/blob/master/dist/cardkit.min.js)  
* Packaged version with dependencies  
  [cardkit-standalone.js](https://github.com/dexteryy/CardKit/blob/master/dist/cardkit-standalone.js)  
  [cardkit-standalone.min.js](https://github.com/dexteryy/CardKit/blob/master/dist/cardkit-standalone.min.js)

## Quick Start for building

### Building with Docker (recommended)

A `Dockerfile` and `docker-compose.yml` are committed at the repo root. They
install Node, Ruby/bundler, bower and all dependencies non-interactively:

```
docker compose up
```

This runs the full `grunt` build against a clean checkout. Note that the
2013-era imagemin toolchain (jpegtran-bin / optipng-bin) cannot download its
native binaries on modern Node, so the `imagemin` step is skipped inside the
container; everything else (templates, Sass, ozma bundling, minification)
builds normally.

### Building manually

#### Prepare the environment

1. node, npm
2. [grunt v0.4](http://gruntjs.com/getting-started) - `npm install grunt-cli -g`
3. [bower v0.10.0+](http://bower.io/) - `npm install bower -g`
4. ruby, gem, [bundler](http://gembundler.com/)

#### Install dependencies

1. `npm install`
2. `bundle install`
3. `bower install`

#### The first build

1. `grunt`

## Development

* `npm test` — runs the mocha unit suite in `test/` (no browser needed).
* `npm run lint` — runs `grunt jshint` against `cardkit.js` and `cardkit/**`.
* `grunt` — full build (see "Quick Start for building" above).

See [CONTRIBUTING.md](CONTRIBUTING.md) for conventions and the test setup.

## License

Copyright (c) 2013-2014 douban.com
Licensed under the MIT license.
