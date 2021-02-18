import profile from 'profile.json';
import { homepage, name } from '../package.json';
import { div, EasyHTMLElement, element, lighter, lightest } from './easy-htmlelement';

const { experience, identity, links } = profile;

document.body.append(
  element('header').content(
    element('h1').content(identity.name),
    element('h1').classed('title', 'lighter').content(identity.title),
  ),
  element('aside').classed('inverse').content(
    div().classed('links').content(
      ...[].concat(...links.map(({ icon, text, href }, row) => [
        element('img').at(`${row + 1} / 1`).attrs({ src: require(/* webpackMode: 'eager' */ `./assets/${icon}`).default }),
        element('a').at(`${row + 1} / 2`).attrs({ href }).content(text),
      ])),
    ),
    div(
      element('h3').classed('hr-d').content('Top Skills', hr()),
      skills.join(' • '),
    ),
    element('small').classed('watermark').content(`Generated on ${new Date().toISOString().split(/T/)[0]}\nby [${name}](${homepage})`),
  ),
  element('main').content(
    element('h2').content('Summary'),
    element('p').content(identity.summary),
    element('h2').content('Experience'),
    experience.map(({ title, company, dates, duration, location, abstract }) => div()
      .classed('experience', abstract ? 'w-summary' : '')
      .content(
        element('h3').at('title').content(title, ' ', element('small').content(lightest('at'), ' ', lighter(company))),
        element().at('when').content(`${dates} (${duration})`),
        element().at('where').content(location),
        abstract ? element('p').at('summary').content(abstract) : '',
      )).join(String(div().classed('hr'))),
  ),
);
