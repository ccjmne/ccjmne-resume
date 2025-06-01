import { homepage, name } from '../package.json'
import '/scss/1/1.scss'
import logo from '/logo'
import { education, endorsements, experience, identity, links, skills } from '/profile'
import { anchor, article, div, element, elementSVG, light, lighter, lightest, section } from '/utils/easy-htmlelement'
import { hr, rhombus, titlebar } from '/utils/svg-elements'

const mask = elementSVG('mask').attrs({ id: 'main-background-mask' })
const icons = import.meta.glob('/assets/links/*', { eager: true, query: '?url' }) as Record<string, { default: string }>

element(document.body).content(
  element('aside').cls('inverse').content(
    section('links').content(
      ...links.flatMap(({ icon, text, href }, row) => [
        element('img').at(`${row + 1} / 1`).attrs({ src: icons[`/assets/links/${icon}`].default }),
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
    section('endorsements').content(
      element('h2').cls('hr').content('Endorsements', hr()),
      ...endorsements.map(({ from, title, excerpt }) => article('endorsement').content(
        element('h3').at('from').cls('no-underline').content(from),
        element('h3').at('title').cls('hr').content(lightest(hr({ height: 7, reverse: true })), title),
        light().at('excerpt').content(excerpt),
      )),
    ),
    element('small').cls('watermark').content('Generated on ', element('time').content(new Date().toISOString().split(/T/)[0]), `\nby [ccjmne/${name}](${homepage})`),
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
    section('aboutme').content(...identity.aboutme.split(/\n/g).map(p => element('p').content(p))),
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
          element().at('summary').content(...abstract.split(/\n/g).map(p => element('p').content(p))),
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
