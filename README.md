# ccjmne/resume

[![Compile and Publish Resume](https://github.com/ccjmne/ccjmne-resume/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/ccjmne/ccjmne-resume/actions/workflows/build-deploy.yml)

This project lets me build my current static resume.  
Find it at [ccjmne.github.io/resume](https://ccjmne.github.io/resume) or [ccjmne.sh/resume](https://ccjmne.sh/resume).

## Inside the Box

This generates some HTML pages, printed out to PDF with [Puppeteer](https://github.com/GoogleChrome/puppeteer).

Technologies used:

- [Puppeteer](https://github.com/GoogleChrome/puppeteer)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Sass](https://sass-lang.com/)
- [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [NodeJS](https://nodejs.org/en/)

## How-To

Packaged as a fairly standard [NodeJS](https://nodejs.org/en/) process (using `pnpm`);  
Published automatically through [Continuous Deployment](https://www.atlassian.com/continuous-delivery/continuous-deployment), leveraging [GitHub Actions](https://docs.github.com/en/actions).

### Set up

Install with `pnpm install`.

### Build

Continuously watch-rebuild with `pnpm start` (or `pnpm dlx vite`) during development;  
Perform a one-off compilation with `pnpm run build` (or `pnpm dlx vite build`).

The output (and the intermediary HTML-CSS-JS assets) will be generated under `dist/`.

#### Build Options

The following environment variables can be set to customise the build:

- `HYPHENATE`
  - whether to automatically insert
    [soft-hyphens](https://en.wikipedia.org/wiki/Soft_hyphen) wherever
    applicable
  - enabled with any value starting with `y`; defaults to `no`
  - disabled by default with `production` builds, for having `&shy;` littered
    throughout each and every word isn't quite SEO-friendly, and might even
    throw off [ATS](https://en.wikipedia.org/wiki/Applicant_tracking_system)es

- `OUTPUT`
  - the name of the output file, defaults to `ccjmne-resume.pdf`
  - generate screenshot if output ends in `.png`; otherwise coerce extension to `.pdf`

- `BROWSER_KEEPALIVE`
  - how long to keep the spawned browser instance alive (for successive reprints), in milliseconds
  - defaults to `30000` (30 seconds) in development mode, and `0` in production

- `BROWSER_EXECUTABLE`
  - the path to the Chromium executable to use
  - if unspecified, it'll use the first of these found on your `$PATH`:
    - `chrome-headless-shell`
    - `chromium`
    - `chromium-browser`
    - `google-chrome-stable`
    - `google-chrome`

### Deploy

There is nothing to do, this process is automated.

With each newly published release on GitHub, [GitHub Action](https://docs.github.com/en/actions) pipeline will:

1. check out the repository,
2. install its dependencies if not cached already,
3. verify adequate hyphenation by generating and comparing two screenshots:
    - *with*     automated soft-hyphenation for the `en-GB` locale
    - *without*  the above
4. generate the PDF document, and
5. publish it with [GitHub Pages](https://pages.github.com/) at [ccjmne.github.io/resume](https://ccjmne.github.io/resume) and [ccjmne.sh/resume](https://ccjmne.sh/resume).

## Licensing

**GPL-3.0**

You may copy, distribute and modify the software as long as you track
changes/dates in source files. Any modifications to or software including (via
compiler) GPL-licensed code must also be made available under the GPL along with
build & install instructions.

Refer to the [LICENSE](./LICENSE) file for more details.
