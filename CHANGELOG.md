# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `cardkit/error.js` — `CkError`, a typed error for invalid state transitions
  and a `CkError.warn()` helper for surfacing silent failure paths.
- Mocha unit suite under `test/` (runnable via `npm test`, no browser needed),
  covering the top-level API, `cardkit/helper.js`, `cardkit/card/item.js`,
  `cardkit/card/page.js`, `cardkit/error.js` and the guard specs in
  `cardkit/spec/`.
- CI workflow (`.github/workflows/ci.yml`) that installs, lints and tests on
  every push and pull request.
- `package-lock.json` for reproducible npm installs, plus Dependabot config
  for npm and bundler.
- `Dockerfile` and `docker-compose.yml` for a reproducible build environment.
- `.nvmrc` pinning the Node version used by CI and the Docker build.
- `CONTRIBUTING.md` and this changelog.

### Changed

- `cardkit.js` `openPage()` now warns via `CkError.warn()` when a requested
  page does not exist instead of failing silently (or crashing during the
  initial-load fallback when the default page is also missing).
- `cardkit/helper.js` `find_dark` now warns when an event id has no registered
  dark component instead of silently dropping the event.
- `cardkit/card/page.js` throws a `CkError` when the page card is rendered
  without component data, and reports `hasHeader` as a boolean.
- `Gemfile`/`Gemfile.lock` now resolve gems from rubygems.org (the previous
  `ruby.taobao.org` mirror is defunct).
- `package.json` engines updated to `>= 18` to match the toolchain required by
  the test suite.

### Fixed

- The initial-load fallback in `openPage()` no longer throws a `TypeError`
  when neither the requested page nor the default page exists in the DOM.