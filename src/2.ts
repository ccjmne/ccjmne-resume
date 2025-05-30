import type EasyHTMLElement from './utils/easy-htmlelement'
import qrcode from 'qrcode'

import pkg from '../package.json'
import { highlights, techstack, timeline } from './profile'
import { article, div, element, elementSVG, light, lighter, lightest, section, span } from './utils/easy-htmlelement'
import { hr, rhombus, titlebar } from './utils/svg-elements'
import { render } from './utils/timeline'
import './scss/2/2.scss'

const graph = element()
const mask = elementSVG('mask').attrs({ id: 'main-background-mask' })

element(document.body).content(
  element('main').content(
    graph.at('graph'),
    element().at('highlights').content(
      elementSVG().attrs({ width: 0, height: 0 }).content(elementSVG('defs').content(mask)),
      element('h2').content('Career Highlights').at('title'),
      section('highlights').content(
        ...highlights.map(({ content, dates, numbers, headline }) => article('highlight').content(
          element('h3').content(headline).at('headline'),
          element('time').content(dates).at('dates'),
          element('p').content(content).at('content'),
          div(
            lightest(hr({ height: 9, reverse: true, tail: 'short' })),
            ...numbers.map(parseStat).flatMap(em => [lightest(rhombus(6)), em]).slice(1),
          ).at('numbers'),
        )),
      ),
    ),
  ),
  element('footer').cls('inverse').content(
    lighter('TECH STACK').at('techstack-hint'),
    article('tech-stack').at('techstack').content(...Object.entries(techstack).flatMap(([category, items]) => [
      light(category.toUpperCase()).cls('section-title'),
      div(...items.flatMap(i => [rhombus(6), i]).slice(1)),
    ])),
    light('FIND LATEST AT').at('qrcode-hint'),
    element('img').at('qrcode').attrs({
      src: `data:image/svg+xml;utf8,${encodeURIComponent(await qrcode.toString(
        `ccjmne.sh/${pkg.name}`,
        { type: 'svg', errorCorrectionLevel: 'L', margin: 0, color: { dark: '#eeee', light: '#0000' } },
      ))}`,
    }),
  ),
)

document.fonts.ready.then(async function () {
  const { top, height }                = document.querySelector('[grid-area=highlights]')!.getBoundingClientRect()
  const { top: ttop, height: theight } = document.querySelector('main h2')!.getBoundingClientRect()
  const highlights = [...document.querySelectorAll('[grid-area=headline]')]
    .map(e => e.getBoundingClientRect())
    .map(({ top: t, height: h }) => t - top + h / 2)

  graph.content(...render(timeline, highlights, height).flat())
  mask.content(
    elementSVG('rect').attrs({ x: 0, y: 0, width: 9999, height: 9999, fill: '#fff' }),
    titlebar({ seed: 42, x: 500, y: ttop, h: theight, align: 'right', separator: false }),
  )
})

function parseStat(stat: string): EasyHTMLElement {
  const [pre, em, post] = stat.split('*')
  const [l, num, r] = em.split(/((?:\d+[,.])*\d+%?)/)
  return span(pre, element('strong').content(l, span(num).cls('num'), r), post).cls('stat')
}
