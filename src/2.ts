import { article, div, element, elementSVG, lightest, section, span } from "utils/easy-htmlelement"

import './scss/2/2.scss'
import profile from './profile.json'
import qrcode from 'qrcode'
import { MatchArrayWGroups } from "types"
import { render } from "utils/timeline"
import { hr, rhombus, titlebar } from "utils/svg-elements"

const { highlights, timeline } = profile

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
          span(dates).at('dates'),
          element('p').content(content).at('content'),
          div(
            lightest(hr({ height: 9, reverse: true, tail: 'short' })),
            ...numbers
              .map(num => (/^(?<pre>.*)[*](?<n>.*)[*](?<post>.*)$/s.exec(num) as MatchArrayWGroups<'pre' | 'n' | 'post'>).groups)
              .map(({ pre, n, post }) => span(pre, element('strong').content(n), post).cls('stat'))
              .flatMap(n => [lightest(rhombus(6)), n]).slice(1)
          ).at('numbers'),
        ))
      ),
    ),
  ),
  element('footer').cls('inverse').content(
    span('find latest at:').at('qrcode-hint'),
    qcode.at('qrcode'),
  ),
)

// TODO: prefix with https://, move/rename project to github.com/ccjmne/resume (drop ccjmne- prefix in project name)
const data = await qrcode.toString('ccjmne.github.io/ccjmne-resume', { type: 'svg', errorCorrectionLevel: 'L', version: 2, margin: 0 })
qcode.attrs({ height: 'auto', src: `data:image/svg+xml;utf8,${data.replace(/#f+/, 'transparent').replace(/#0+/, encodeURIComponent('#eee'))}` })

document.fonts.ready.then(async function () {
  const { top, height }                = document.querySelector('[grid-area=highlights]')!.getBoundingClientRect()
  const { top: ftop }                  = document.querySelector('footer')!.getBoundingClientRect()
  const { top: ttop, height: theight } = document.querySelector('main h2')!.getBoundingClientRect()
  const highlights = [...document.querySelectorAll('[grid-area=headline]')]
    .map(e => e.getBoundingClientRect())
    .map(({ top: t, height: h }) => t - top + h / 2)

  const [svg, labels] = render(timeline, highlights, height)
  graph.content(svg, ...labels)
  mask.content(
    elementSVG('rect').attrs({ x: 0, y: 0,    width: 9999, height: 9999, fill: '#fff' }),
    elementSVG('rect').attrs({ x: 0, y: ftop, width: 9999, height: 9999, fill: '#000' }),
    // This actually would "hollow out" the SVG instead of printing it in (off-)white.
    //element(((new DOMParser().parseFromString(data.replace(/#f+/, 'transparent').replace(/#0+/, encodeURIComponent('#000')), 'image/svg+xml')).querySelector('path:last-child') as SVGPathElement))
    //  .attrs({ stroke: '#fff', transform: 'translate(669 998.171875) scale(4)' }),
    titlebar({ seed: 42, x: 500, y: ttop, h: theight, align: 'right', separator: false }),
  )
})
