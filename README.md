# ccjmne-resume

[![Compile and Publish Resume](https://github.com/ccjmne/ccjmne-resume/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/ccjmne/ccjmne-resume/actions/workflows/build-deploy.yml)

This project lets me build my current static one-page resume.

Get it [here](https://ccjmne.github.io/ccjmne-resume).

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

Install w/ `npm install`.

The PDF output (and the pre-compiled HTML-CSS-JS assets in dev. mode) will be generated under `/dist`.

While developing, use `npm run start:dev` (or `webpack serve --mode development`) to continuously watch-rebuild.
Perform a one-off compilation w/ `npm run compile:pdf` (or `webpack --mode production`).

## Licensing

**GPL-3.0**

You may copy, distribute and modify the software as long as you track changes/dates in source files. Any modifications to or software including (via compiler) GPL-licensed code must also be made available under the GPL along with build & install instructions.

Refer to the [LICENSE](./LICENSE) file for more details.
