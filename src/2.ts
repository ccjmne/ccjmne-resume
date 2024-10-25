import EasyHTMLElement, { article, div, element, elementSVG, light, lighter, lightest, section, span } from 'utils/easy-htmlelement'

import './scss/2/2.scss'
import profile from 'profile'
import pkg from '../package.json'
import qrcode from 'qrcode'
import { MatchArrayWGroups } from 'types'
import { render } from 'utils/timeline'
import { hr, rhombus, titlebar } from 'utils/svg-elements'

const { highlights, techstack, timeline } = profile

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
            ...numbers.map(parseStat).flatMap(em => [lightest(rhombus(6)), em]).slice(1)
          ).at('numbers'),
        ))
      ),
    ),
  ),
  element('footer').cls('inverse').content(
    lighter('TECH STACK').at('techstack-hint'),
    article('tech-stack').at('techstack').content(...Object.entries(techstack).flatMap(([category, items]) => [
      light(category.toUpperCase()).cls('section-title'),
      div(...items.flatMap(i => [rhombus(6), i]).slice(1))
    ])),
    light('FIND LATEST AT').at('qrcode-hint'),
    element('img').at('qrcode').attrs({
      src: `data:image/svg+xml;utf8,${encodeURIComponent(await qrcode.toString(
        `ccjmne.github.io/${pkg.name}`,
        { type: 'svg', errorCorrectionLevel: 'L', margin: 0, color: { dark: '#eeee', light: '#0000' } }
      ))}`
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
  function strong(num?: string): (string | EasyHTMLElement)[] {
    const [l, r] = em.split(num!)
    return num ? [l, span(num).cls('num'), r] : [em]
  }

  // TODO: Can probably be nicer, leveraging String#split on a RegExp that contains a capturing group
  // See https://262.ecma-international.org/5.1/#sec-15.5.4.14
  const { pre, em, post } = (/^(?<pre>.*)[*](?<em>.*?)[*](?<post>.*)$/s.exec(stat) as MatchArrayWGroups<'pre' | 'em' | 'post'>)!.groups
  return span(pre, element('strong').content(...strong(/(?<=\s|^)((?:\d+,)*\d+%?)(?=\s|$)/.exec(em)?.[0])), post).cls('stat')
}
