import pkg from '../package.json'

import logo from './logo'
import profile from './profile.json'
import { type RegExpWGroups } from './types'

import { anchor, article, div, element, lighter, lightest, section } from './utils/easy-htmlelement'
import { h2bg, hr, rhombus } from './utils/svg-elements'

const { name, homepage } = pkg
const { experience, identity, links, skills, education, endorsments } = profile

element(document.body).content(
  element('header').content(
    div(
      element('h1').cls('name').content(identity.name),
      element('h1').cls('title', 'lighter').content(identity.title),
    ),
    logo().cls('logo'),
  ),
  element('aside').cls('inverse').content(
    section('links').content(
      ...links.flatMap(({ icon, text, href }, row) => [
        // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require
        element('img').at(`${row + 1} / 1`).attrs({ src: require(/* webpackMode: 'eager' */ `src/assets/links/${icon}`) as string }),
        anchor({ text, href }).at(`${row + 1} / 2`),
      ]),
    ),
    section('top-skills').content(
      element('h3').cls('hr').content('Top Skills', hr()),
      article('top-skills').content(...skills.map(line => div(...line.flatMap(skill => [rhombus(8), skill]).slice(1)))),
    ),
    section('education').content(
      element('h3').cls('hr').content('Education', hr()),
      ...education.map(({ degree, field, highlight }) => article('education').content(
        element('h4').at('degree').content(degree),
        element('h4').at('field').cls('hr').content(lightest(hr(8, true)), lighter('in '), field),
        lighter(highlight).at('highlight'),
      )),
    ),
    section('endorsments').content(
      element('h3').cls('hr').content('Endorsments', hr()),
      ...endorsments.map(({ from, title, excerpt }) => article('endorsment').content(
        element('h4').at('from').content(from),
        element('h4').at('title').cls('hr').content(lightest(hr(8, true)), title),
        lighter().at('excerpt').content(excerpt),
      )),
    ),
    element('small').cls('watermark').content(`Generated on ${new Date().toISOString().split(/T/)[0]}\nby [${name}](${homepage})`),
  ),
  element('main').content(
    element('h2').content('About Me', h2bg(2017 - 3 - 10)),
    section('aboutme').content(element('p').content(identity.aboutme)),
    element('h2').content('Experience', h2bg(42)),
    section('experience').content(
      ...experience.map(({ title, notabene, company, dates, duration, location, abstract, tags }) => article('experience')
        .content(
          element('h3').at('title').content(title, ' ', element('small')
            .content(lightest('at'), ' ', lighter(company))
            .content(notabene !== undefined ? lightest(` (${String(notabene)})`) : '')),
          element().at('when').content(`${dates} (${duration})`),
          element().at('where').content(location),
          element('p').at('summary').content(
            abstract,
            element('ol').cls('tags').content(...tags
              .map(tag => (/^(?<star>\*)?(?<tag>.+)/.exec(tag) as RegExpWGroups<'star' | 'tag'>).groups)
              .map(({ tag, star }) => element('li').cls(star ? 'star' : '').content(tag))),
          ),
        )),
    ),
  ),
)
