# Contributing to CardKit

Thanks for helping out! This project is a mobile UI library written in
AMD-style JavaScript (2013-2016 era) built on DarkDOM and Moui. The guidelines
below keep the codebase consistent and the history mineable.

## Development setup

1. `npm install` — installs the Node toolchain (grunt, mocha, chai).
2. `bundle install` — installs the Ruby toolchain (compass/sass) for the
   stylesheet build.
3. `bower install` — installs the runtime dependencies (mo, dollar, darkdom,
   moui, ...) used by the build.

## Running the checks

* `npm test` — runs the mocha unit suite in `test/` (no browser needed).
* `npm run lint` — runs `grunt jshint` against `cardkit.js` and `cardkit/**`.
* `grunt` — full build (dispatch vendor deps, compile templates and Sass,
  bundle with ozma, minify into `dist/`).

## Test conventions

* New behavior ships with tests. Add a spec file under `test/` (or extend an
  existing one) in the same commit as the code it exercises.
* CardKit modules are AMD and browser-oriented. `test/support/amd.js` is a
  minimal AMD loader that evaluates a module in-process; browser-only
  dependencies are registered as stubs before the module is loaded. Follow the
  pattern in `test/helper.spec.js` or `test/item.spec.js`.
* Keep each feature or fix in its own small commit that includes the tests
  pinning the new behavior. Avoid bulk commits that mix formatting, refactors,
  and features — they hide the work.

## Error handling

* Invalid state transitions should `throw new CkError(...)` (see
  `cardkit/error.js`).
* Silent failure paths (early returns that swallow errors) should call
  `CkError.warn(...)` so problems are visible in the console without breaking
  existing callers.