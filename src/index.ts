import profile from 'profile.json';
import { homepage, name } from '../package.json';
import { div, element, lighter, lightest, span } from './utils/easy-htmlelement';
import { h2bg, hr } from './utils/svg-elements';

const { experience, identity, links, skills, education, endorsments } = profile;

document.body.append(
  element('header').content(
    element('h1').classed('name').content(identity.name.replace(/[a-z]+/g, s => String(span(s).classed('bigger-small-caps')))),
    element('h1').classed('title', 'lighter').content(identity.title),
  ),
  element('aside').classed('inverse').content(
    div().classed('links').content(
      ...[].concat(...links.map(({ icon, text, href }, row) => [
        // eslint-disable-next-line
        element('img').at(`${row + 1} / 1`).attrs({ src: require( /* webpackMode: 'eager' */ `./assets/${icon}`) }),
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
