import pkg from '../package.json'

import './scss/1/1.scss'

import logo from './logo'
import profile from 'profile'

import { anchor, article, div, element, elementSVG, light, lighter, lightest, section } from './utils/easy-htmlelement'
import { hr, rhombus, titlebar } from './utils/svg-elements'

const { name, homepage } = pkg
const { experience, identity, links, skills, education, endorsments } = profile

const mask = elementSVG('mask').attrs({ id: 'main-background-mask' })

element(document.body).content(
  element('aside').cls('inverse').content(
    section('links').content(
      ...links.flatMap(({ icon, text, href }, row) => [
        // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require
        element('img').at(`${row + 1} / 1`).attrs({ src: require(/* webpackMode: 'eager' */ `src/assets/links/${icon}`) as string }),
        anchor({ text, href }).at(`${row + 1} / 2`),
      ]),
    ),
    section('top-skills').content(
      element('h2').cls('hr').content('Top Skills', hr()),
      article('top-skills').content(...skills.map(line => div(...line.flatMap(skill => [rhombus(8), skill]).slice(1)))),
    ),
    section('education').content(
      element('h2').cls('hr').content('Education', hr()),
      ...education.map(({ degree, field, highlight }) => article('education').content(
        element('h3').at('degree').content(degree),
        element('h3').at('field').cls('hr').content(lightest(hr({ height: 7, reverse: true })), lighter('in '), field),
        light(highlight).at('highlight'),
      )),
    ),
    section('endorsments').content(
      element('h2').cls('hr').content('Endorsments', hr()),
      ...endorsments.map(({ from, title, excerpt }) => article('endorsment').content(
        element('h3').at('from').cls('no-underline').content(from),
        element('h3').at('title').cls('hr').content(lightest(hr({ height: 7, reverse: true })), title),
        light().at('excerpt').content(excerpt),
      )),
    ),
    element('small').cls('watermark').content('Generated on ', element('time').content(new Date().toISOString().split(/T/)[0]), `\nby [${name}](${homepage})`),
  ),
  element('main').content(
    element('header').content(
      div(
        element('h1').cls('name').content(identity.name),
        element('h1').cls('title', 'lighter').content(identity.title),
      ),
      logo().cls('logo'),
    ),
    element('h2').content('About Me'),
    section('aboutme').content(element('p').content(identity.aboutme)),
    element('h2').content('Experience'),
    section('experience').content(
      ...experience
        .map(({ dates, ...exp }) => ({ ...exp, dates, duration: duration(dates) }))
        .map(({ title, notabene, company, dates, duration, location, abstract }) => article('experience').content(
          element('h3').at('title').content(title, ' ', element('small').cls('thin')
            .append(lighter('at'), ' ', light(company).cls('bolder'))
            .append(notabene !== undefined ? lighter(` (${notabene})`).cls('notabene') : '')),
          lighter().at('when').content(element('time').content(dates), ` (${duration})`),
          lighter().at('where').content(location),
          element('p').at('summary').content(abstract),
        )),
    ),
    elementSVG().attrs({ width: 0, height: 0 }).content(elementSVG('defs').content(mask)),
  ),
)

document.fonts.ready.then(() => mask.content(
  elementSVG('rect').attrs({ x: 0, y: 0, width: 9999, height: 9999, fill: '#fff' }),
  ...([...document.querySelectorAll('main h2')] as HTMLElement[]).map(({ offsetHeight, offsetTop }, i) => titlebar({
    seed: i ? 42 : 0x1990_05_15 - 0x2017_3_10,
    x:    260,
    y:    offsetTop,
    h:    offsetHeight,
  })),
))

function duration(dates: string): string {
  const [from, to] = dates.split(/\s*–\s*/).map(s => /^present$/i.test(s) ? new Date() : new Date(s)).map(d => d.getFullYear() * 12 + d.getMonth())
  return ([['year', Math.floor((to - from + 1) / 12)], ['month', (to - from + 1) % 12]] as const)
    .filter(([, n]) => n).map(([s, n]) => `${n} ${s}${n > 1 ? 's' : ''}`).join(', ')
}
