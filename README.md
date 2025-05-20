# ccjmne-resume

[![Compile and Publish Resume](https://github.com/ccjmne/ccjmne-resume/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/ccjmne/ccjmne-resume/actions/workflows/build-deploy.yml)

This project lets me build my current static resume.  
See it [here](https://ccjmne.github.io/ccjmne-resume).

## Inside the Box

This generates some HTML pages, printed out to PDF with [Puppeteer](https://github.com/GoogleChrome/puppeteer).

Technologies used:

- [Puppeteer](https://github.com/GoogleChrome/puppeteer)
- [Webpack](https://webpack.js.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Sass](https://sass-lang.com/)
- [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [NodeJS](https://nodejs.org/en/)

## How-To

Development merely uses the standard [NodeJS](https://nodejs.org/en/) process (using `pnpm`);  
Publication is automated through [Continuous Deployment](https://www.atlassian.com/continuous-delivery/continuous-deployment), leveraging [GitHub Actions](https://docs.github.com/en/actions).

### Set up

Install with `pnpm install`.

### Build

Continuously watch-rebuild with `pnpm start` (or `npx webpack serve --mode
development`) during development;  
Perform a one-off compilation with `pnpm build` (or `npx webpack --mode
production`).

The output (and the pre-compiled HTML-CSS-JS assets in `development` mode) will
be generated under `dist/`.

#### Build Options

1. `HYPHENATE`
   - whether to automatically insert
     [soft-hyphens](https://en.wikipedia.org/wiki/Soft_hyphen) wherever
     applicable
   - enabled with any value starting with `y`; defaults to `no`
   - disabled by default with `production` builds, for having `&shy;` littered
     throughout each and every word isn't quite SEO-friendly, and might even
     throw off [ATS](https://en.wikipedia.org/wiki/Applicant_tracking_system)es

2. `OUTPUT`
   - the name of the output file, defaults to `ccjmne-resume.pdf`
   - generate screenshot if output ends in `.png`; otherwise coerce extension to
     `.pdf`

### Deploy

There is nothing to do, this process is automated.

With each newly published release on GitHub,

1. a [GitHub Action](https://docs.github.com/en/actions) will use
   [Webpack](https://webpack.js.org/) to:
   - compile and generate the static HTML webpage,
   - print it out to PDF through my own [PDF-Printer Webpack
     Plugin](./tooling/pdf-printer-plugin.ts),
   - ensure accurate manual hyphenation by comparing w/ automatically hyphenated version,
   - create and upload the generated resume as a [GitHub
     Artifact](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
2. a subsequent job will:
   - retrieve the compiled artefact,
   - generate a stripped-down `index.html` that merely sets up an [HTML Meta
     Refresh](https://en.wikipedia.org/wiki/Meta_refresh) to the PDF resume,
   - push a new commit to the `gh-pages` branch, referencing the original commit
     to `master` that triggered the rebuild-redeploy
3. this commit to `gh-pages` triggers another GitHub Action that publishes
   my resume [here](https://ccjmne.github.io/ccjmne-resume), with [GitHub
   Pages](https://pages.github.com/)

## Licensing

**GPL-3.0**

You may copy, distribute and modify the software as long as you track
changes/dates in source files. Any modifications to or software including (via
compiler) GPL-licensed code must also be made available under the GPL along with
build & install instructions.

Refer to the [LICENSE](./LICENSE) file for more details.
