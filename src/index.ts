import profile from 'profile.json';
import { homepage, name } from '../package.json';
import { div, EasyHTMLElement, element, lighter, lightest, span } from './easy-htmlelement';

const { experience, identity, links, skills, education, endorsments } = profile;

function hr(height = 10, reverse = false): EasyHTMLElement {
  const [gap, d1, d2, d3] = [height / 2, height / 2, height / 2.75, height / 3.5];
  return element('svg')
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

document.body.append(
  element('header').content(
    element('h1').content(identity.name),
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
    element('h2').content('Summary'),
    element('p').content(identity.summary),
    element('h2').content('Experience'),
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
