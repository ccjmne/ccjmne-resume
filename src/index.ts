import profile, { Experience } from 'profile.json';
import { homepage, name } from '../package.json';
import { div, EasyHTMLElement, element, lighter, lightest } from './easy-htmlelement';

const { experience, identity, links } = profile;

document.body.append(
  element('header').content(
    element('h1').content(identity.name),
    element('h1').classed('title', 'lighter').content(identity.title),
  ),
  element('aside').content(
    element().content('mail: ', element('a').attrs({ href: 'mailto:ccjmne@gmail.com' }).content('ccjmne@gmail.com')),
    element('small').classed('watermark').content(
      `Generated on ${new Date().toISOString().split(/T/)[0]}`,
      element('br'),
      'by ',
      element('a').attrs({ href: homepage }).content(name),
    ),
  ),
  element('main').content(
    element('h2').content('Summary'),
    element('p').content(identity.summary.replace(/\n/, String(element('br')))),
    element('h2').content('Experience'),
    experience.map(({ title, company, dates, duration, location, abstract }: Experience): EasyHTMLElement => div()
      .classed('experience', abstract ? 'w-summary' : '')
      .content(
        element('h3').at('title').content(title, ' ', element('small').content(lightest('at'), ' ', lighter(company))),
        element().at('when').content(`${dates} (${duration})`),
        element().at('where').content(location),
        abstract ? element('p').at('summary').content(abstract.replace(/\n/, String(element('br')))) : '',
      )).join(String(div().classed('hr'))),
  ),
);
