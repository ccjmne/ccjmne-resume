import EasyHTMLElement, { article, div, element, elementSVG, light, lighter, lightest, section, span } from 'utils/easy-htmlelement'

import './scss/2/2.scss'
import profile from './profile.json'
import qrcode from 'qrcode'
import { MatchArrayWGroups } from 'types'
import { render } from 'utils/timeline'
import { hr, rhombus, titlebar } from 'utils/svg-elements'

const { highlights, techstack, timeline } = profile

const graph = element()
const qcode = element('img')
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
    qcode.at('qrcode'),
  ),
)

// TODO: prefix with https://, move/rename project to github.com/ccjmne/resume (drop ccjmne- prefix in project name)
// TODO: pass colours to generator, if possible?
// TODO: consider using toDataURL?
// TODO: consider using a proper SVG w/ currentColor for fill?
// TODO: otherwise, should use $light-bg for fill anyways (get from SCSS)
const data = await qrcode.toString('ccjmne.github.io/ccjmne-resume', { type: 'svg', errorCorrectionLevel: 'L', version: 2, margin: 0 })
qcode.attrs({ height: 'auto', src: `data:image/svg+xml;utf8,${data.replace(/#f+/, 'transparent').replace(/#0+/, encodeURIComponent('#eee'))}` })

document.fonts.ready.then(async function () {
  const { top, height }                = document.querySelector('[grid-area=highlights]')!.getBoundingClientRect()
  const { top: ttop, height: theight } = document.querySelector('main h2')!.getBoundingClientRect()
  const highlights = [...document.querySelectorAll('[grid-area=headline]')]
    .map(e => e.getBoundingClientRect())
    .map(({ top: t, height: h }) => t - top + h / 2)

  const [svg, labels] = render(timeline, highlights, height)
  graph.content(svg, ...labels)
  mask.content(
    elementSVG('rect').attrs({ x: 0, y: 0,    width: 9999, height: 9999, fill: '#fff' }),
    titlebar({ seed: 42, x: 500, y: ttop, h: theight, align: 'right', separator: false }),
  )
})

function parseStat(stat: string): EasyHTMLElement {
  function strong(num?: string): (string | EasyHTMLElement)[] {
    const [l, r] = em.split(num!)
    return num ? [l, span(num).cls('num'), r] : [em]
  }

  const { pre, em, post } = (/^(?<pre>.*)[*](?<em>.*?)[*](?<post>.*)$/s.exec(stat) as MatchArrayWGroups<'pre' | 'em' | 'post'>)!.groups
  return span(pre, element('strong').content(...strong(/(?<=\s|^)((?:\d+,)*\d+%?)(?=\s|$)/.exec(em)?.[0])), post).cls('stat')
}
