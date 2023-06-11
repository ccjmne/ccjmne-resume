<img src="./src/assets/ccjmne-logo.svg" alt="ccjmne-logo" width="200"/>

# ccjmne-resume

[![Compile and Publish Resume](https://github.com/ccjmne/ccjmne-resume/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/ccjmne/ccjmne-resume/actions/workflows/build-deploy.yml)

This project lets me build my current static one-page resume.

Take a look at it [here](https://ccjmne.github.io/ccjmne-resume).

## Inside the Box

This generates a simple HTML page, printed out to PDF with [Puppeteer](https://github.com/GoogleChrome/puppeteer).

Technologies used:

- [Puppeteer](https://github.com/GoogleChrome/puppeteer)
- [Webpack](https://webpack.js.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Sass](https://sass-lang.com/)
- [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [NodeJS](https://nodejs.org/en/)

## How-To

Development merely uses the standard [NodeJS](https://nodejs.org/en/) process (using `npm`);<br />
Publication is automated through [Continuous Deployment](https://www.atlassian.com/continuous-delivery/continuous-deployment), leverating [GitHub Actions](https://docs.github.com/en/actions).

### Set up

Install with `npm install`.

### Build

Continuously watch-rebuild with `npm run start:dev` (or `webpack serve --mode development`) during development;<br />
Perform a one-off compilation with `npm run compile:pdf` (or `webpack --mode production`).

The PDF output (and the pre-compiled HTML-CSS-JS assets in dev. mode) will be generated under `dist/`.

### Deploy

There is nothing to do, this process is automated.

With each newly published release on GitHub,
1. a [GitHub Action](https://docs.github.com/en/actions) will use [Webpack](https://webpack.js.org/) to:
   - compile and generate the static HTML webpage,
   - print it out to PDF through my own [PDF-Printer Webpack Plugin](./tooling/pdf-printer-plugin.ts) (using [Puppeteer](https://github.com/GoogleChrome/puppeteer)),
   - create and upload the generated resume as as [GitHub Artifact](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
2. a subsequent job will:
   - retrieve the compiled artifact,
   - generate a stripped-down `index.html` that merely sets up an [HTML Meta Refresh](https://en.wikipedia.org/wiki/Meta_refresh) to the PDF resume,
   - push a new commit to the `gh-pages` branch, referencing the original commit to `master` that triggered the rebuild-redeploy
3. this commit to `gh-pages` triggers another GitHub Action that publishes my resume [here](https://ccjmne.github.io/ccjmne-resume), with [GitHub Pages](https://pages.github.com/)

## Licensing

**GPL-3.0**

You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.

Refer to the [LICENSE](./LICENSE) file for more details.
