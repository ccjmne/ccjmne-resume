import profile from 'profile.json';
import { homepage, name } from '../package.json';
import { div, EasyHTMLElement, element, elementNS, lighter, lightest, span } from './easy-htmlelement';

const { experience, identity, links, skills, education, endorsments } = profile;

function hr(height = 10, reverse = false): EasyHTMLElement {
  const [gap, d1, d2, d3] = [height / 2, height / 2, height / 2.75, height / 3.5];
  return elementNS('svg')
    .attrs({
      viewBox: `-1 -1 ${height + 2} ${height + 2}`,
      preserveAspectRatio: `${reverse ? 'xMaxYMid' : 'xMinYMid'} meet`,
      height,
    })
    .styles({ flex: '1' })
    .lighter()
    .html(`
      <g transform="translate(${height / 2} ${height / 2}) rotate(${reverse ? 180 : 0})" style="fill: none; stroke: currentColor;">
        <path
          d="M${-d1},0 l${d1},-${d1}l${d1},${d1}l-${d1},${d1}l-${d1},-${d1}z m${2 * d1},0
            m${gap},0  l${d2},-${d2}l${d2},${d2}l-${d2},${d2}l-${d2},-${d2}z m${2 * d2},0
            m${gap},0  l${d3},-${d3}l${d3},${d3}l-${d3},${d3}l-${d3},-${d3}z m${2 * d3},0">
          </path>
        <path style="shape-rendering: crispEdges;"
          d="M${-d1 + 2 * (d1 + d2 + d3) + 3 * gap},0 h999999">
        </path>
      </g>
    `);
}

function h2bg(size = 24): EasyHTMLElement {
  const [half, cols, rows] = [size / 2, 100, 5];

  // Inspired by https://stackoverflow.com/a/19303725
  const random = (function prng() {
    let seed = 2017 - 3 - 10;
    // eslint-disable-next-line no-plusplus
    return () => (r => r - Math.floor(r))(Math.sin(++seed) * 10000);
  }());

  /**
   * Generates slight variations of the given colour.
   * @param hsl A css-style hsl representation of the base colour, like: `hsl(208deg 56% 26%)`
   */
  function colour(hsl: string): string {
    const { groups: { h, s, l } } = /^hsl\((?<h>\d+)deg (?<s>\d+)% (?<l>\d+)%\)$/.exec(hsl);
    const [sat, lit] = [Number(s), Number(l)];
    return `hsl(${h}deg ${Math.floor(sat / 2 + (sat / 2) * random())}% ${Math.floor(lit + 20 * (random() - 0.5))}%)`;
  }

  /**
   * A diamond of diagonal `diag` centered around `(x, y)`.
   */
  function diamond({ x, y, diag }: { x: number, y: number, diag: number }): EasyHTMLElement {
    const d = diag / 2;
    return elementNS('path').attrs({
      transform: `translate(${x} ${y})`,
      d: `m${-d},0 l${d},-${d} l${d},${d} l${-d},${d} l${-d},${-d}z`,
    }).styles({ fill: colour('hsl(208deg 56% 26%)') });
  }

  /**
   * JS implementation of the GLSL `smoothstep` function, as described here:
   * https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/smoothstep.xhtml
   */
  const smoothstep = ((e0, e1) => (c: number) => {
    const t = Math.max(0, Math.min(1, (c - e0) / (e1 - e0))); // clamp and linear interpolation
    return t * t * (3 - 2 * t); // smoothen through cubic interpolation
  })(24, 0); // smoothly steps *down* over [0, 24]

  return elementNS('svg')
    .attrs({ viewBox: `${-size * cols} 0 ${size * cols} ${half * (rows - 1)}`, preserveAspectRatio: `xMaxYMid meet` })
    .styles({ position: 'absolute', top: 0, right: 0, height: '100%' })
    .content(...[].concat(...Array.from({ length: rows }).map(
      (_, r) => Array.from({ length: cols }).map(
        (_, c) => diamond({ x: -c * size - (r % 2) * half, y: r * half, diag: Math.max(2, size * smoothstep(c)) }),
      ),
    )));
}

document.body.append(
  element('header').content(
    element('h1').classed('name').content(identity.name.replace(/[a-z]+/g, s => String(span(s).classed('bigger-small-caps')))),
    element('h1').classed('title', 'lighter').content(identity.title),
  ),
  element('aside').classed('inverse').content(
    div().classed('links').content(
      ...[].concat(...links.map(({ icon, text, href }, row) => [
        element('img').at(`${row + 1} / 1`).attrs({ src: require(/* webpackMode: 'eager' */ `./assets/${icon}`) }),
        element('a').at(`${row + 1} / 2`).attrs({ href }).content(text),
      ])),
    ),
    div(
      element('h3').classed('hr').content('Top Skills', hr()),
      skills.join(' • '),
    ),
    div(
      element('h3').classed('hr').content('Education', hr()),
      ...education.map(({ degree, field, dates, highlight }) => div()
        .classed('education')
        .content(
          element('h4').at('degree').content(degree),
          element('h4').at('field').classed('hr').content(lightest(hr(8, true)), lighter('in '), field),
          lighter(highlight).at('highlight'),
        )),
    ),
    div(
      element('h3').classed('hr').content('Endorsments', hr()),
      ...endorsments.map(({ from, title, excerpt }) => div()
        .classed('endorsment')
        .content(
          element('h4').at('from').content(from),
          element('h4').at('title').classed('hr').content(lightest(hr(8, true)), title),
          lighter().at('excerpt').content(excerpt.replace(/\[\.\.\.\]/g, String(span().classed('ellipsis')))),
        )),
    ),
    element('small').classed('watermark').content(`Generated on ${new Date().toISOString().split(/T/)[0]}\nby [${name}](${homepage})`),
  ),
  element('main').content(
    element('h2').content('Summary', h2bg()),
    element('p').content(identity.summary),
    element('h2').content('Experience', h2bg()),
    ...experience.map(({ title, company, dates, duration, location, abstract }) => div()
      .classed('experience', abstract ? 'w-summary' : '')
      .content(
        element('h3').at('title').content(title, ' ', element('small').content(lightest('at'), ' ', lighter(company))),
        element().at('when').content(`${dates} (${duration})`),
        element().at('where').content(location),
        abstract ? element('p').at('summary').content(abstract) : '',
      )),
  ),
);
